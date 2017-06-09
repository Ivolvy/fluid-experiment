/**
 * Create Particle
 * @param elementTypeId
 * @param x
 * @param y
 * @param px
 * @param py
 * @param intervalX
 * @param intervalY
 * @constructor
 */
var GroupParticle = function(elementTypeId, x, y, px, py){
    this.id = fluid.particlesCreated;
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


    this.pass = false;
    this.particleLimitInGroup = null;

    if(elementTypeId == type.gas.id){
        this.gravityX = 0;
        this.gravityY = 0;
    } else{
        this.gravityX = settings.GRAVITY_X;
        this.gravityY = settings.GRAVITY_Y;
    }


    this.subParticles = [];


    this.damping = 0.45;
    this.traction = 50;

    this.limit = false;
this.rebound= false;
    this.previousXLeadValue = 0;
    this.previousYLeadValue = 0;
    this.changedXPosition = false;
    this.changedYPosition = false;
};

/**
 * Handle the gravity
 */
GroupParticle.prototype.first_process = function () {
    var that = this;

   /* if (this.x >= fluid.width - fluid.limit) {
        this.vx = -this.vx * this.damping;
        this.x = fluid.width - fluid.limit;

    } else if (this.x - fluid.limit <= 0) {
        this.vx = -this.vx * this.damping;
        this.x = fluid.limit;
    }

    if (this.y >= fluid.height - fluid.limit) {
        this.vy = -this.vy * this.damping;
        this.y = fluid.height - fluid.limit;
        // traction here


    } else if (this.y - fluid.limit <= 0) {
        this.vy = -this.vy * this.damping;
        this.y = fluid.limit;
    }

    this.vy += this.gravityY;

    this.x += this.vx;
    this.y += this.vy;*/


    if(this.checkBorderLimits()){
        //Doesn't pass here
        console.log("CHECK BORDER LIMITS");

    } else{

        this.previousXLeadValue = this.px;
        this.previousYLeadValue = this.py;


        if(!this.rebound) {
            this.vx = this.x - this.px;
            this.vy = this.y - this.py;

            this.vx += this.gravityX;
            this.vy += this.gravityY;
            this.px = this.x;
            this.py = this.y;
            this.x += this.vx;
            this.y += this.vy;


        }
        else if(this.rebound){
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
                // traction here


            } else if (that.y - fluid.limit <= 0) {
                that.vy = -that.vy * that.damping;
                that.y = fluid.limit;
            }

            that.vy += that.gravityY;

            that.px = that.x;
            that.py = that.y;
            that.x += that.vx;
            that.y += that.vy;


            if(that.particleLimitInGroup == null){
                that.subParticles.forEach(function(particle){
                    //  console.log(that.particleLimitInGroup);
                    that.particleLimitInGroup = that.subParticles[that.subParticles.length-1];

                    //x rotation = cos(θ)⋅(x−cx) − sin(θ)⋅(y−cy)+cx ; θ in radians
                    //y rotation = sin(θ)⋅(x−cx) + cos(θ)⋅(y−cy)+cy

                    var rotatedX = ((particle.x - that.particleLimitInGroup.x) * Math.cos(fluid.degreesToRadians(-10))) -
                        ((particle.y - that.particleLimitInGroup.y) * Math.sin(fluid.degreesToRadians(-10))) + that.particleLimitInGroup.x;
                    var rotatedY = ((particle.x - that.particleLimitInGroup.x) * Math.sin(fluid.degreesToRadians(-10))) +
                        ((particle.y - that.particleLimitInGroup.y) * Math.cos(fluid.degreesToRadians(-10))) + that.particleLimitInGroup.y;

                    particle.x = rotatedX;
                    particle.y = rotatedY;
                });

            }



        }

        if(this.previousYLeadValue == this.py){
            this.changedYPosition = false;

        } else{
            this.changedYPosition = true;
        }

        if(this.previousXLeadValue == this.px){
            this.changedXPosition = false;

        } else{
            this.changedXPosition = true;
        }



        that.followLeader();


    }



    this.draw();

    this.subParticles.forEach(function(particle){
        particle.draw();
    });
};


GroupParticle.prototype.followLeader = function(){
    var that = this;

    if(that.checkIfSubParticleCollideBorder()){

console.log(that.particleLimitInGroup.id);
        that.y = that.particleLimitInGroup.y;
        that.x = that.particleLimitInGroup.x;
        that.px = that.particleLimitInGroup.px;
        that.py = that.particleLimitInGroup.py;


        this.rebound = true;


    } else{
        that.particleLimitInGroup = null;
    }

    this.subParticles.forEach(function(particle){

        particle.vx = that.vx;
        particle.vy = that.vy;
        particle.px = particle.x;
        particle.py = particle.y;
        particle.x = particle.x + (that.x - that.px);


        if(that.changedYPosition && that.limit == false){
            particle.y = particle.y + (that.y - that.py);
        }
    });

};


GroupParticle.prototype.checkIfSubParticleCollideBorder = function(){
    var that = this;

    that.limit = false;

    if(!settings.outflow){
        this.subParticles.forEach(function(particle){

    /*    if(that.limit){  //TODO: activate this and pass that.x/y to particle.X/Y
            return;
        }*/

            if (that.x < fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            } else if (that.x > fluid.width - fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            }

            if (that.y < fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            } else if (that.y > fluid.height - fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
            }

        });

    }

    return that.limit;
};


GroupParticle.prototype.checkBorderLimits = function(){
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


GroupParticle.prototype.draw = function () {

    var size = element.radius * 2;

    fluid.meta_ctx.drawImage(
        element.textures[this.elementTypeId], //Draw the current type of the particle (water, fire, ...)
        this.x - element.radius,
        this.y - element.radius,
        size,
        size);
};
