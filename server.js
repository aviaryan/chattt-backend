var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

// global variables
let channels = {};

// magic
io.on('connection', function (socket) {
  console.log('a user connected');
  let conn = {};

  socket.on('disconnect', function () {
    console.log('user disconnected');
    if (conn.channel){
      // remove user trace
      channels[conn.channel].population--;
      channels[conn.channel].users.splice(channels[conn.channel]['users'].indexOf(conn.user), 1);
      // send bye bye message
      io.emit('/msg ' + conn.channel, {user: null, data: `${conn.user} has left the chat!`});
    }
  });

  // join channel
  socket.on('/join', (msg) => {
    console.log(msg);
    let ch = msg.channel;
    let user = msg.user;
    conn = {user: msg.user, channel: msg.channel};

    if (channels.hasOwnProperty(ch)){
      // channel exists
      // check if existing user
      if (channels[ch]['users'].indexOf(user) > -1){
        // fail user join request
        socket.emit('/status', {type: 'join failed', data: 'User with that handle already exists!'});
        conn.channel = null;
        return;
      }
      channels[ch]['population']++;
      channels[ch]['users'].push(user);
    } else {
      // need to create channel
      channels[ch] = {population: 1, users: [user]};
    }
    // confirm user join
    socket.emit('/status', {type: 'joined', data: null});

    // broadcast status message
    io.emit('/msg ' + ch, {user: null, data: `${msg.user} joined! Total members = ${channels[ch]['population']}`});

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
