'use strict';
import React from 'react'
import io from 'socket.io-client'

export default React.createClass({

    componentWillMount: function() {
        var self = this; // for use in callbacks
        this.socket = io.connect(window.location.origin); // TODO: port by configs

        // server draw event handler
        this.socket.on('serverDraw-'+this.props.room, data => {
            switch (data.type) {
                case "in":
                    this.strokes[data.eventId] = new Stroke(data.coords, data.color);
                    break;
                case "out":
                    delete this.strokes[data.eventId];
                    break;
                case "move":
                    var stroke = this.strokes[data.eventId];
                    if (stroke)
                        stroke.addPoint(data.coords);
                    break;
            }
        });

        // clear board event handler
        this.socket.on('clearBoard-'+this.props.room, data => {
            self._clearBoard();
        });

        // choose the color
        this.color = localStorage.getItem('color') || this.getRandomColor();

        this.strokes = {};
    },

    componentDidMount: function() {

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

        requestAnimFrame(this.drawPointers);
    },

    /**
    * Go through all pointers, rendering any undrawn segments.
    */
    drawPointers: function() {
        for (var eventId in this.strokes)
            this.strokes[eventId].draw(this.ctx);

        requestAnimFrame(this.drawPointers);
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
    * Emit events to server
    * @param {string} type of event
    * @param {string} id of event
    * @param {object} coords
    */
    emit: function(type, eventId, coords) {
        this.socket.emit('clientDraw', {
            type: type,
            eventId: eventId,
            coords: coords || {},
            room: this.props.room,
            color: this.color
        });
    },

    /**
    * Mouse in event handler
    * @param {object} event
    */
    inHandler: function(event) {
        this.mouseEventId = this.getRandomId();
        var coords = this.calcRelCoords(event);
        this.strokes[this.mouseEventId] = new Stroke(coords, this.color);
        this.emit('in', this.mouseEventId, coords);
    },

    /**
    * Mouse out event handler
    * @param {object} event
    */
    outHandler: function(event) {
        this.emit('out', this.mouseEventId);
        delete this.strokes[this.mouseEventId];
    },

    /**
    * Mouse move event handler
    * @param {object} event
    */
    moveHandler: function(event) {
        var stroke = this.strokes[this.mouseEventId];
        if (stroke) {
            var coords = this.calcRelCoords(event);
            stroke.addPoint(coords);
            this.emit('move', this.mouseEventId, coords);
        }
    },

    /**
    * Create a random id for event
    * @returns {string} id
    */
    getRandomId: function() {
        var id = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        return id;
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

});

/**
* Point constructor
* @param {object} coords
*/
function Point(coords) {
    this.x = coords.x;
    this.y = coords.y;
}

/**
* Stroke constructor
* @param {object} coords
* @param {string} color
*/
function Stroke(coords, color) {
    this.points = [new Point(coords)];
    this.color = color;
}

/**
* Prototype function
* Add point to stroke
* @param {object} coords
*/
Stroke.prototype.addPoint = function(coords) {
    this.points.push(new Point(coords));
}

/**
* Prototype function
* Draw line in given canvas context
* @param {CanvasRenderingContext2D} ctx
*/
Stroke.prototype.draw = function(ctx) {

    // dont draw if it was just click
    if (this.points.length < 2)
        return;

    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (var i = 1; i < this.points.length; i++)
        ctx.lineTo(this.points[i].x, this.points[i].y);
    ctx.stroke();
    ctx.closePath();
    this.points = this.points.slice(-1);
}

/**
* requestAnimationFrame polyfill
* @returns {function} requestAnimationFrame|fallback
*/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();