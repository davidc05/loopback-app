var request = require('request');
const ipRangesService = require('../services/ipRangesService');
const serverConfig = require('../../server/server-config')
const apiUrl = `${serverConfig.host}:${serverConfig.port}/api/MusubuAPI/Musubu?`;

module.exports = function(IpRange) {
  IpRange.getIpRangeByNetwork = (networkName, networkType, networkGroup, page, pageBy, notation, cb) => {
    ipRangesService.knownNetworkLookup(networkName, networkType, networkGroup, 
      page, pageBy, notation, cb);
  }
  IpRange.remoteMethod(
    'getIpRangeByNetwork', {
      accepts: [
        {
          arg: 'networkName',
          type: 'string',
        },
        {
          arg: 'networkType',
          type: 'string',
        },
        {
          arg: 'networkGroup',
          type: 'string',
        },
        {
          arg: 'page',
          type: 'number',
        },
        {
          arg: 'pageBy',
          type: 'number',
        },
        {
          arg: 'notation',
          type: 'string',
        }
      ],
      http: {
        path: '/getIpRangeByNetwork',
        verb: 'get',
      },
      returns: {
        arg: 'ipRanges',
        type: 'object',
      },
    }
);


  IpRange.getIpDetailRangesByNetworkName = function(networkName, pageNum, cb) {
    request(
      `${apiUrl}NetworkName=${networkName}&key=${serverConfig.apiKey}&format=JSON&page=${pageNum}&level=verbose`,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(null, JSON.parse(body));
        }
      });
  };
  IpRange.remoteMethod(
      'getIpDetailRangesByNetworkName', {
        accepts: [
          {
            arg: 'networkName',
            type: 'string',
          },
          {
            arg: 'pageNum',
            type: 'string',
          },
        ],
        http: {
          path: '/getIpDetailRangesByNetworkName',
          verb: 'get',
        },
        returns: {
          arg: 'ipRanges',
          type: 'array',
        },
      }
  );

  IpRange.getIpDetailRangesByNetworkType = function(networkType, pageNum, cb) {
    request(
      `${apiUrl}NetworkType=${networkType}&key=${serverConfig.apiKey}&format=JSON&page=${pageNum}&level=verbose`,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(null, JSON.parse(body));
        }
      });
  };
  IpRange.remoteMethod(
      'getIpDetailRangesByNetworkType', {
        accepts: [
          {
            arg: 'networkType',
            type: 'string',
          },
          {
            arg: 'pageNum',
            type: 'string',
          },
        ],
        http: {
          path: '/getIpDetailRangesByNetworkType',
          verb: 'get',
        },
        returns: {
          arg: 'ipRanges',
          type: 'array',
        },
      }
  );

  IpRange.getIpRangeByIsp = (isp, page, pageBy, cb) => {
    ipRangesService.ispLookup(isp, 
      page, pageBy, cb);
  }
  IpRange.remoteMethod(
    'getIpRangeByIsp', {
      accepts: [
        {
          arg: 'isp',
          type: 'string',
        },
        {
          arg: 'page',
          type: 'number',
        },
        {
          arg: 'pageBy',
          type: 'number',
        }
      ],
      http: {
        path: '/getIpRangeByIsp',
        verb: 'get',
      },
      returns: {
        arg: 'ipRanges',
        type: 'object',
      },
    }
);


  IpRange.getIpDetailRangesByIspName = function(ispName, pageNum, cb) {
    request(
      `${apiUrl}ISP=${ispName.replace(/&/gi, '%26')}&key=${serverConfig.apiKey}&format=JSON&page=${pageNum}&level=verbose`,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(null, JSON.parse(body));
        }
      });
  };
  IpRange.remoteMethod(
      'getIpDetailRangesByIspName', {
        accepts: [
          {
            arg: 'ispName',
            type: 'string',
          },
          {
            arg: 'pageNum',
            type: 'string',
          },
        ],
        http: {
          path: '/getIpDetailRangesByIspName',
          verb: 'get',
        },
        returns: {
          arg: 'ipRanges',
          type: 'array',
        },
      }
  );

  IpRange.getIpDetailRangesByNetworkGroup = function(networkGroup, pageNum, cb) {
    request(
      `${apiUrl}?NetworkGroup=${networkGroup}&key=${serverConfig.apiKey}&format=JSON&page=${pageNum}&level=verbose`,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(null, JSON.parse(body));
        }
      });
  };
  IpRange.remoteMethod(
      'getIpDetailRangesByNetworkGroup', {
        accepts: [
          {
            arg: 'networkGroup',
            type: 'string',
          },
          {
            arg: 'pageNum',
            type: 'string',
          },
        ],
        http: {
          path: '/getIpDetailRangesByNetworkGroup',
          verb: 'get',
        },
        returns: {
          arg: 'ipRanges',
          type: 'array',
        },
      }
  );

  IpRange.getIpDetailRangesByBlacklistNeighbors = function(blacklistNeighbors, cb) {
    request(
      `${apiUrl}IP=${blacklistNeighbors}&key=${serverConfig.apiKey}&format=JSON&level=verbose&listneighbors=true&ipnotation=string`,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          cb(null, JSON.parse(body));
        }
      });
  };
  IpRange.remoteMethod(
      'getIpDetailRangesByBlacklistNeighbors', {
        accepts: {
          arg: 'blacklistNeighbors',
          type: 'string',
        },
        http: {
          path: '/getIpDetailRangesByBlacklistNeighbors',
          verb: 'get',
        },
        returns: {
          arg: 'ipRanges',
          type: 'array',
        },
      }
  );
};
