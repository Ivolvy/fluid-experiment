/**
 * All DOM events
 * @constructor
 */
var Events = function(){};


Events.prototype.init = function(){
    document.getElementById('pauseOnDrawing-element').getElementsByTagName('input')[0].onclick = function(e) {
        settings.pauseOnDrawing = !settings.pauseOnDrawing;
    };
    document.getElementById('pauseGame-element').getElementsByTagName('input')[0].onclick = function(e) {
        settings.pauseGame = !settings.pauseGame;
        if(!settings.pauseGame){fluid.resume();}
    };
    document.getElementById('outflow-element').getElementsByTagName('input')[0].onclick = function(e) {
        settings.outflow = !settings.outflow;
    };
    document.getElementById('inflow-element').getElementsByTagName('input')[0].onclick = function(e) {
        settings.inflow = !settings.inflow;
    };


    document.getElementById('water-button').onclick = function(e) {
        events.removeActive();

        this.classList.add("active");
        element.setWaterElement();
    };
    document.getElementById('fire-button').onclick = function(e) {
        events.removeActive();

        this.classList.add("active");
        element.setFireElement();
    };
};



Events.prototype.removeActive = function(){
    var elements = document.getElementsByClassName("active");

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
    }
};



var events = new Events();
events.init();