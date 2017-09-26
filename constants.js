'use strict';

const fs = require("fs");
const tls = require("tls");

exports.g_bDebug = process.env.PORT ? true : false;
exports.my_portHTTPS = exports.g_bDebug ? 4443 : 443; //process.env.PORT || 443; //4443;
exports.my_portHTTP = process.env.PORT || 80;

const cert = '/etc/letsencrypt/live/mc.multicoins.org/fullchain.pem';
const key = '/etc/letsencrypt/live/mc.multicoins.org/privkey.pem';
//const cert = '/home/kzv/langtest/ssl_proxy/ssl_cert/server.crt';
//const key = '/home/kzv/langtest/ssl_proxy/ssl_cert/server.key';

/*const domains = [
//    {'name' : 'langtest.ru', 'port' : '8088', 'ssl' : 'false', 'keyname' : 'server'}, 
//    {'name' : 'multicoins.org', 'port' : '9443', 'ssl' : 'true', 'keyname' : 'server'},
//    {'name' : 'trade.multicoins.org', 'port' : '11443', 'ssl' : 'true', 'keyname' : 'server'},
//    {'name' : 'natcoin.multicoins.org', 'port' : '14443', 'ssl' : 'true', 'keyname' : 'server'},
    {'name' : 'ppc.multicoins.org', 'port' : '15443', 'ssl' : 'true'},
    {'name' : 'ppc-ex.multicoins.org', 'port' : '11443', 'ssl' : 'true'},
    {'name' : 'mc.multicoins.org', 'port' : '16443', 'ssl' : 'true'},
    {'name' : 'mc-ex.multicoins.org', 'port' : '17443', 'ssl' : 'true'},
    {'name' : 'mc-dice.multicoins.org', 'port' : '18443', 'ssl' : 'true'},
    {'name' : 'mc-pool.multicoins.org', 'port' : '8092', 'ssl' : 'false'}
];*/

const domains = [
    {'name' : 'langtest.ru', 'port' : '8088', 'ssl' : 'false'}, //'keyname' : 's
    {'name' : 'multicoins.org', 'port' : '9443', 'ssl' : 'true'}, //'keyname' :
    {'name' : 'trade.multicoins.org', 'port' : '11443', 'ssl' : 'true'},// 'keyn
    {'name' : 'natcoin.multicoins.org', 'port' : '14443', 'ssl' : 'true'},//keyn
    {'name' : 'mc.multicoins.org', 'port' : '16443', 'ssl' : 'true'}//, 'keyname
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

function getSecureContext (keyname, certname) {
    return tls.createSecureContext({
        key:  fs.readFileSync(keyname),
        cert: fs.readFileSync(certname)
      }).context;
}

//read them into memory
const secureContext = function(domains) {
        var ret = {};
        for (var i=0; i<domains.length; i++)
            ret[domains[i].name] = getSecureContext(key, cert)//(domains[i].keyname);
        
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
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";