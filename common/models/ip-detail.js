'use strict';
var request = require('request');

module.exports = function(IpDetail) {
    IpDetail.getIpDetailFromMusubuAPI = function(ip, cb) {
        request('https://api.musubu.io/MusubuAPI/Musubu?IP='+ip+'&key=b8be9647f17756acbb75ffd254b50594&format=JSON&level=verbose', function (error, response, body) {
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
    IpDetail.getIpsDetail = function(ips, cb) {
        var ipDetailPromises = [];
        for(var i in ips){
            var promise = new Promise(
                (resolve, reject) => {
                    request('https://api.musubu.io/MusubuAPI/Musubu?IP='+ips[i]+'&key=b8be9647f17756acbb75ffd254b50594&format=JSON&level=verbose', function (error, response, body) {
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
