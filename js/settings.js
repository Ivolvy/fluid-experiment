var Settings = function(){};


Settings.prototype.init = function(){

    this.GRAVITY_X     = 0;
    this.GRAVITY_Y     = 1;
    this.GROUPS        = [5]; //Nb of particles on start
    this.COLOR = ['rgba(128, 186, 247']; //Particles' color


    this.pauseOnDrawing = true;
    this.pauseGame = false;
    this.outflow = false;

};


var settings = new Settings();
settings.init();