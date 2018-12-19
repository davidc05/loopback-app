var request = require('request');
const mysql = require("mysql");
const async = require('async');
const ipRangesService = require('../services/ipRangesService');
const ipHelpers = require('../services/ipHelpers');
const dbConfig = require("../configs/dbConfig.json");

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
      `https://api.musubu.io/MusubuAPI/Musubu?NetworkName=${networkName}&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&page=${pageNum}&level=verbose`,
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
      `https://api.musubu.io/MusubuAPI/Musubu?NetworkType=${networkType}&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&page=${pageNum}&level=verbose`,
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
      `https://api.musubu.io/MusubuAPI/Musubu?ISP=${ispName.replace(/&/gi, '%26')}&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&page=${pageNum}&level=verbose`,
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
      `https://api.musubu.io/MusubuAPI/Musubu?NetworkGroup=${networkGroup}&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&page=${pageNum}&level=verbose`,
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
      `https://api.musubu.io/MusubuAPI/Musubu?IP=${blacklistNeighbors}&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose&listneighbors=true&ipnotation=string`,
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
