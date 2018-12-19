var request = require('request');
const serverConfig = require('../../server/server-config')
const ipDetailsService = require('../services/ipDetailsService');
const apiUrl = `${serverConfig.host}:${serverConfig.port}/api/MusubuAPI/Musubu?`;

module.exports = function(IpDetail) {
    //Defining endpoints
    IpDetail.getIpDetailFromMusubuAPI = function(ip, cb) {
        request(`${apiUrl}IP=${ip}&key=${serverConfig.apiKey}&format=JSON&level=verbose`, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
        });
    };
    IpDetail.remoteMethod(
        'getIpDetailFromMusubuAPI', {
            accepts: {
                arg: 'ip',
                type:'string'
            },
            http: {
                path: '/ipDetailsMusubu',
                verb: 'get'
            },
            returns: {
                arg: 'ipDetail',
                type: 'string'
            }
        }
    );

    IpDetail.getIpDetail = function(ip, listNeighbors, verbosity, notation, cb) {
        ipDetailsService.getIpDetail(ip, listNeighbors, verbosity, notation, cb);
    }
    IpDetail.remoteMethod(
        'getIpDetail', {
            accepts: [
                {
                    arg: 'ip',
                    type:'string'
                },
                {
                    arg: 'listNeighbors',
                    type:'boolean'
                },
                {
                    arg: 'verbosity',
                    type: 'string'
                },
                {
                    arg: 'notation',
                    type: 'string'
                }
                // {
                //     arg: 'level',
                //     type:'string',
                //     http: { source: 'body' }
                // },
                // {
                //     arg: 'apikey',
                //     type:'string',
                //     http: { source: 'body' }
                // },
            ],
            http: {
                path: '/getIpDetail',
                verb: 'post'
            },
            returns: {
                arg: 'ipsDetail',
                type: 'array'
            }
        }
    )

    IpDetail.getIpsDetail = function(ips, cb) {
        var ipDetailPromises = [];
        for(var i in ips){
            var promise = new Promise(
                (resolve, reject) => {
                    request(`${apiUrl}IP=${ips[i]}&key=${serverConfig.apiKey}&format=JSON&level=verbose`, function (error, response, body) {
                        if (error || response.statusCode != 200) {
                            return reject(error);
                        }
                        try{
                            resolve(JSON.parse(body));
                        }
                        catch(e){
                            reject(e);
                        }
                    });
                }
            )
            ipDetailPromises.push(promise);
        }

        Promise.all(ipDetailPromises).then(
            values => {
                cb(null, values);
            }
        )
    };
    IpDetail.remoteMethod(
        'getIpsDetail', {
            accepts: {
                arg: 'ips',
                type:'array',
                http: { source: 'body' }
            },
            http: {
                path: '/getIpsDetail',
                verb: 'post'
            },
            returns: {
                arg: 'ipsDetail',
                type: 'array'
            }
        }
    );
};
