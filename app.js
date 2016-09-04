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

// start listening port
const port = config.server.port;
server.listen(port, () => {
    log.info('Listening on port', port);
});

// set env to express
app.set('env', environment);

// log static files requests, and proxy static files
app.use(require('morgan')('short'));
app.use(express.static(path.join(__dirname, 'clientside/app')));

// send index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/clientside/app/index.html');
});

/* Socket section */
io.on('connection', client => {

    /**
    * event wich client send when connect to socket
    * get log from mongo and emit to current client
    * client will draw latest state of whiteboard
    * TODO: filter empty lines
    */
    client.on('history', data => {
        mongo.read('log', { room: data.room }).then(datas => {
            datas.map(data => {
                /*
                *   data = {
                *       room: [string]
                *       type: [string:start|stop|draw]
                *       color: [string:#+hex],
                *       coords: { x: [number], y: [number] },
                *   }
                */
                client.emit('serverDraw-' + data.room, data);
            });
        });
    });

    /**
    * event fires when client make some draw in whiteboard
    * get data, put in mongo and emit changes to all clients
    * TODO: split messages by namespaces
    */
    client.on('clientDraw', data => {
        mongo.put('log', data);
        client.broadcast.emit('serverDraw-' + data.room, data);
    });

    /**
    * event fires when client clear whiteboard
    * get data, clear mongo by query and emit changes to all clients
    * TODO: split messages by namespaces
    */
    client.on('clearBoard', data => {
        mongo.remove('log', { room: data.room });
        client.broadcast.emit('clearBoard-' + data.room, data);
    });

    // TODO: connect/disconnect handlers

});
