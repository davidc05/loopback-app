var path = require('path'),
fs = require("fs");
exports.privateKey = fs.readFileSync(path.join(__dirname, '/etc/nginx/ssl/privatekey.pem')).toString();
exports.certificate = fs.readFileSync(path.join(__dirname, '/etc/nginx/ssl/certificate.pem')).toString();