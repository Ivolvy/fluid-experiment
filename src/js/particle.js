

var settings = require('./settings.js');
var type = require('./type.js');
var element = require('./element.js');



class Particle{

    /**
     * Create Particle
     * @param elementTypeId
     * @param x
     * @param y
     * @param px
     * @param py
     * @constructor
     */
    constructor(fluid, elementTypeId, x, y, px, py){
        this.id = fluid.particlesCreated += 1;
        this.groupParentId = null; //Useful to know the groupParent id if there is one

        this.elementTypeId = elementTypeId; //Type of the particle (water, fire, ...)
        this.x = x;
        this.y = y;
        this.px = px ? px : x; //px -> previous x - use to know the velocity between previous and actual position in x
        this.py = py ? py : y; //py -> previous y
        this.vx = 0; //velocity
        this.vy = 0;
        this.willBeDestroyed = false;
        this.willBeConverted = false;
        this.convertedFromLiquidFuel = false;

        this.xDiffFromLead = 0; //Diff X from leader if the particle is in a group
        this.yDiffFromLead = 0;

        this.isCollide = false; //Is the particle collide or not


        if(elementTypeId == type.gas.id){
            this.gravityX = 0;
            this.gravityY = 0;
        } else{
            this.gravityX = settings.GRAVITY_X;
            this.gravityY = settings.GRAVITY_Y;
        }
    }


    /**
     * Handle the gravity
     */
    first_process(fluid){
        this.fluid = fluid;

        var g = this.fluid.grid[Math.round(this.y / this.fluid.spacing) * this.fluid.num_x + Math.round(this.x / this.fluid.spacing)];

        if (g){
            g.close[g.length++] = this;
        }

        //If the particle is a wall, we don't move it
        if(this.elementTypeId == type.wall.id || this.elementTypeId == type.rigid.id){
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
    }

    /**
     * Handle the behavior between particles
     */
    second_process(fluid){
        this.fluid = fluid;

        this.m = 0; //leading coefficient - give the direction and the steepness of the line: ((yb-ya)/(xb-xa))


        this.fluid.groupParticles.forEach(groupParticle => groupParticle.m = 0);



        this.force = 0;
        this.force_b = 0;

        var cell_x = Math.round(this.x / this.fluid.spacing);
        var cell_y = Math.round(this.y / this.fluid.spacing);
        this.close = [];
        this.xDistance = 0;
        this.yDistance = 0;
        this.distance = 0;


        for (let x_off = -1; x_off < 2; x_off++) {
            for (let y_off = -1; y_off < 2; y_off++) {
                var cell = this.fluid.grid[(cell_y + y_off) * this.fluid.num_x + (cell_x + x_off)];

                if (cell && cell.length) {
                    for (let a = 0, l = cell.length; a < l; a++) {
                        var closeParticle = cell.close[a];

                        this.processForcesOnParticle(closeParticle);
                    }
                }
            }
        }


        this.addForcesToParticles();


        if(this.elementTypeId != type.rigid.id){
            this.checkBorderLimits();
        }


        this.draw(fluid);
    }

    /**
     * Add calculated forces to particles
     */
    addForcesToParticles(){
        var that = this;

        this.hasWaterNeighbor = 0;
        this.stockLiquidFire = [];

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



            for (let i = 0; i < this.close.length; i++) {

                var neighbor = this.close[i];


                that.testEligibilityToFire(neighbor, i);
                that.processWaterAndFire(neighbor);


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
                if(this.elementTypeId != type.rigid.id && neighbor.elementTypeId == type.rigid.id){
                    this.x -= dx;
                    this.y -= dy;
                }

                if(this.elementTypeId == type.rigid.id && neighbor.elementTypeId == type.rigid.id){

                    //If the particle doesn't belong to the same group
                    if(this.groupParentId != neighbor.groupParentId){

                        /*                 console.log(this.fluid.groupParticles);
                         console.log(this.groupParentId);

                         //If the groupParticle with the given id exists
                         for(let i=0 ; i < this.fluid.groupParticles.length; i++){  //todo to get the real position of particles in group
                         if(this.fluid.groupParticles[i].id == this.groupParentId) {
                         this.fluid.groupParticles[i].x -= dx;
                         this.fluid.groupParticles[i].y -= dy;
                         }
                         }
                         */
                        this.fluid.groupParticles[this.groupParentId-1].x -= dx;
                        this.fluid.groupParticles[this.groupParentId-1].y -= dy;

                    }

                }
            }
        }
    }

    /**
     * Check border limits for the particle
     */
    checkBorderLimits(){
        //Check if the particles are on the borders of the canvas
        if (this.x < this.fluid.limit) {
            if (settings.outflow) {
                if(this.x < 0) {
                    this.fluid.destroyParticle(this);
                }
            } else{
                this.x = this.fluid.limit;
            }
        } else if (this.x > settings.width - this.fluid.limit) {
            if (settings.outflow) {
                if(this.x > settings.width) { //Useful to not make the particles disappears instantly at extremes
                    this.fluid.destroyParticle(this);
                }
            } else{
                this.x = settings.width - this.fluid.limit;
            }
        }

        if (this.y < this.fluid.limit) {
            if (settings.outflow) {
                this.fluid.destroyParticle(this);
            } else{
                this.y = this.fluid.limit;
            }
        } else if (this.y > settings.height - this.fluid.limit) {
            if (settings.outflow) {
                if(this.y > settings.height){
                    this.fluid.destroyParticle(this);
                }
            } else{
                this.y = settings.height - this.fluid.limit;
            }
        }
    }

    /**
     * Process forces on particles
     * @param closeParticle
     */
    processForcesOnParticle(closeParticle){
        this.xDistance = closeParticle.x - this.x;
        this.yDistance = closeParticle.y - this.y;
        this.distance = Math.sqrt(Math.pow(this.xDistance, 2) + Math.pow(this.yDistance, 2)); //Distance between two points: sqrt((xb-xa)² + (yb-ya)²)

        if (this.distance < this.fluid.spacing) {

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
    }


    /**
     * Handle different forces for each particle
     * @param closeParticle
     */
    processForceForElement(closeParticle){
        if(closeParticle != this && this.elementTypeId != type.rigid.id && closeParticle.elementTypeId == type.rigid.id){
            this.m = 1 - (this.distance / this.fluid.spacing);
            this.force += 1;
            this.force_b += 1;
        }

        else if(closeParticle != this && this.elementTypeId == type.rigid.id && closeParticle.elementTypeId == type.rigid.id){

            //If the particle doesn't belong to the same group
            if(this.groupParentId != closeParticle.groupParentId) {
                this.m = 0.1;
                this.force += 0.5;
                this.force_b += 0.5;
            }
        }

        //If the current particle is not a wall and the neighbor particle is a wall
        else if(closeParticle != this && this.elementTypeId != type.wall.id && closeParticle.elementTypeId == type.wall.id){
            this.m = 1 - (this.distance / this.fluid.spacing);
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
            this.m = 1 - (this.distance / this.fluid.spacing);
            this.force += Math.pow(this.m, 2);
            this.force_b += Math.pow(this.m, 3) / 2;
        }
    }


    /**
     * When water and fire meet
     * @param neighbor
     */
    processWaterAndFire(neighbor){
        //If the particle is not already programmed to be destroyed
        if(!this.willBeDestroyed && this.elementTypeId == type.fire.id && neighbor.elementTypeId == type.water.id){

            //7 => how close the particles must be
            if((this.x + settings.maxDistanceForChemistry) >= neighbor.x && (this.x - settings.maxDistanceForChemistry) <= neighbor.x &&
                (this.y + settings.maxDistanceForChemistry) >= neighbor.y && (this.y - settings.maxDistanceForChemistry) <= neighbor.y){


                this.launchTimerToChemistryFromWaterAndFire(this, neighbor, this.fluid);
                this.willBeDestroyed = true; //Set to true in order to not pass twice in destroy function
            }
        }
    }


    /**
     * Test eligibility to fire - if fire is near of liquidFuel and there is not so much water around
     * @param neighbor
     * @param increment
     */
    testEligibilityToFire(neighbor, increment){
        var that = this;

        //If the fire element has water neighbor, increase 1
        if(this.elementTypeId == type.fire.id && neighbor.elementTypeId == type.water.id){
            this.hasWaterNeighbor += 1;
        }
        //If fire has neighbor liquidFuel, stock them
        else if(this.elementTypeId == type.fire.id && neighbor.elementTypeId == type.liquidFuel.id){
            this.stockLiquidFire.push(neighbor);
        }

        //If we are at the end of the close particles
        if(this.elementTypeId == type.fire.id && this.close.length-1 == increment){
            //Test if there is less ... water neighbor
            if(this.hasWaterNeighbor < settings.maxWaterAroundToTransformInFire){
                //And transform stocked liquidFuel in Fire
                this.stockLiquidFire.forEach(element => that.processFireAndLiquidFuel(element));

            }
        }
    }

    /**
     * When fire meet liquidFuel
     * @param neighbor
     */
    processFireAndLiquidFuel(neighbor){
        //If the particle is not already programmed to be destroyed
        if(!neighbor.willBeConverted && this.elementTypeId == type.fire.id && neighbor.elementTypeId == type.liquidFuel.id){

            //7 => how close the particles must be
            if((this.x + settings.maxDistanceForChemistry) >= neighbor.x && (this.x - settings.maxDistanceForChemistry) <= neighbor.x &&
                (this.y + settings.maxDistanceForChemistry) >= neighbor.y && (this.y - settings.maxDistanceForChemistry) <= neighbor.y){


                this.launchTimerToChemistryFromFireAndLiquidFuel(this, neighbor);
                this.willBeConverted = true; //Set to true in order to not pass twice in destroy function
                this.convertedFromLiquidFuel = true;
            }
        }
    }


    /**
     * Launch Timer to create gas/liquidFuel with water and fire
     * @param currentParticle
     * @param neighbor
     */
    launchTimerToChemistryFromWaterAndFire(currentParticle, neighbor){
        var that = this;

        setTimeout(function(){
            if(neighbor.elementTypeId == type.water.id) { //Double security
                var randomChemistry = Math.floor((Math.random() * 5) + 1); //Between 1 and 3 options

                if (randomChemistry == 1) {
                    element.createGas(currentParticle, neighbor, that.fluid);
                } else if (randomChemistry == 2) {
                    element.createLiquidFuel(currentParticle, neighbor, that.fluid);
                } else if(!currentParticle.convertedFromLiquidFuel){
                    that.fluid.destroyParticle(currentParticle);
                }
            }
        }, 200);
    }


    /**
     * Launch Timer to create fire with fire and liquidFuel
     * @param currentParticle
     * @param neighbor
     */
    launchTimerToChemistryFromFireAndLiquidFuel(currentParticle, neighbor){
        var that = this;

        setTimeout(() => {
            if(neighbor.elementTypeId == type.liquidFuel.id) { //Double security
                neighbor.elementTypeId = type.fire.id;
                element.processFire(neighbor, that.fluid);
            }
        }, 200);
    }


    draw(fluid){
        var size = element.radius * 2;

        fluid.meta_ctx.drawImage(
            element.textures[this.elementTypeId], //Draw the current type of the particle (water, fire, ...)
            this.x - element.radius,
            this.y - element.radius,
            size,
            size);
    }

}



module.exports = Particle;