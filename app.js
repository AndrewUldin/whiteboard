'use strict';

var config = require('./config');
var log = require('./lib/logger');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = config.server.port;
server.listen(port, () => {
        log.info('Listening on port', port);
    });

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});