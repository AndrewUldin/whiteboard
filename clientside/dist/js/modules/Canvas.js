'use strict';
import React from 'react'
import io from 'socket.io-client'

export default React.createClass({

    componentWillMount: function() {
        var self = this;
        this.socket = io.connect('http://127.0.0.1:9999/');

        this.socket.on('serverDraw-'+this.props.room, data => {
            self.draw(data.coords, data.type, data.color);
        });

        this.socket.on('clearBoard-'+this.props.room, data => {
            self._clearBoard();
        });

        this.color = localStorage.getItem('color') || this.getRandomColor();
    },

    componentDidMount: function() {

        this.nowPressed = false;
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
        setTimeout(() => {
            self.socket.emit('history', {
                room: self.props.room
            })
        }, 1000);

    },

    clearBoard: function(room) {
        var self = this;
        this.socket.emit('clearBoard', {
            room: self.props.room
        });
        this._clearBoard();
    },

    _clearBoard: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

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

    drawHanlder: function(coords, type) {
        this.draw(coords, type, this.color);
        this.socket.emit('clientDraw', {
            room: this.props.room, 
            coords: coords, 
            type: type,
            color: this.color
        });
    },

    calcRelCoords: function(e) {
        return {
            x: e.clientX - e.currentTarget.offsetLeft,
            y: e.clientY - e.currentTarget.offsetTop
        };
    },

    inHandler: function(e) {
        this.nowPressed = true;
        this.drawHanlder(this.calcRelCoords(e), 'start');
    },

    outHandler: function(e) {
        if (this.nowPressed) {
            this.nowPressed = false;
            this.drawHanlder(this.calcRelCoords(e), 'stop');
        }
    },

    moveHandler: function(e) {
        if (this.nowPressed) {
            this.drawHanlder(this.calcRelCoords(e), 'move');
        }
    },

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
