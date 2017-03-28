'use strict';

const fs = require("fs");
const tls = require("tls");

exports.g_bDebug = process.env.PORT ? true : false;
exports.my_portHTTPS = exports.g_bDebug ? 4443 : 443; //process.env.PORT || 443; //4443;
exports.my_portHTTP = process.env.PORT || 80;

const domains = [
    {'name' : 'langtest.ru', 'port' : '80', 'ssl' : 'false', 'keyname' : 'server'}, 
    {'name' : 'multicoins.org', 'port' : '9443', 'ssl' : 'true', 'keyname' : 'server'}
];

/////////////////////////////////////////////////////////////

exports.GetHostAndPort2 = function(host)
{
    for (var i=0; i<domains.length; i++)
    {
        if (domains[i].name == host)
            return domains[i];
    }
    
    return domains[0];
}

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
            ret[domains[i].name] = getSecureContext(domains[i].keyname);
        
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
    key: fs.readFileSync(__dirname + "/ssl_cert/server.key"),
    cert: fs.readFileSync(__dirname + "/ssl_cert/server.crt")
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";