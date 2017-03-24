'use strict';

const constants = require("./constants");
const url = require('url');
var querystring = require('querystring');

const serverHTTP = require("http").createServer();
const serverHTTPS = require("https").createServer(constants.options);
//const server = constants.g_bDebug ? serverHTTP : serverHTTPS;//require("http").createServer() : require("https").createServer(constants.options);

serverHTTP.listen(constants.my_portHTTP, function(){
    console.log("HTTP Proxy listening on port "+constants.my_portHTTP);
});

serverHTTPS.listen(constants.my_portHTTPS, function(){
    console.log("SSL Proxy listening on port "+constants.my_portHTTPS);
});


serverHTTP.addListener("request", function(request, response) {
    
    console.log("Init HTTP session");
    
    const req = request;
    const res = response;
    
    CommonProxy(req, res);
});


serverHTTPS.addListener("request", function(request, response) {
    
    console.log("Init SSL session");
    
    const req = request;
    const res = response;
    
    CommonProxy(req, res);
});

function CommonProxy(request, response)
{
    const objHostAndPort = constants.GetHostAndPort2(request.headers.host);

    const ph = url.parse(request.url);
    const path = objHostAndPort.path || ph.path;

    const options = {
        port: objHostAndPort.port,
        hostname: objHostAndPort.name,
        method: request.method,
        path: path || '/',
        headers: request.headers
    };
    options.headers.host = objHostAndPort.name;
    
    var proxyRequest = objHostAndPort.ssl == 'true' ? require("https").request(options) : require("http").request(options);
    
    if (request.method == 'POST')
    {
        processPost(request, response, (post_data) => {
            // post the data
            proxyRequest.write(post_data);
            proxyRequest.end();
        });
    }

    proxyRequest.on('response', function(proxyResponse) {
        console.log("Got proxy responce status=" + proxyResponse.statusCode);
        
		response.writeHead(proxyResponse.statusCode, proxyResponse.headers)
		
		proxyResponse.on('data', function(chunk) {
			response.write(chunk, 'binary')
        })
        proxyResponse.on('end', function() { 
			response.end()
		})
    });
    
    request.on('data', function(chunk) {
        proxyRequest.write(chunk, 'binary')
    });
    
    request.on('end', function() { proxyRequest.end() });
    
	proxyRequest.on('error', function(e) {
		console.log('proxyRequest error' + JSON.stringify(e));
	});
    
}

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            //request.post = querystring.parse(queryData);
            callback(queryData);
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

