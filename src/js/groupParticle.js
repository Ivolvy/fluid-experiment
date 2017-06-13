/**
 * Create Particle
 * @param elementTypeId
 * @param x
 * @param y
 * @param px
 * @param py
 * @constructor
 */
var GroupParticle = function(elementTypeId, x, y, px, py){
    this.id = fluid.idGroupParticlesCreated += 1;
    this.elementTypeId = elementTypeId; //Type of the particle (water, fire, ...)
    this.x = x;
    this.y = y;
    this.px = px ? px : x; //px -> previous x - use to know the velocity between previous and actual position in x
    this.py = py ? py : y; //py -> previous y
    this.vx = 0; //velocity
    this.vy = 0;
    this.dfx = 1;
    this.dfy = 1;
    this.willBeDestroyed = false;
    this.willBeConverted = false;
    this.convertedFromLiquidFuel = false;


    this.pass = false;
    this.particleLimitInGroup = null;
    this.previousParticleLimitInGroup = null;

    if(elementTypeId == type.gas.id){
        this.gravityX = 0;
        this.gravityY = 0;
    } else{
        this.gravityX = settings.GRAVITY_X;
        this.gravityY = settings.GRAVITY_Y*3;
    }


    this.subParticles = [];


    this.damping = 0.55;

    this.limit = false;
    this.rebound= false;
    this.activeRotation = false;

    this.angle = -10;
    this.rotationWay = 1; //0 is clockwise and 1 is counterclockwise


    this.isCollide = false; //Is the particle collide or not

};

/**
 * Handle the gravity
 */
GroupParticle.prototype.first_process = function () {
    var that = this;


    this.prevVy = this.vy;


    if(!this.rebound) {
        this.vx = this.x - this.px;
        this.vy = this.y - this.py;

        this.vx += this.gravityX;
        this.vy += this.gravityY;

        this.vx = this.vx * this.dfx;
        this.vy = this.vy * this.dfy;

        this.px = this.x;
        this.py = this.y;
        this.x += this.vx;
        this.y += this.vy;


        that.moveSubParticles();

    }
    else if(this.rebound){
        /**
         * Rebound process
         */
        if (that.x >= fluid.width - fluid.limit) {
            that.vx = -that.vx * that.damping;
            that.x = fluid.width - fluid.limit;

        } else if (that.x - fluid.limit <= 0) {
            that.vx = -that.vx * that.damping;
            that.x = fluid.limit;
        }

        if (that.y >= fluid.height - fluid.limit) {
            that.vy = -that.vy * that.damping;
            that.y = fluid.height - fluid.limit;

        } else if (that.y - fluid.limit <= 0) {
            that.vy = -that.vy * that.damping;
            that.y = fluid.limit;
        }

        that.vy += that.gravityY;

        that.px = that.x;
        that.py = that.y;
        that.x += that.vx;
        that.y += that.vy;


        that.moveSubParticles();


        /**
         * Rotation process
         */
        if(that.activeRotation == true){
            that.subParticles.forEach(function(particle){

                //x rotation = cos(θ)⋅(x−cx) − sin(θ)⋅(y−cy)+cx ; θ in radians
                //y rotation = sin(θ)⋅(x−cx) + cos(θ)⋅(y−cy)+cy

                //Set rotation to clockwise or counterclockwise in terms of rebound
                if(that.rotationWay == 0){
                    if(Math.sign(that.angle) == -1){
                        that.angle = that.angle*-1; //put to positive
                    }
                } else{
                    if(Math.sign(that.angle) == 1){
                        that.angle = that.angle*-1; //put to negative
                    }
                }

                //Calculate new coordinates
                var rotatedX = ((particle.x - that.x) * Math.cos(fluid.degreesToRadians(that.angle))) -
                    ((particle.y - that.y) * Math.sin(fluid.degreesToRadians(that.angle))) + that.x;
                var rotatedY = ((particle.x - that.x) * Math.sin(fluid.degreesToRadians(that.angle))) +
                    ((particle.y - that.y) * Math.cos(fluid.degreesToRadians(that.angle))) + that.y;

                particle.x = rotatedX;
                particle.y = rotatedY;
            });


            that.calculateXYParticlesFromLeader(that, that.subParticles);
        }

    }


    that.followLeader();
};


GroupParticle.prototype.second_process = function () {
    this.m = 0;
    // this.draw();


    this.subParticles.forEach(function(particle){
        particle.draw();
    });
};

/**
 * Move all particles with the leader
 */
GroupParticle.prototype.moveSubParticles = function(){
    var that = this;

    this.subParticles.forEach(function(particle){
        particle.vx = that.vx;
        particle.vy = that.vy;
        particle.px = particle.x;
        particle.py = particle.y;

        particle.x = that.x - particle.xDiffFromLead;
        particle.y = that.y - particle.yDiffFromLead;
    });
};



/**
 * Make all subParticles move regarding leader
 */
GroupParticle.prototype.followLeader = function(){
    var that = this;


    if(that.checkIfSubParticleCollideBorder()){

        //Set leader's coordinates with particle's coordinates who collide
        that.x = that.particleLimitInGroup.x;
        that.y = that.particleLimitInGroup.y;
        that.px = that.particleLimitInGroup.px;
        that.py = that.particleLimitInGroup.py;


        //If there is a new particle who collide, recalculated all coordinates from leader position
        if(that.previousParticleLimitInGroup == null || (that.previousParticleLimitInGroup.id != that.particleLimitInGroup.id)){
            that.calculateXYParticlesFromLeader(that, that.subParticles);
        }
        that.previousParticleLimitInGroup = that.particleLimitInGroup;

        this.rebound = true;
        this.activeRotation = true;

    } else{
        that.particleLimitInGroup = null;
        that.isCollide = false;
    }

};

/**
 * Check if any of the subParticles collide with a border
 * @returns {*}
 */
GroupParticle.prototype.checkIfSubParticleCollideBorder = function(){
    var that = this;

    that.limit = false;

    if(!settings.outflow){

        this.subParticles.forEach(function(particle, currentPosition){
            var particleHasChanged = false;

            //If a particle collided with a border
            if(that.limit){

                //Check for each next particles in the tab if they collide or not with a border
                for (var i = currentPosition; i < that.subParticles.length - 1; i++) {

                    //If collide, we changed the new particle collision reference
                    if (particle.x < fluid.limit || particle.x > fluid.width - fluid.limit) {
                        that.particleLimitInGroup = particle;
                        particleHasChanged = true;
                        break;
                    }
                    if ((particle.y < fluid.limit) || (particle.y > fluid.height - fluid.limit)) {
                        that.particleLimitInGroup = particle;
                        particleHasChanged = true;
                        break;
                    }
                }

                //If there is a new collide particle
                if(particleHasChanged){
                    //If the lead particle doesn't move and collide and the current particle collide, stop the rotation
                    if(this.prevVy == this.vy && that.isCollide && particle.isCollide){
                        that.angle = 0;
                    }
                } else{
                    return;
                }

            }


            /**
             * Test if the particle collide with a border
             */
            if (particle.x < fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            } else if (particle.x > fluid.width - fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            }

            if (particle.y < fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            } else if (particle.y > fluid.height - fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;


                that.isCollide = true;
                particle.isCollide = true;


                //Change the rotation angle. Rotate where there is a larger portion of particles
                if(currentPosition <= (that.subParticles.length - currentPosition)){
                    if(that.subParticles[that.subParticles.length - 1].x >= that.subParticles[currentPosition].x){
                        that.rotationWay = 0;
                    } else{
                        that.rotationWay = 1;
                    }
                } else if(currentPosition > (that.subParticles.length - currentPosition)){
                    if(that.subParticles[0].x >= that.subParticles[currentPosition].x){
                        that.rotationWay = 0;
                    } else{
                        that.rotationWay = 1;
                    }
                }

            } else {
                particle.isCollide = false;
            }

        });
    }

    return that.limit;
};


/**
 * Useful to make all particles follow the leader when the leader change his position
 */
GroupParticle.prototype.calculateXYParticlesFromLeader = function(leader, subParticles){
    subParticles.forEach(function(particle){
        particle.xDiffFromLead = leader.x - particle.x;
        particle.yDiffFromLead = leader.y - particle.y;
    });
};



GroupParticle.prototype.draw = function () {

    var size = element.radius * 2;

    fluid.meta_ctx.drawImage(
        element.textures[this.elementTypeId], //Draw the current type of the particle (water, fire, ...)
        this.x - element.radius,
        this.y - element.radius,
        size,
        size);
};
