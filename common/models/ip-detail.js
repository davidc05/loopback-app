var request = require('request');
const mysql = require("mysql");
const async = require('async');
const ipHelpers = require('../services/ipHelpers');
const ipDetailsService = require('../services/ipDetailsService');
const dbConfig = require("../configs/dbConfig.json");

module.exports = function(IpDetail) {
    //Defining endpoints
    IpDetail.getIpDetailFromMusubuAPI = function(ip, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?IP='+ip+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose', function (error, response, body) {
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
                    request('https://api.musubu.io/MusubuAPI/Musubu?IP='+ips[i]+'&key=b9c4896dd776e2e61a937a01aa3d1ac8&format=JSON&level=verbose', function (error, response, body) {
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
                console.log(values);
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
