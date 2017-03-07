'use strict';

const fs = require("fs");
const tls = require("tls");

exports.g_bDebug = true;
exports.my_port = process.env.PORT || 5443; //4443;

const domains = [
    {'name' : 'cbd.cryptobank.uk', 'port' : '11443', 'ssl' : 'server'}, 
    {'name' : 'cbe.cryptobank.uk', 'port' : '12443', 'ssl' : 'server'},
    {'name' : 'cbr.cryptobank.uk', 'port' : '13443', 'ssl' : 'server'},
    {'name' : 'cby.cryptobank.uk', 'port' : '14443', 'ssl' : 'server'},
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
        key:  fs.readFileSync(__dirname + "/ssl_cert/" + domain + ".key"),
        cert: fs.readFileSync(__dirname + "/ssl_cert/" + domain + ".crt")
      }).context;
}

//read them into memory
const secureContext = function(domains) {
        var ret = {};
        for (var i=0; i<domains.length; i++)
            ret[domains[i].ssl] = getSecureContext(domains[i].ssl);
        
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

