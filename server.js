var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

// global variables
let channels = {};

// magic
io.on('connection', function (socket) {
  console.log('a user connected');
  let userStatus = {};

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  // join channel
  socket.on('/join', (msg) => {
    console.log(msg);
    let ch = msg.channel;

    if (channels.hasOwnProperty(ch)){
      // channel exists
      channels[ch]['population']++;
    } else {
      // need to create channel
      channels[ch] = {population: 1};
    }

    // broadcast status message
    io.emit('/msg ' + ch, {user: null, message: `${msg.user} joined! Total members = ${channels[ch]['population']}`});

    // setup message listener
    socket.on('/msg ' + ch, (msg) => {
      io.emit('/msg ' + ch, msg);
    });
  });

});

app.get("/", function (request, response) {
  response.send('Hi. This is the root baby.');
});

// listen for requests :)
http.listen(3000, function() {
  console.log('listening on 3000');
});
