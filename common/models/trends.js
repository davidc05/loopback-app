'use strict';
const {BigQuery} = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: 'carbon-aquifer-220218',
});

module.exports = function(Trends) {
  Trends.getTrends = function(userEmail, cb) {
        // Watchlist by Threat level
    const watchlistbyThreatlevel = `SELECT _id as id, queryName, AVG(ips.threat_potential_score_pct) as avg_threat_score
            FROM musubu_watchlist.savedSearch, 
            UNNEST(ips) as ips
            WHERE userEmail = "${userEmail}"
            GROUP BY _id, queryName
            ORDER BY avg_threat_score DESC`;

        //  Top 10 IPs by threat score - last 90 days
    const top10IPsbyThreat = `SELECT ips.ipaddress, ips.threat_potential_score_pct, ips.blacklist_class
            FROM musubu_watchlist.savedSearch, 
            UNNEST(ips) as ips
            WHERE userEmail = "${userEmail}" and createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
            GROUP BY ips.ipaddress, ips.threat_potential_score_pct, ips.blacklist_class
            ORDER BY ips.threat_potential_score_pct DESC
            LIMIT 10`;

        // Threat Type Breakdown - Last 90 Days
    const threatTypeBreakdown = `
          WITH countsByClass AS (
            SELECT 
                ss.queryname as queryName,
                bc.blacklist_class as blacklistClass,
                SUM(1) as blacklistClassCount
            FROM 
              musubu_watchlist.savedSearch ss,
              musubu_watchlist.blacklistClasses bc,
              UNNEST(ss.ips) as ips
            WHERE 
              ss.userEmail = "${userEmail}"
              AND ips.blacklist_class = bc.blacklist_class
              AND createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
            GROUP BY queryName, blacklistClass
            ),
            totalCountByQueryName as (
              SELECT 
                ss.queryname as queryName,
                SUM(1) as blacklistClassTotalCount
            FROM 
              musubu_watchlist.savedSearch ss,
              musubu_watchlist.blacklistClasses bc,
              UNNEST(ss.ips) as ips
            WHERE
              ss.userEmail = "${userEmail}"
              AND ips.blacklist_class = bc.blacklist_class
              AND createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
            GROUP BY queryName
          )

          select
            ls.queryName,
            ls.blacklistClass,
            (ls.blacklistClassCount / rs.blacklistClassTotalCount) as blacklistClassPct
          from countsByClass ls, totalCountByQueryName rs
          WHERE ls.queryName = rs.queryName
          ORDER BY ls.queryName, blacklistClassPct desc;
        `;

        // threat score volatility
    const threatScoreVolatility = `
          WITH rawData AS (
            SELECT
                DISTINCT ss.queryname,
                ips.ipaddress as ipAddress,
                IFNULL(ips.threat_potential_score_pct, 0) as threatScore,
                EXTRACT(DATE from createdon) as createdon,
                DATE_SUB(EXTRACT(DATE from createdon), INTERVAL 1 DAY) as yesterdaysDate
            FROM
              musubu_watchlist.savedSearch ss,
              UNNEST(ss.ips) as ips
            WHERE
              ss.userEmail = "${userEmail}"
              AND createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
            ),
            aggregated_data AS (SELECT
                DISTINCT ls.queryname,
                AVG(ls.threatScore) as tsToday,
                ls.createdon,
                rs.yesterdaysDate,
                AVG(rs.threatScore) as tsYesterday
              FROM rawData ls
              LEFT JOIN rawData rs ON
                ls.queryname = rs.queryname
                AND ls.ipAddress = rs.ipAddress
              GROUP BY ls.queryname, ls.createdon, rs.yesterdaysDate
            )

          SELECT
            queryname,
            createdon,
            tsToday,
            (tsToday - tsYesterday) as threatDeltaYesterday
          FROM aggregated_data
          ORDER BY createdon desc;
        `;

        // Watchlist trends - last 90 days
    const watchlistTrends = `
          SELECT AVG(ips.threat_potential_score_pct) as avg, queryName, createdOn
            FROM musubu_watchlist.savedSearch,
              UNNEST(ips) as ips
            WHERE userEmail = "${userEmail}" and createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
            GROUP BY queryName, createdOn
        `;

        // IP hot list
    const ipHotList = `
          WITH query1 AS (
            SELECT
                ips.ipaddress as ipAddress,
                IFNULL(bc.severity_rating, 0) as severityRating,
                IFNULL(ips.blacklist_network_neighbor_cnt, 0) as neighborCount,
                IFNULL(ips.blacklist_observations, 0) as blacklistCount,
                ips.threat_potential_score_pct as threatScore,
                ips.blacklist_class as blacklistClass
            FROM
              musubu_watchlist.savedSearch ss,
              musubu_watchlist.blacklistClasses bc,
              UNNEST(ss.ips) as ips
            WHERE
              ips.blacklist_class = bc.blacklist_class
              AND ss.userEmail = "${userEmail}"
            )

            SELECT
              query1.ipAddress as ipAddress,
              (severityRating + neighborCount + blacklistCount + threatScore) as severityScore,
              query1.blacklistClass as blacklistClass
            FROM query1
            GROUP BY ipAddress, severityScore, blacklistClass
            ORDER BY severityScore desc;
        `;

    const promistList = [
      bigquery.query({query: watchlistbyThreatlevel, location: 'US'}).catch(err => err),
      bigquery.query({query: top10IPsbyThreat, location: 'US'}).catch(err => err),
      bigquery.query({query: threatTypeBreakdown, location: 'US'}).catch(err => err),
      bigquery.query({query: threatScoreVolatility, location: 'US'}).catch(err => err),
      bigquery.query({query: watchlistTrends, location: 'US'}).catch(err => err),
      bigquery.query({query: ipHotList, location: 'US'}).catch(err => err),
    ];

    Promise.all(promistList)
            .then(res => {
              cb(null, {
                watchlistbyThreatlevel: res[0][0],
                top10IPsbyThreat: res[1][0],
                threatTypeBreakdown: res[2][0],
                threatScoreVolatility: res[3][0],
                watchlistTrends: res[4][0],
                ipHotList: res[5][0],
              });
            })
            .catch(err => {
              cb(null, err);
            });
  };

  Trends.remoteMethod(
        'getTrends', {
          accepts: {
            arg: 'userEmail',
            type: 'string',
          },
          http: {
            path: '/getTrends',
            verb: 'get',
          },
          returns: {
            arg: 'trends',
            type: 'object',
          },
        }
    );
};
