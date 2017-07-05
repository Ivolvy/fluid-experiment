
var fluid = require('./fluid.js');
var settings = require('./settings.js');
var type = require('./type.js');
var ElementButton = require('./elementButton.js');



/**
 * All DOM events
 */
class Events{
    constructor(){}

    init(app){
        this.$els = {
            gravityRange: document.getElementById('gravity-range'),
            pauseOnDrawingInput: document.getElementById('pauseOnDrawing').getElementsByTagName('input')[0],
            pauseGameInput: document.getElementById('pauseGame').getElementsByTagName('input')[0],
            outflowInput: document.getElementById('outflow').getElementsByTagName('input')[0],
            inflowInput: document.getElementById('inflow').getElementsByTagName('input')[0],
            gravityInput: document.getElementById('gravity').getElementsByTagName('input')[0],
            clearButton: document.getElementById('clear-button')
        };

        events.inputsEvents(app);
        events.createElementsButtons();
        events.buttonsEvents();
        events.gravityEvents(app);
    }


    /**
     * Create inputs events
     */
    inputsEvents(app){
        this.$els.pauseOnDrawingInput.onclick = () => {
            settings.pauseOnDrawing = !settings.pauseOnDrawing;
        };
        this.$els.pauseGameInput.onclick = () => {
            settings.pauseGame = !settings.pauseGame;
            if(!settings.pauseGame){app.resume();}
        };
        this.$els.outflowInput.onclick = () => {
            settings.outflow = !settings.outflow;
        };
        this.$els.inflowInput.onclick = () => {
            settings.inflow = !settings.inflow;
        };
    }


    /**
     * Create elements buttons
     */
    createElementsButtons(){
        new ElementButton('water', 'water', type.water, true);
        new ElementButton('fire', 'fire', type.fire, false);
        new ElementButton('wall', 'wall', type.wall, false);
        new ElementButton('delete', 'delete', 'delete', false);
        new ElementButton('gas', 'gas', type.gas, false);
        new ElementButton('rigid', 'rigid', type.rigid, false);
    }

    /**
     * Create button events
     */
    buttonsEvents(){
        var that = this;
        that.$els.clearButton.onclick = () => fluid.eraseAllParticles();
    }

    /**
     * Gravity Events
     */
    gravityEvents(app){
        var that = this;

        this.$els.gravityInput.onclick = () => {
            settings.gravity = !settings.gravity;

            if(settings.gravity){
                settings.enableGravity();
                that.$els.gravityRange.removeAttributeNode(that.$els.gravityRange.getAttributeNode("disabled"));
            } else{
                settings.disableGravity();
                that.$els.gravityRange.setAttributeNode(document.createAttribute("disabled"));
            }
        };

        this.$els.gravityRange.onchange = (e) => {
            settings.GRAVITY_Y = settings.gravityRange = e.currentTarget.value/10; // divide by 10 to minimize output value
        };
        this.$els.gravityRange.onmousedown = () => {
            settings.pauseGame = true;
        };
        this.$els.gravityRange.onmouseup = () => {
            settings.pauseGame = false;
            app.resume();
        };
    }
}


var events = new Events();
module.exports = events;
