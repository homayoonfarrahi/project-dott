var http = require('http')
var url = require('url')
var fs = require('fs')

var server = http.createServer(function (request, response) {
    if (request.method == 'POST')
        return console.error('reqest must be of type GET')
        
    
    var query = url.parse(request.url, true).query
    console.log(url.parse(request.url, true).pathname)
    
    if (url.parse(request.url, true).pathname === '/') {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        fs.createReadStream('./index.html').pipe(response)
    }
    else if (url.parse(request.url, true).pathname === '/favicon.ico') {
        response.writeHead(200, { 'Content-Type': 'image/x-icon' })
        fs.createReadStream('./favicon.ico').pipe(response)
    }
    else if (url.parse(request.url, true).pathname === '/two.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'})
        fs.createReadStream('./two.js').pipe(response)
    }
    else if (url.parse(request.url, true).pathname === '/app.js') {
        response.writeHead(200, { 'Content-Type': 'application/javascript'})
        fs.createReadStream('./app.js').pipe(response)
    }
    else if (url.parse(request.url, true).pathname === '/getlucky') {
        response.writeHead(200, { 'Content-Type': 'text/plain'})
        fs.createReadStream('./songs/desire.mp3').pipe(response)
    }
    else if (url.parse(request.url, true).pathname === '/undefined') {
        response.writeHead(200, { 'Content-Type': 'text/plain'})
        fs.createReadStream('./favicon.ico').pipe(response)
    }
})

server.listen(process.argv[2])