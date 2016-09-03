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

app.use(express.static(path.join(__dirname, 'static')));
app.use(require('morgan')('short'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', socket => {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', data => {
        console.log(data);
    });
});
