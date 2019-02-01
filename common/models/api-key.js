'use strict';
var request = require('request');
const moment = require('moment');
const uuidAPIKey = require('uuid-apikey');
const localIp = "127.0.0.1";
const serverConfig = require('../../server/server-config')
const userApi = `${serverConfig.host}:${serverConfig.port}/users/`;

module.exports = function(Apikey) {
    Apikey.observe('before save', function(ctx, next) {
        if (ctx.instance && !ctx.instance.key) {
            var apiKeyObj = uuidAPIKey.create();
            ctx.instance.key = apiKeyObj.apiKey;
        }
        next();
    });

    Apikey.checkKey = function(key, ip, req, cb) {
        if(req.ip === localIp){
            if(key && key.length !== 0){
                Apikey.find({
                    where: {
                        key: key
                    }
                }, (err, result) => {
                    if(result && result.length !== 0){
                        var apiKey = result[0];
                        var expiresAt = moment(apiKey.expiresAt);
                        var now = (new Date()).getTime();
                        //Check for key expiration date
                        if(expiresAt > now){
                            if(apiKey.totalCalls < apiKey.callLimit){
                                //Check if this key uses whitelists and if it does, check the IP whitelist
                                if(!apiKey.isWhitelistEnabled || (apiKey.whitelistIps && apiKey.whitelistIps.includes(ip))){
                                    //Now that all checks are done, make sure we increase the totalCalls by 1.
                                    Apikey.updateAll({id: apiKey.id}, {totalCalls: apiKey.totalCalls + 1}, (err, result) =>{
                                        if(!err){
                                            cb(null, {
                                                key: apiKey.key,
                                                status: "OK"
                                            })
                                        }
                                        else{
                                            var error = new Error("Key could not be authenticated.");
                                            error.name = "Forbidden"
                                            error.statusCode = 403;
                                            error.stack = undefined;
                                            cb(error);
                                        }
                                    })
                                }
                                else{
                                    var error = new Error(`IP origin ${ip} not authorized.`);
                                    error.name = "Forbidden"
                                    error.statusCode = 403;
                                    error.stack = undefined;
                                    cb(error);
                                }  
                            }
                            else{
                                var error = new Error("API key limit has been exceeded.");
                                error.name = "Forbidden"
                                error.statusCode = 403;
                                error.stack = undefined;
                                cb(error);
                            }
                        }
                        else{
                            var error = new Error("API key has expired.");
                            error.name = "Forbidden"
                            error.statusCode = 403;
                            error.stack = undefined;
                            cb(error);
                        }
                        
                        
                    }
                    else{
                        var error = new Error("API Key invalid or not provided.");
                        error.name = "Forbidden"
                        error.statusCode = 403;
                        error.stack = undefined;
                        cb(error);
                    }
                })
            }
            else{
                var error = new Error("API Key invalid or not provided.");
                error.name = "Forbidden"
                error.statusCode = 403;
                error.stack = undefined;
                cb(error);
            }
        }
        else {
            var error = new Error("You're not authorized to access this.");
            error.name = "Forbidden"
            error.statusCode = 403;
            error.stack = undefined;
            cb(error);
        }
    };
    Apikey.remoteMethod(
        'checkKey', {
            accepts: [{
                arg: 'key',
                type:'string'
            },
            {
                arg: 'ip',
                type:'string'
            },
            {
                arg: 'req', 
                type: 'object', 
                'http': {
                    source: 'req'
                }
            }],
            http: {
                path: '/checkKey',
                verb: 'get'
            },
            returns: {
                arg: 'keyResult',
                type: 'string'
            }
        }
    );

    //Creates an API key for a user, either if the user exists on the DB or not.
    Apikey.createKeyForUser = function(email, cb) {
        if(email && email.length !== 0){
            var userFilter = {
                where: {
                    email: email
                }
            };
            request(`${userApi}findOne?filter=${JSON.stringify(userFilter)}`, function (error, response, body) {
                //Function to create API key
                var createApiKey = userId => {
                    var expiresAt = moment().add('years', 1).toDate();
                    var newApiKey = {
                        userId: userId,
                        expiresAt: expiresAt,
                        callLimit: 20000
                    }
                    Apikey.create(newApiKey, function(err, result){
                        cb(null, result);
                    })
                }
                var currentUserResponse = JSON.parse(body);
                if(!currentUserResponse.error){
                    createApiKey(currentUserResponse.id)
                }
                else{
                    var newUser = {
                        email: email
                    }
                    request.post({
                        url: `${userApi}`,
                        form: newUser
                    }, 
                    function (error, response, body) {
                        var newUserResponse = JSON.parse(body);
                        createApiKey(newUserResponse.id);
                    });
                }
            });
        }
        else{
            var error = new Error("Email not provided.");
            error.name = "Bad request"
            error.statusCode = 400;
            error.stack = undefined;
            cb(error);
        }
    }
    Apikey.remoteMethod(
        'createKeyForUser', {
            accepts: [{
                arg: 'email',
                type:'string'
            }],
            http: {
                path: '/createKeyForUser',
                verb: 'get'
            },
            returns: {
                type: 'object',
                root: true
            }
        }
    )
};