const mysql = require("mysql");
const async = require('async');
const dbConfig = require("../configs/dbConfig.json");
module.exports = {
    checkKey: (key) => {
        var sqlCheckKeyEnabled = "SELECT enabled from CUSTOMERDB.cust_keys where api_key = '" + key + "'";
        var connection = mysql.createConnection(dbConfig);
        connection.connect();
        var promise = new Promise(
            (resolve, reject) => {
                connection.query(sqlCheckKeyEnabled, function (error, results, fields) {
                    if (error) return reject(error);
                    try{
                        if(!results || results.length === 0){
                            var error = new Error("API Key invalid or not provided.");
                            error.name = "Forbidden"
                            error.statusCode = 403;
                            reject(error);
                        }
                        else{
                            resolve(results)
                        }
                    }
                    catch(e){
                        reject(e);
                    }
                });
            }
        )
        return promise;
    },
    checkKeyAndLimits: (key) => {
        
    }
}