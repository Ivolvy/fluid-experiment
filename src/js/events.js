/**
 * All DOM events
 * @constructor
 */
var Events = function(){};


Events.prototype.init = function(){
    document.getElementById('pauseOnDrawing').getElementsByTagName('input')[0].onclick = function(e) {
        settings.pauseOnDrawing = !settings.pauseOnDrawing;
    };
    document.getElementById('pauseGame').getElementsByTagName('input')[0].onclick = function(e) {
        settings.pauseGame = !settings.pauseGame;
        if(!settings.pauseGame){fluid.resume();}
    };
    document.getElementById('outflow').getElementsByTagName('input')[0].onclick = function(e) {
        settings.outflow = !settings.outflow;
    };
    document.getElementById('inflow').getElementsByTagName('input')[0].onclick = function(e) {
        settings.inflow = !settings.inflow;
    };


    document.getElementById('water-button').onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.water);
    };
    document.getElementById('fire-button').onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.fire);
    };
    document.getElementById('wall-button').onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.wall);
    };
    document.getElementById('delete-button').onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        settings.wipe = true;
    };

    document.getElementById('clear-button').onclick = function(e) {
        fluid.eraseAllParticles();
    };
};



Events.prototype.resetButtons = function(){
    var elements = document.getElementsByClassName("active");

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
    }

    settings.wipe = false; //disable wipe
};



var events = new Events();
events.init();