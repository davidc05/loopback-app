'use strict';
const watchlistService = require('../services/watchlistService');

module.exports = function(Savedsearch) {
  Savedsearch.savedSearches = (userEmail, createdDate, cb) => {
    watchlistService.getWatchlistByDate(userEmail, createdDate, cb);
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
