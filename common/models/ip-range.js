'use strict';
var request = require('request');

module.exports = function(IpRange) {
    IpRange.getIpDetailRangesByNetworkName = function(networkName, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?NetworkName='+networkName+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
        });
    };
    IpRange.remoteMethod(
        'getIpDetailRangesByNetworkName', {
            accepts: {
                arg: 'networkName',
                type:'string'
            },
            http: {
                path: '/getIpDetailRangesByNetworkName',
                verb: 'get'
            },
            returns: {
                arg: 'ipRanges',
                type: 'array'
            }
        }
    );

    IpRange.getIpDetailRangesByNetworkType = function(networkType, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?NetworkType='+networkType+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
        });
    };
    IpRange.remoteMethod(
        'getIpDetailRangesByNetworkType', {
            accepts: {
                arg: 'networkType',
                type:'string'
            },
            http: {
                path: '/getIpDetailRangesByNetworkType',
                verb: 'get'
            },
            returns: {
                arg: 'ipRanges',
                type: 'array'
            }
        }
    );
};
