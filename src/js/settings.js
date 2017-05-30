/**
 * All the settings
 * @constructor
 */
var Settings = function(){};


Settings.prototype.init = function(){

    this.GRAVITY_X     = 0;
    this.GRAVITY_Y     = 1;
    this.GROUPS        = []; //Instantiate particles' tab - Nb of particles on start
    this.currentElementTypeId = 0; //Particles' color - current element type when drawing


    this.pauseOnDrawing = true; //Pause the game when we draw
    this.pauseGame = false; //Pause all the game
    this.outflow = false; //Let fluid go out of the canvas
    this.inflow = false; //Create infinite water fluid at left corner

};


var settings = new Settings();
settings.init();