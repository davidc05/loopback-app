'use strict';
var request = require('request');

module.exports = function(User) {
    User.subscribeWithMailChimps = (email_address, status, merge_fields, cb) =>{
        console.log(email_address);
        console.log(status);
        console.log(merge_fields.FNAME);
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
