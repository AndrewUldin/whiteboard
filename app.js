'use strict';

const path = require('path');
const config = require('./config');
const log = require('./lib/logger');

const environment = process.env.NODE_ENV || 'development';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = config.server.port;
server.listen(port, () => {
    log.info('Listening on port', port);
});

app.set('env', environment);

app.use(require('morgan')('short'));
app.use(express.static(path.join(__dirname, 'clientside/app')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/clientside/app/index.html');
});

io.on('connection', socket => {
    socket.on('clientDraw', data => {
        socket.broadcast.emit('serverDraw', data);
    });
});
