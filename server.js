const http = require('http'),
  fs = require('fs'),
  url = require('url');

// Starts the server.
http.createServer((request, response) => {
  // Gets the requested URL.
  let addr = request.url,
    // Gets the request's information.
    q = new URL(addr, 'http://' + request.headers.host),
    filePath = '';

  // Logs request into the file logs/log.txt.
  fs.appendFile('./logs/log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  // Checks the URL requested.
  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/pages/documentation.html');
  } else {
    filePath = 'index.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();
  });

// Runs on port 8080
}).listen(8080);
console.log('My test server is running on Port 8080.');