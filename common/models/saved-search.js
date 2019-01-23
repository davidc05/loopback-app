'use strict';
const moment = require('moment');
const { BigQuery } = require('@google-cloud/bigquery');

module.exports = function(Savedsearch) {

  Savedsearch.savedSearches = function(userEmail, createdDate, cb) {

        const year = moment(createdDate).format('YYYY');
        const month = moment(createdDate).format('MM');
        const day = moment(createdDate).format('DD');

        const currentTimeZone = new Date().getTimezoneOffset() / 60;

        const startDate = moment(new Date(year, month - 1, day, 0, 0, 0).setHours(
            new Date(year, month - 1, day, 0, 0, 0).getHours() - currentTimeZone
        )).toISOString();

        const endDate = moment(
            new Date(year, month - 1, day, 0, 0, 0).setHours(23 - currentTimeZone, 59, 59)
        ).toISOString();

        Savedsearch.find({
            where: {
                and: [
                    {
                        userEmail: userEmail,
                    },
                    {
                        createdOn: {lte: new Date(endDate)},
                    },
                    {
                        createdOn: {gte: new Date(startDate)},
                    },
                ],
            },
        }, function(err, items) {
            if (err) throw err;
            cb(null, items);
        });
  };

  Savedsearch.remoteMethod(
    'savedSearches', {
      accepts: [
        {
          arg: 'userEmail',
          type: 'string',
        },
        {
          arg: 'createdDate',
          type: 'string',
        },
      ],
      http: {
        path: '/savedSearches',
        verb: 'get',
      },
      returns: {
        arg: 'searches',
        type: 'object',
      },
    }
  );

    Savedsearch.watchlistTrends = function(userEmail, cb) {
        const projectId = 'carbon-aquifer-220218';

        const bigquery = new BigQuery({
            projectId: projectId,
        });

        // watchlist trends - last 90 days
        // const sqlQuery = `SELECT AVG(ips.threat_potential_score_pct) as avg, createdOn
        //     FROM musubu_watchlist.savedSearch, 
        //     UNNEST(ips) as ips
        //     WHERE userEmail = "upworkbecker@gmail.com" and createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
        //     GROUP BY createdOn`

        //  Top 10 IPs by threat score - last 90 days
        // const sqlQuery = `SELECT ips.threat_potential_score_pct, ips.blacklist_class
        //     FROM musubu_watchlist.savedSearch, 
        //     UNNEST(ips) as ips
        //     WHERE userEmail = "melanie.masi@vandalssmile.com" and createdOn >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -90 DAY)
        //     GROUP BY ips.threat_potential_score_pct, ips.blacklist_class
        //     ORDER BY ips.threat_potential_score_pct DESC
        //     LIMIT 10`

        // Watchlist by Threat level
        const sqlQuery = `SELECT queryName, AVG(ips.threat_potential_score_pct) as avg_threat_score
            FROM musubu_watchlist.savedSearch, 
            UNNEST(ips) as ips
            WHERE userEmail = "${userEmail}"
            GROUP BY queryName
            ORDER BY avg_threat_score DESC`;
        // const sqlQuery = "SELECT ips FROM musubu_watchlist.savedSearch where useremail = 'upworkbecker@gmail.com'"
        const options = {
            query: sqlQuery,
            location: 'US',
        };
        bigquery.query(options)
            .then(res => {
                cb(null, res[0]);
            })
            .catch(err => {
                cb(null, err);
            });
    };

    Savedsearch.remoteMethod(
        'watchlistTrends', {
            accepts: {
                arg: 'userEmail',
                type: 'string',
            },
            http: {
                path: '/watchlistTrends',
                verb: 'get',
            },
            returns: {
                arg: 'trends',
                type: 'object',
            },
        }
    );
};
