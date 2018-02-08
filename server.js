// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

app.get("/", function (request, response) {
  response.send('Hi. This is the root baby.');
});

// listen for requests :)
http.listen(3000, function() {
  console.log('listening on 3000');
});
