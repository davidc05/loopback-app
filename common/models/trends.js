'use strict';
const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
    projectId: 'carbon-aquifer-220218',
});

module.exports = function(Trends) {
    Trends.watchlistByThreatlevel = function(userEmail, cb) {
        // Watchlist by Threat level
        const sqlQuery = `SELECT _id as id, queryName, AVG(ips.threat_potential_score_pct) as avg_threat_score
            FROM musubu_watchlist.savedSearch, 
            UNNEST(ips) as ips
            WHERE userEmail = "${userEmail}"
            GROUP BY _id, queryName
            ORDER BY avg_threat_score DESC`;

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

    Trends.remoteMethod(
        'watchlistByThreatlevel', {
            accepts: {
                arg: 'userEmail',
                type: 'string',
            },
            http: {
                path: '/watchlistByThreatlevel',
                verb: 'get',
            },
            returns: {
                arg: 'trends',
                type: 'object',
            },
        }
    );
};
