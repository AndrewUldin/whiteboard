(function() {
    var App = {};
    App.init = function() {
        App.nowPressed = false;
        App.canvas = document.getElementsByTagName('canvas')[0];
        App.canvas.width = document.querySelector('.scene').clientWidth;
        App.canvas.height = document.querySelector('.scene').clientHeight;
        App.ctx = App.canvas.getContext("2d");
        App.ctx.fillStyle = "solid";
        App.ctx.strokeStyle = "#000000";
        App.ctx.lineWidth = 2;
        App.ctx.lineCap = "round";

        App.draw = function(coords, type) {
            switch (type) {
                case "start":
                    App.ctx.beginPath();
                    App.ctx.moveTo(coords.x, coords.y);
                    break;
                case "move":
                    App.ctx.lineTo(coords.x, coords.y);
                    App.ctx.stroke();
                    break;
                case "stop":
                    App.ctx.closePath();
                    break;
            }
        };

        App.calcRelCoords = function(e) {
            return {
                x: e.clientX - e.currentTarget.offsetLeft,
                y: e.clientY - e.currentTarget.offsetTop
            };
        }

        App.inHandler = function(e) {
            App.nowPressed = true;
            App.draw(App.calcRelCoords(e), 'start');
        }

        App.outHandler = function(e) {
            if (App.nowPressed) {
                App.nowPressed = false;
                App.draw(App.calcRelCoords(e), 'stop');
            }
        }

        App.moveHandler = function(e) {
            if (App.nowPressed) {
                App.draw(App.calcRelCoords(e), 'move');
            }
        }

        App.canvas.addEventListener('mousedown', App.inHandler);
        App.canvas.addEventListener('mouseup',   App.outHandler);
        App.canvas.addEventListener('mouseout',  App.outHandler);
        App.canvas.addEventListener('mousemove', App.moveHandler);

    };

    App.init();

}).call(this);
