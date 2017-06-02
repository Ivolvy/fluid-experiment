/*Base particles script get from dissimulate on codepen*/

/**
 * Create Particle
 * @param elementTypeId
 * @param x
 * @param y
 * @param px
 * @param py
 * @constructor
 */
var Particle = function(elementTypeId, x, y, px, py){
    this.id = fluid.particlesCreated;
    this.elementTypeId = elementTypeId; //Type of the particle (water, fire, ...)
    this.x = x;
    this.y = y;
    this.px = px ? px : x;
    this.py = py ? py : y;
    this.vx = 0;
    this.vy = 0;
    this.willBeDestroyed = false;


    if(elementTypeId == type.gas.id){
        this.gravityX = 0;
        this.gravityY = 0;
    } else{
        this.gravityX = settings.GRAVITY_X;
        this.gravityY = settings.GRAVITY_Y;
    }
};

/**
 * Handle the gravity
 */
Particle.prototype.first_process = function () {


    var g = fluid.grid[Math.round(this.y / fluid.spacing) * fluid.num_x + Math.round(this.x / fluid.spacing)];

    if (g){
        g.close[g.length++] = this;
    }

    //If the particle is a wall, we don't move it
    if(this.elementTypeId == type.wall.id){
        return;
    }

    this.vx = this.x - this.px;
    this.vy = this.y - this.py;

    /*if (mouse.down) {
        //here useful to interact with the fluid with mouse?
    }*/

    this.vx += this.gravityX;
    this.vy += this.gravityY;
    this.px = this.x;
    this.py = this.y;
    this.x += this.vx;
    this.y += this.vy;
};


/**
 * Handle the behavior between particles
 */
Particle.prototype.second_process = function () {

    this.m = 0; //leading coefficient - give the direction and the steepness of the line: ((yb-ya)/(xb-xa))
    this.force = 0;
    this.force_b = 0;

    var cell_x = Math.round(this.x / fluid.spacing);
    var cell_y = Math.round(this.y / fluid.spacing);
    this.close = [];
    this.xDistance = 0;
    this.yDistance = 0;
    this.distance = 0;


    for (var x_off = -1; x_off < 2; x_off++) {
        for (var y_off = -1; y_off < 2; y_off++) {
            var cell = fluid.grid[(cell_y + y_off) * fluid.num_x + (cell_x + x_off)];

            if (cell && cell.length) {
                for (var a = 0, l = cell.length; a < l; a++) {
                    var closeParticle = cell.close[a];

                    this.processForcesOnParticle(closeParticle);
                }
            }
        }
    }


    this.addForcesToParticles();
    this.checkBorderLimits();

    this.draw();
};

/**
 * Add calculated forces to particles
 */
Particle.prototype.addForcesToParticles = function(){
    //If gravity activated and his value not equals 0
    if(settings.gravity && settings.gravityRange != 0){

        var pressVariation = 0; //Used to increase or not the merge this.force of particles

        //Change pressVariation according to particle type
        if(this.elementTypeId == type.gas.id){
            pressVariation = 0.1;
        } else{
            this.force = (this.force - 3) * 0.5;
            pressVariation = 0.5;
        }
        
        for (var i = 0; i < this.close.length; i++) {

            var neighbor = this.close[i];

            this.processWaterAndFire(neighbor);

            //Press is this.force to merge current element and neighbor
            var press = this.force + this.force_b * neighbor.m;


            if (this.elementTypeId != neighbor.elementTypeId) {
                press *= 0.35;
            }

            //press *= 0.35; here to make water go properly on wall - find a way to not loose performance

            var dx = neighbor.dfx * press * pressVariation; //increase rebound
            var dy = neighbor.dfy * press * pressVariation;

            //If the neighbor is not a wall - we don't want the wall moving
            if (this.elementTypeId != type.wall.id && neighbor.elementTypeId != type.wall.id) {
                neighbor.x += dx;
                neighbor.y += dy;
            }

            //If the current element is not a wall - we don't want the wall moving
            if(this.elementTypeId != type.wall.id && neighbor.elementTypeId == type.wall.id){
                this.x -= dx;
                this.y -= dy;
            }
        }
    }
};

/**
 * Check border limits for the particle
 */
Particle.prototype.checkBorderLimits = function(){
    //Check if the particles are on the borders of the canvas
    if (this.x < fluid.limit) {
        if (settings.outflow) {
            if(this.x < 0) {
                fluid.destroyParticle(this);
            }
        } else{
            this.x = fluid.limit;
        }
    } else if (this.x > fluid.width - fluid.limit) {
        if (settings.outflow) {
            if(this.x > fluid.width) { //Useful to not make the particles disappears instantly at extremes
                fluid.destroyParticle(this);
            }
        } else{
            this.x = fluid.width - fluid.limit;
        }
    }

    if (this.y < fluid.limit) {
        if (settings.outflow) {
            fluid.destroyParticle(this);
        } else{
            this.y = fluid.limit;
        }
    } else if (this.y > fluid.height - fluid.limit) {
        if (settings.outflow) {
            if(this.y > fluid.height){
                fluid.destroyParticle(this);
            }
        } else{
            this.y = fluid.height - fluid.limit;
        }
    }
};


/**
 * Process forces on particles
 * @param closeParticle
 */
Particle.prototype.processForcesOnParticle = function(closeParticle){

    this.xDistance = closeParticle.x - this.x;
    this.yDistance = closeParticle.y - this.y;
    this.distance = Math.sqrt(Math.pow(this.xDistance, 2) + Math.pow(this.yDistance, 2)); //Distance between two points: sqrt((xb-xa)² + (yb-ya)²)

    if (this.distance < fluid.spacing) {

        this.processForceForElement(closeParticle);

        closeParticle.m = this.m;
        closeParticle.dfx = (this.xDistance / this.distance) * this.m; //rate of change
        closeParticle.dfy = (this.yDistance / this.distance) * this.m; //rate of change

        //Avoid errors
        if(isNaN(closeParticle.dfx)){
            closeParticle.dfx = 0;
        }
        if(isNaN(closeParticle.dfy)){
            closeParticle.dfy = 0;
        }

        this.close.push(closeParticle);
    }
};

/**
 * Handle different forces for each particle
 * @param closeParticle
 */
Particle.prototype.processForceForElement = function(closeParticle){

    //If the current particle is not a wall and the neighbor particle is a wall
    if(closeParticle != this && this.elementTypeId != type.wall.id && closeParticle.elementTypeId == type.wall.id){
        this.m = 1 - (this.distance / fluid.spacing);
        this.force += 1;
        this.force_b += 1;
    }
    else if(closeParticle != this && this.elementTypeId == type.gas.id){

        //If the gas particle is already moving
        if(this.vx != 0 || this.vy != 0){
            this.m = 0.1;
        } else{
            this.m = 0;
        }

        this.force = 0.1;
        this.force_b = 0.1;
    }
    else if (closeParticle != this && (closeParticle.elementTypeId != type.wall.id)) {
        this.m = 1 - (this.distance / fluid.spacing);
        this.force += Math.pow(this.m, 2);
        this.force_b += Math.pow(this.m, 3) / 2;
    }

};


/**
 * When water and fire meet
 * @param neighbor
 */
Particle.prototype.processWaterAndFire = function(neighbor){
    if(!this.willBeDestroyed && this.elementTypeId == type.fire.id && neighbor.elementTypeId == type.water.id){

        if((this.x + 7) >= neighbor.x && (this.x - 7) <= neighbor.x &&
            (this.y + 7) >= neighbor.y && (this.y - 7) <= neighbor.y){


            this.launchTimerToGas(this, neighbor);
            this.willBeDestroyed = true; //Set to true in order to not pass twice in destroy function
        }
    }
};


/**
 * Launch Timer to create gas with water and fire
 * @param currentParticle
 * @param neighbor
 */
Particle.prototype.launchTimerToGas = function(currentParticle, neighbor){
    setTimeout(function(){
        element.createGas(currentParticle, neighbor);
    }, 200);
};


Particle.prototype.draw = function () {

    var size = element.radius * 2;

    fluid.meta_ctx.drawImage(
        element.textures[this.elementTypeId], //Draw the current type of the particle (water, fire, ...)
        this.x - element.radius,
        this.y - element.radius,
        size,
        size);
};
