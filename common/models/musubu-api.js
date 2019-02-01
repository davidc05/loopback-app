var ipRange = require("./ip-range");
var ipDetail = require("./ip-detail");
const ipDetailsService = require('../services/ipDetailsService');
const ipRangesService = require('../services/ipRangesService');
const securityService = require('../services/securityService');
var request = require('request');
const serverConfig = require('../../server/server-config')
const apiUrl = `${serverConfig.host}:${serverConfig.port}/apiKeys/checkKey?`;

module.exports = function(Musubuapi) {
    Musubuapi.Musubu = (ip, format, verbosity, key, listNeighbors, isp, networkName, networkType, networkGroup, page, pageBy, notation, req, cb) => {
        //Check for key
        request(`${apiUrl}key=${key}&ip=${req.ip}`, function (error, response, body) {
            var jsonResponse = JSON.parse(body);
            if (jsonResponse.keyResult && jsonResponse.keyResult.status === "OK") {
                format = "JSON";
                verbosity = verbosity ? verbosity : "terse"
                page = page ? page : 1;
                pageBy = pageBy ? pageBy : 50;
                notation = "dot";
                if(ip){
                    ipDetailsService.getIpDetail(ip, listNeighbors, verbosity, notation, cb);
                }
                else if(networkType || networkName || networkGroup){
                    ipRangesService.knownNetworkLookup(networkName, networkType, networkGroup, page, pageBy, notation, cb)
                }
                else if(isp){
                    ipRangesService.ispLookup(isp, page, pageBy, cb);
                }
                else{
                    var error = new Error("Invalid arguments.");
                    error.name = "Bad Request"
                    error.statusCode = 400;
                    cb(error);
                }
            }
            else{
                cb(null, JSON.parse(body));
            }
        });
    }
    Musubuapi.remoteMethod(
        'Musubu', {
          accepts: [
            {
                arg: 'IP',
                type: 'string',
            },
            {
                arg: 'format',
                type: 'string',
            },
            {
                arg: 'level',
                type: 'string',
            },
            {
                arg: 'key',
                type: 'string',
            },
            {
                arg: 'listneighbors',
                type: 'string',
            },
            {
                arg: 'ISP',
                type: 'string',
            },
            {
                arg: 'NetworkName',
                type: 'string',
            },
            {
                arg: 'NetworkType',
                type: 'string',
            },
            {
                arg: 'NetworkGroup',
                type: 'string',
            },
            {
                arg: 'Page',
                type: 'string',
            },
            {
                arg: 'PageBy',
                type: 'string',
            },
            {
                arg: 'ipNotation',
                type: 'string',
            },
            {
                arg: 'req', 
                type: 'object', 
                'http': {
                    source: 'req'
                }
            }
          ],
          http: {
            path: '/Musubu',
            verb: 'get',
          },
          returns: {
            type: 'object',
            root: true
          },
        }
    );
};
