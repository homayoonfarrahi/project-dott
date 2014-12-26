var http = require('http');
var url = require('url');
var fs = require('fs');

var server = http.createServer(function (request, response) {
    if (request.method == 'POST')
        return console.error('reqest must be of type GET');
        
    
    var query = url.parse(request.url, true).query;
    console.log(url.parse(request.url, true).pathname);
    
    if (url.parse(request.url, true).pathname === '/') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('./index.html').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/favicon.ico') {
        response.writeHead(200, { 'Content-Type': 'image/x-icon' });
        fs.createReadStream('./favicon.ico').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/jquery-2.1.3.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./jquery-2.1.3.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/two.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./two.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/src/dancer.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./src/dancer.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/src/kick.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./src/kick.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/src/adapterWebAudio.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./src/adapterWebAudio.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/src/adapterMoz.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./src/adapterMoz.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/src/adapterFlash.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./src/adapterFlash.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/src/support.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./src/support.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/lib/fft.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./lib/fft.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/lib/flash_detect.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./lib/flash_detect.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/plugins/dancer.fft.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./plugins/dancer.fft.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/app.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'});
        fs.createReadStream('./app.js').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/songs/getlucky.mp3') {
        response.writeHead(200, { 'Content-Type': 'audio/mpeg'});
        fs.createReadStream('./songs/happy.mp3').pipe(response);
    }
    else if (url.parse(request.url, true).pathname === '/undefined') {
        response.writeHead(200, { 'Content-Type': 'text/plain'});
        fs.createReadStream('./favicon.ico').pipe(response);
    }
});

server.listen(process.argv[2]);