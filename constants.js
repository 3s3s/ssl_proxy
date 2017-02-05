'use strict';

const fs = require("fs");
const tls = require("tls");

exports.g_bDebug = true;
exports.my_port = process.env.PORT; //4443;

const domains = [
    {'name' : 'smailblock.info', 'port' : '10443'}, 
    {'name' : 'smailcoin.info', 'port' : '11443'}
];

/////////////////////////////////////////////////////////////
exports.GetHostAndPort = function(host)
{
    for (var i=0; i<domains.length; i++)
    {
        if (domains[i].name == host)
            return {'host' : host, 'port' : domains[i].port};
    }
    return {'host' : domains[0].name, 'port' : domains[0].port};
};

function getSecureContext (domain) {
    return tls.createSecureContext({
        key:  fs.readFileSync(__dirname + "/ssl_cert/" + domain + ".key", 'utf8'),
        cert: fs.readFileSync(__dirname + "/ssl_cert/" + domain + ".crt", 'utf8')
      }).context;
}

//read them into memory
const secureContext = function(domains) {
        var ret = {};
        for (var i=0; i<domains.length; i++)
            ret[domains[i].name] = getSecureContext(domains[i].name);
        
        return ret;
    }(domains);

exports.options = {
    SNICallback: function (domain) {
        return secureContext[domain];
    }, //SNICallback is passed the domain name, see NodeJS docs on TLS
    key: fs.readFileSync(__dirname + "/ssl_cert/"+domains[0].name+".key"),
    cert: fs.readFileSync(__dirname + "/ssl_cert/"+domains[0].name+".crt")
}

