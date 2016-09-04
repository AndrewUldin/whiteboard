'use strict';
import React from 'react'
import io from 'socket.io-client'

export default React.createClass({

    componentWillMount: function() {
        var self = this; // for use in callbacks
        this.socket = io.connect('https://uldin-whiteboard.herokuapp.com:443/'); // TODO: port by configs

        // server draw event handler
        this.socket.on('serverDraw-'+this.props.room, data => {
            self.draw(data.coords, data.type, data.color);
        });

        // clear board event handler
        this.socket.on('clearBoard-'+this.props.room, data => {
            self._clearBoard();
        });

        // choose the color
        this.color = localStorage.getItem('color') || this.getRandomColor();
    },

    componentDidMount: function() {

        this.nowPressed = false; // flag to detect drawing
        this.canvas = document.getElementsByTagName('canvas')[0];
        this.canvas.width = document.querySelector('.scene').clientWidth;
        this.canvas.height = document.querySelector('.scene').clientHeight;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "solid";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";

        this.canvas.addEventListener('mousedown', this.inHandler);
        this.canvas.addEventListener('mouseup',   this.outHandler);
        this.canvas.addEventListener('mouseout',  this.outHandler);
        this.canvas.addEventListener('mousemove', this.moveHandler);

        var self = this;
        setTimeout(() => { // because at that moment you can loose history drawings from server
            self.socket.emit('history', {
                room: self.props.room
            })
        }, 1000);

    },

    /**
    * Handle clear board event from server
    * @param {string} room
    */
    clearBoard: function(room) {
        var self = this;
        this.socket.emit('clearBoard', {
            room: self.props.room
        });
        this._clearBoard();
    },

    /**
    * Clearing board action
    */
    _clearBoard: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
    * Draw in board
    * @param {object} coords
    * @param {string} type
    * @param {string} color
    */
    draw: function(coords, type, color) {
        this.ctx.strokeStyle = color;
        switch (type) {
            case "start":
                this.ctx.beginPath();
                this.ctx.moveTo(coords.x, coords.y);
                break;
            case "move":
                this.ctx.lineTo(coords.x, coords.y);
                this.ctx.stroke();
                break;
            case "stop":
                this.ctx.closePath();
                break;
        }
    },

    /**
    * Action after mouse event will handled
    * @param {object} coords
    * @param {string} type
    */
    drawHanlder: function(coords, type) {
        this.draw(coords, type, this.color);
        this.socket.emit('clientDraw', {
            room: this.props.room, 
            coords: coords, 
            type: type,
            color: this.color
        });
    },

    /**
    * Calculate real coords in canvas
    * @param {object} event
    */
    calcRelCoords: function(e) {
        return {
            x: e.clientX - e.currentTarget.offsetLeft,
            y: e.clientY - e.currentTarget.offsetTop
        };
    },

    /**
    * Mouse in event handler
    * @param {object} event
    */
    inHandler: function(e) {
        this.nowPressed = true;
        this.drawHanlder(this.calcRelCoords(e), 'start');
    },

    /**
    * Mouse out event handler
    * @param {object} event
    */
    outHandler: function(e) {
        if (this.nowPressed) {
            this.nowPressed = false;
            this.drawHanlder(this.calcRelCoords(e), 'stop');
        }
    },

    /**
    * Mouse move event handler
    * @param {object} event
    */
    moveHandler: function(e) {
        if (this.nowPressed) {
            this.drawHanlder(this.calcRelCoords(e), 'move');
        }
    },

    /**
    * Generate random color
    * @returns {string} random darkness color
    */
    getRandomColor: function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 10)];
        }
        localStorage.setItem('color', color);
        return color;
    },

    render() {
        return (
            <div className="canvas">
                <canvas width="800" height="600"/>
            </div>
        )
    }

})
