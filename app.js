'use strict';

const path = require('path');
const config = require('./config');
const log = require('./lib/logger');

const environment = process.env.NODE_ENV || 'development';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const mongo = require('./lib/mongo');

const port = config.server.port;
server.listen(port, () => {
    log.info('Listening on port', port);
});

app.set('env', environment);

// log static files requests
app.use(require('morgan')('short'));
app.use(express.static(path.join(__dirname, 'clientside/app')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/clientside/app/index.html');
});

io.on('connection', client => {

    client.on('history', data => {
        mongo.read('log', { room: data.room }).then(datas => {
            datas.map(data => {
                client.emit('serverDraw-' + data.room, data);
            });
        });
    });

    client.on('clientDraw', data => {
        mongo.put('log', data);
        client.broadcast.emit('serverDraw-' + data.room, data);
    });

    client.on('clearBoard', data => {
        mongo.remove('log', { room: data.room });
        client.broadcast.emit('clearBoard-' + data.room, data);
    });

});
