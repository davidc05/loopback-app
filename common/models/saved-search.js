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
};
