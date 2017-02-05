'use strict';

const fs = require("fs");

exports.g_bDebug = true;
exports.my_port = process.env.PORT //4443;

exports.options = {
    key: fs.readFileSync(__dirname + "/key.pem"),
    cert: fs.readFileSync(__dirname + "/key-cert.pem")
}

exports.proxyHost = "smailblock.info"//"localhost";
exports.proxyPort = "10443"//"8335";
