'use strict';

const constants = require("./constants");
const url = require('url');
var Cookies = require( "cookies" );

const server = constants.g_bDebug ? require("http").createServer() : require("https").createServer(constants.options);

server.listen(constants.my_port, function(){
    console.log("SSL Proxy listening on port "+constants.my_port);
});

server.addListener("request", function(request, response) {
    
    console.log("Init session");
    
    var cookies = new Cookies( request, response )
    
    const ph = url.parse(request.url);
    
    const redirect = constants.NeadRedirect(ph.path, cookies.get( "host" ));
    if (redirect && redirect.location)
    {
        response.writeHead(302, {
          'Location': redirect.location
        });
        response.end();
        return;
    }

    const objHostAndPort = constants.GetHostAndPort2(ph.path, cookies.get( "host" ));
    cookies.set('host', objHostAndPort.host);
    
    const path = objHostAndPort.path;

    const options = {
        port: objHostAndPort.port,
        hostname: objHostAndPort.host,
        method: request.method,
        path: path,
        headers: request.headers
    };
    options.headers.host = objHostAndPort.host;
    
    const host = objHostAndPort.host;

    
    var proxyRequest = require("https").request(options);
    
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
});

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

