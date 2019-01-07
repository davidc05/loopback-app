'use strict';
const uuidAPIKey = require('uuid-apikey');

module.exports = function(Apikey) {
    Apikey.observe('before save', function(ctx, next) {
        if (ctx.instance) {
            var apiKeyObj = uuidAPIKey.create();
            ctx.instance.key = apiKeyObj.apiKey;
        }
        next();
    });
};