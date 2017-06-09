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



    if(this.checkGroupBorderLimits() ){

        this.pass = true;

        console.log("AAHAHAHAHHAHAHHAHAHHAHAHHAHAHAHHAHAHHAHAH:     "+that.particleLimitInGroup.id);

        //TODO: quand une particule rebondit, faire rebondire toutes ses soeurs en gardant les mêmes coordonnées par rapport à elle

        //    that.subParticles.forEach(function(element){

        that.particleLimitInGroup.px = that.particleLimitInGroup.x;
        that.particleLimitInGroup.py = that.particleLimitInGroup.y;


        if (that.particleLimitInGroup.x >= fluid.width - fluid.limit) {
            that.particleLimitInGroup.vx = -that.particleLimitInGroup.vx * that.damping;
            that.particleLimitInGroup.x = fluid.width - fluid.limit;

        } else if (that.particleLimitInGroup.x - fluid.limit <= 0) {
            that.particleLimitInGroup.vx = -that.particleLimitInGroup.vx * that.damping;
            that.particleLimitInGroup.x = fluid.limit;
        }

        if (that.particleLimitInGroup.y >= fluid.height - fluid.limit) {
            that.particleLimitInGroup.vy = -that.particleLimitInGroup.vy * that.damping;
            that.particleLimitInGroup.y = fluid.height - fluid.limit;
            // traction here


        } else if (that.particleLimitInGroup.y - fluid.limit <= 0) {
            that.particleLimitInGroup.vy = -that.particleLimitInGroup.vy * that.damping;
            that.particleLimitInGroup.y = fluid.limit;
        }

        that.particleLimitInGroup.vy += that.gravityY;

        that.particleLimitInGroup.x += that.particleLimitInGroup.vx;
        that.particleLimitInGroup.y += that.particleLimitInGroup.vy;





        //   });



        var referenceParticle = that.particleLimitInGroup; //particle which fire rebound event



        that.subParticles.forEach(function(subParticle){

            console.log("PARTICLE ID : "+subParticle.id);
            if(subParticle.id != referenceParticle.id){
                console.log("hello");
                console.log(referenceParticle.py);
                console.log(referenceParticle.y);
                subParticle.x = referenceParticle.x - (referenceParticle.px - subParticle.x);
                subParticle.y = referenceParticle.y - (referenceParticle.py - subParticle.y);
                /*     subParticle.vx = referenceParticle.vx;
                 subParticle.vy = referenceParticle.vy;*/
            }





        });















        /*
         this.subParticles.forEach(function(element){

         if (element.x >= fluid.width - fluid.limit) {
         element.vx = -element.vx * that.damping;
         element.x = fluid.width - fluid.limit;

         } else if (element.x - fluid.limit <= 0) {
         element.vx = -element.vx * that.damping;
         element.x = fluid.limit;
         }

         if (element.y >= fluid.height - fluid.limit) {
         element.vy = -element.vy * that.damping;
         element.y = fluid.height - fluid.limit;
         // traction here


         } else if (element.y - fluid.limit <= 0) {
         element.vy = -element.vy * that.damping;
         element.y = fluid.limit;
         }

         element.vy += that.gravityY;

         element.x += element.vx;
         element.y += element.vy;

         });*/

        //console.log(that.subParticles[0].x, that.subParticles[0].y);



    } else{
        //    if(this.pass){return;}
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

        if(this.pass){return;}
        this.subParticles.forEach(function(particle){
            /*
             particle.vx = that.vx;
             particle.vy = that.vy;
             particle.px = that.px;
             particle.py = that.py;
             particle.x = particle.x;
             particle.y = that.y;
             */




            particle.vx += particle.gravityX;
            particle.vy += particle.gravityY;
            particle.px = that.px + particle.intervalX;
            particle.py = that.py + particle.intervalY;
            particle.x = that.x + particle.intervalX;
            particle.y = that.y + particle.intervalY;
        });
    }








    /* if(this.y>300){
     this.pass = true;

     //  console.log(this.subParticles);


     console.log(that.subParticles[0].x, that.subParticles[0].x);
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

     console.log(that.subParticles[0].x, that.subParticles[0].y);



     } else{
     if(this.pass){return;}
     this.vx = this.x - this.px;
     this.vy = this.y - this.py;

     /!*if (mouse.down) {
     //here useful to interact with the fluid with mouse?
     }*!/

     this.vx += this.gravityX;
     this.vy += this.gravityY;
     this.px = this.x;
     this.py = this.y;
     this.x += this.vx;
     this.y += this.vy;


     this.subParticles.forEach(function(particle){
     /!*
     particle.vx = that.vx;
     particle.vy = that.vy;
     particle.px = that.px;
     particle.py = that.py;
     /!*  particle.x = particle.x;*!/
     particle.y = that.y;
     *!/



     particle.vx = that.vx;
     particle.vy = that.vy;

     particle.px = that.px + particle.intervalX;
     particle.py = that.py + particle.intervalY;
     particle.x = that.x + particle.intervalX;
     particle.y = that.y + particle.intervalY;
     });
     }
     */


    this.draw();

    this.subParticles.forEach(function(particle){
        particle.draw();
    });
};




GroupParticle.prototype.checkGroupBorderLimits = function(){
    var that = this;


    this.subParticles.forEach(function(particle){
        if (particle.x < fluid.limit) {
            if (settings.outflow) {
                if(particle.x < 0) {
                    fluid.destroyParticle(this);
                }
            } else{
                particle.x = fluid.limit;
                that.limit = true;
                that.particleLimitInGroup = particle;
            }
        } else if (particle.x > fluid.width - fluid.limit) {
            if (settings.outflow) {
                if(particle.x > fluid.width) { //Useful to not make the particles disappears instantly at extremes
                    fluid.destroyParticle(this);
                }
            } else{
                particle.x = fluid.width - fluid.limit;
                that.limit = true;
                that.particleLimitInGroup = particle;
            }
        }

        if (particle.y < fluid.limit) {
            if (settings.outflow) {
                fluid.destroyParticle(this);
            } else{
                particle.y = fluid.limit;
                that.limit = true;
                that.particleLimitInGroup = particle;
            }
        } else if (particle.y > fluid.height - fluid.limit) {
            if (settings.outflow) {
                if(particle.y > fluid.height){
                    fluid.destroyParticle(this);
                }
            } else{
                particle.y = fluid.height - fluid.limit;
                that.limit = true;
                that.particleLimitInGroup = particle;
            }
        }
    });
    console.log("pute");
    console.log(that.particleLimitInGroup);
    return that.limit;

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
/**
 * Created by michaelgenty on 09/06/2017.
 */
