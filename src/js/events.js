/**
 * All DOM events
 * @constructor
 */
var Events = function(){};


Events.prototype.init = function(){
    this.$els = {
        gravityRange: document.getElementById('gravity-range'),
        pauseOnDrawingInput: document.getElementById('pauseOnDrawing').getElementsByTagName('input')[0],
        pauseGameInput: document.getElementById('pauseGame').getElementsByTagName('input')[0],
        outflowInput: document.getElementById('outflow').getElementsByTagName('input')[0],
        inflowInput: document.getElementById('inflow').getElementsByTagName('input')[0],
        gravityInput: document.getElementById('gravity').getElementsByTagName('input')[0],
        waterButton: document.getElementById('water-button'),
        fireButton: document.getElementById('fire-button'),
        wallButton: document.getElementById('wall-button'),
        deleteButton: document.getElementById('delete-button'),
        gasButton: document.getElementById('gas-button'),
        clearButton: document.getElementById('clear-button')
    };

    events.inputsEvents();
    events.buttonsEvents();
    events.gravityEvents();

};


/**
 * Create inputs events
 */
Events.prototype.inputsEvents = function(){
    this.$els.pauseOnDrawingInput.onclick = function(e) {
        settings.pauseOnDrawing = !settings.pauseOnDrawing;
    };
    this.$els.pauseGameInput.onclick = function(e) {
        settings.pauseGame = !settings.pauseGame;
        if(!settings.pauseGame){fluid.resume();}
    };
    this.$els.outflowInput.onclick = function(e) {
        settings.outflow = !settings.outflow;
    };
    this.$els.inflowInput.onclick = function(e) {
        settings.inflow = !settings.inflow;
    };
};


/**
 * Create button events
 */
Events.prototype.buttonsEvents = function(){
    var that = this;

    that.$els.waterButton.onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.water);
    };
    that.$els.fireButton.onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.fire);
    };
    that.$els.wallButton.onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.wall);
    };
    that.$els.deleteButton.onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        settings.wipe = true;
    };
    that.$els.gasButton.onclick = function(e) {
        events.resetButtons();
        this.classList.add("active");

        element.createElement(type.gas);
    };
    that.$els.clearButton.onclick = function(e) {
        fluid.eraseAllParticles();
    };
};


/**
 * Gravity Events
 */
Events.prototype.gravityEvents = function(){
    var that = this;

    this.$els.gravityInput.onclick = function(e) {
        settings.gravity = !settings.gravity;

        if(settings.gravity){
            settings.enableGravity();
            that.$els.gravityRange.removeAttributeNode(that.$els.gravityRange.getAttributeNode("disabled"));
        } else{
            settings.disableGravity();
            that.$els.gravityRange.setAttributeNode(document.createAttribute("disabled"));
        }
    };

    this.$els.gravityRange.onchange = function(e) {
        settings.GRAVITY_Y = settings.gravityRange = this.value/10; // divide by 10 to minimize output value
    };
    this.$els.gravityRange.onmousedown = function(e) {
        settings.pauseGame = true;
    };
    this.$els.gravityRange.onmouseup = function(e) {
        settings.pauseGame = false;
        fluid.resume();
    };
};


/**
 * Reset Buttons
 */
Events.prototype.resetButtons = function(){
    var elements = document.getElementsByClassName("active");

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
    }

    settings.wipe = false; //disable wipe
};



var events = new Events();
events.init();