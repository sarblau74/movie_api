const http = require('http');
fs = require('fs'),
    url = require('url');
//above code calls the http, fs and url modules and assigns them to the variables on the left.

http.createServer((request, response) => {
    let addr = request.url,
        q = new URL(addr, 'http://' + request.headers.host),
        filePath = '';
    //above, createServer function with http module is used parse the URL

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });
    // The above code writes the accessed URL, timetstamp to log file, and catches any error

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }
    // The above code checks for documentation extension in the accessed URL from client, if present, then documentation page opens, otherwise defaults to the index.html page

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();

    });
}).listen(8080);
//The above code, checks for errors in file read and displays them

console.log('My first Node test server is running on Port 8080.');