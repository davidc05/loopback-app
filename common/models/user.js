'use strict';
var request = require('request');

module.exports = function(User) {
    User.validatesInclusionOf('subscriptionPlan', {in: ['free', 'small', 'medium', 'large']});

    User.getOktaUser = (userId, cb) => {
        request.get({
            headers: {
                "Acccept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "SSWS 00Zj1am-DZcSHMYVSv0XF6tZzBSvqwLEAUab5sUy9g" 
            },
            url: 'https://dev-695454.oktapreview.com/api/v1/users/' + userId
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
            else{
                cb(error, response);
            }
        });
    }
    User.remoteMethod(
        'getOktaUser', {
            accepts: [
                {
                    arg: 'userId',
                    type:'string',
                }
            ],
            http: {
                path: '/getOktaUser',
                verb: 'get'
            },
            returns: {
                arg: 'user',
                type: 'object'
            }
        }
    );

    User.subscribeWithMailChimps = (email_address, status, merge_fields, cb) =>{
        request.post({
            headers: { 
                "Authorization": "apikey e76626b3364bcb99c6235f3231af615b-us19" 
            },
            url: 'https://us19.api.mailchimp.com/3.0/lists/c3623c3f15/members/',
            body: JSON.stringify({
                email_address: email_address,
                status: status,
                merge_fields: merge_fields
            })
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, JSON.parse(body));
            }
            else{
                cb(error, response);
            }
        });
    }
    User.remoteMethod(
        'subscribeWithMailChimps', {
            accepts: [
                {
                    arg: 'email_address',
                    type:'string',
                },
                {
                    arg: 'status',
                    type:'string',
                },
                {
                    arg: 'merge_fields',
                    type:'object',
                }
            ],
            http: {
                path: '/postUserToMailChimps',
                verb: 'post'
            },
            returns: {
                arg: 'id',
                type: 'object'
            }
        }
    );
};
