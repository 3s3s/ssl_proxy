'use strict';

const fs = require("fs");
const tls = require("tls");

exports.g_bDebug = process.env.PORT ? true : false;
exports.my_port = process.env.PORT || 443; //4443;

const domains = [
    {'name' : 'cbd.cryptobank.uk', 'port' : '11443', 'ssl' : 'server'}, 
    {'name' : 'cbe.cryptobank.uk', 'port' : '12443', 'ssl' : 'server'},
    {'name' : 'cbr.cryptobank.uk', 'port' : '13443', 'ssl' : 'server'},
    {'name' : 'cby.cryptobank.uk', 'port' : '14443', 'ssl' : 'server'},
    {'name' : 'cryptobank.uk', 'port' : '60443', 'ssl' : 'server'},
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

function getSecureContext (filename) {
    return tls.createSecureContext({
        key:  fs.readFileSync(__dirname + "/ssl_cert/" + filename + ".key"),
        cert: fs.readFileSync(__dirname + "/ssl_cert/" + filename + ".crt")
      }).context;
}

//read them into memory
const secureContext = function(domains) {
        var ret = {};
        for (var i=0; i<domains.length; i++)
            ret[domains[i].name] = getSecureContext(domains[i].ssl);
        
        return ret;
    }(domains);

exports.options = {
    SNICallback: function (domain, cb) {
        if (secureContext[domain]) {
            if (cb) {
                cb(null, secureContext[domain]);
            } else {
                // compatibility for older versions of node
                return secureContext[domain]; 
            }
        } else {
            throw new Error('No keys/certificates for domain requested');
        }
    }, 
    key: fs.readFileSync(__dirname + "/ssl_cert/"+domains[0].ssl+".key"),
    cert: fs.readFileSync(__dirname + "/ssl_cert/"+domains[0].ssl+".crt")
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";