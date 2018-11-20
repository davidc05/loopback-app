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

    IpRange.getIpDetailRangesByIspName = function(ispName, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?ISP='+ispName.replace(/&/gi, '%26')+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
        });
    };
    IpRange.remoteMethod(
        'getIpDetailRangesByIspName', {
            accepts: {
                arg: 'ispName',
                type:'string'
            },
            http: {
                path: '/getIpDetailRangesByIspName',
                verb: 'get'
            },
            returns: {
                arg: 'ipRanges',
                type: 'array'
            }
        }
    );

    IpRange.getIpDetailRangesByNetworkGroup = function(networkGroup, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?NetworkGroup='+networkGroup+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
        });
    };
    IpRange.remoteMethod(
        'getIpDetailRangesByNetworkGroup', {
            accepts: {
                arg: 'networkGroup',
                type:'string'
            },
            http: {
                path: '/getIpDetailRangesByNetworkGroup',
                verb: 'get'
            },
            returns: {
                arg: 'ipRanges',
                type: 'array'
            }
        }
    );

    IpRange.getIpDetailRangesByBlacklistNeighbors = function(blacklistNeighbors, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?IP='+blacklistNeighbors+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose&listneighbors=true&ipnotation=string', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
        });
    };
    IpRange.remoteMethod(
        'getIpDetailRangesByBlacklistNeighbors', {
            accepts: {
                arg: 'blacklistNeighbors',
                type:'string'
            },
            http: {
                path: '/getIpDetailRangesByBlacklistNeighbors',
                verb: 'get'
            },
            returns: {
                arg: 'ipRanges',
                type: 'array'
            }
        }
    );
};
