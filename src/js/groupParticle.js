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

    this.stopRebound = false;




    this.isCollide = false;

};

/**
 * Handle the gravity
 */
GroupParticle.prototype.first_process = function () {
    var that = this;

    if(this.checkBorderLimits()){
        //Doesn't pass here
        console.log("CHECK BORDER LIMITS");

    } else{


        this.prevVy = this.vy;


        if(!this.rebound) {
            this.vx = this.x - this.px;
            this.vy = this.y - this.py;

            this.vx += this.gravityX;
            this.vy += this.gravityY;
            this.px = this.x;
            this.py = this.y;
            this.x += this.vx;
            this.y += this.vy;


            //Move all particles with the leader
            this.subParticles.forEach(function(particle){

                particle.vx = that.vx;
                particle.vy = that.vy;
                particle.px = particle.x;
                particle.py = particle.y;



                particle.x = that.x - particle.xDiffFromLead;
                particle.y = that.y - particle.yDiffFromLead;
            });


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

            } else if (that.y - fluid.limit <= 0) {
                that.vy = -that.vy * that.damping;
                that.y = fluid.limit;
            }

            that.vy += that.gravityY;

            that.px = that.x;
            that.py = that.y;
            that.x += that.vx;
            that.y += that.vy;


            //Move all particles with the leader
            this.subParticles.forEach(function(particle){
                particle.vx = that.vx;
                particle.vy = that.vy;
                particle.px = particle.x;
                particle.py = particle.y;

                particle.x = that.x - particle.xDiffFromLead;
                particle.y = that.y - particle.yDiffFromLead;
            });


            if(that.activeRotation == true){
                that.subParticles.forEach(function(particle){

                    //x rotation = cos(θ)⋅(x−cx) − sin(θ)⋅(y−cy)+cx ; θ in radians
                    //y rotation = sin(θ)⋅(x−cx) + cos(θ)⋅(y−cy)+cy


                    if(that.rotationWay == 0){
                        if(Math.sign(that.angle) == -1){
                            that.angle = that.angle*-1; //put to positive
                        }
                    } else{
                        if(Math.sign(that.angle) == 1){
                            that.angle = that.angle*-1; //put to negative
                        }
                    }


                    var rotatedX = ((particle.x - that.x) * Math.cos(fluid.degreesToRadians(that.angle))) -
                        ((particle.y - that.y) * Math.sin(fluid.degreesToRadians(that.angle))) + that.x;
                    var rotatedY = ((particle.x - that.x) * Math.sin(fluid.degreesToRadians(that.angle))) +
                        ((particle.y - that.y) * Math.cos(fluid.degreesToRadians(that.angle))) + that.y;

                    particle.x = rotatedX;
                    particle.y = rotatedY;
                });

               //that.angle *= 0.95;

               // console.log(that.angle);

                that.calculateXYParticlesFromLeader(that, that.subParticles);
            }




        }



        that.followLeader();


    }



   // this.draw();

    this.subParticles.forEach(function(particle){
        particle.draw();
    });
};


GroupParticle.prototype.followLeader = function(){
    var that = this;





    if(that.checkIfSubParticleCollideBorder() && this.stopRebound == false){

        //console.log(that.particleLimitInGroup.id);

        that.x = that.particleLimitInGroup.x;
        that.y = that.particleLimitInGroup.y;
        that.px = that.particleLimitInGroup.px;
        that.py = that.particleLimitInGroup.py;


        if(that.previousParticleLimitInGroup == null || (that.previousParticleLimitInGroup.id != that.particleLimitInGroup.id)){
            console.log("recalcul");
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


            if(that.limit){

                for (var i = currentPosition; i < that.subParticles.length - 1; i++) {

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

                if(!particleHasChanged){
                    return;
                } else{
                    console.log("particleHasChanged: "+particleHasChanged);

                    if(this.prevVy == this.vy && that.isCollide && particle.isCollide){
                        that.angle = 0;
                    }


                }

            }

           // console.log(particle.id);
            if (particle.x < fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
                console.log("COLLISION X");
            } else if (particle.x > fluid.width - fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
                console.log("COLLISION X");
            }

            if (particle.y < fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
                console.log("COLLISION Y");
            } else if (particle.y > fluid.height - fluid.limit) {
                that.limit = true;
                that.particleLimitInGroup = particle;
                console.log("COLLISION Y");


                that.isCollide = true;
                particle.isCollide = true;


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
       // console.log(that.particleLimitInGroup);
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
