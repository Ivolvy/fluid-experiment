
var element = require('./element.js');
var type = require('./type.js');
var Particle = require('./particle.js');



class Fluid{
    constructor(){
        this.meta_ctx = null;

        this.num_x = 0;
        this.num_y = 0;

        this.grid = null;

        this.particles = [];

        this.spacing = 45; //Minimal distance between two particles
        this.limit = element.radius * 0.66;

        this.num_particles = 0;

        this.particlesCreated = 0;
        this.idGroupParticlesCreated = 0;

        this.groupParticles = [];
        this.groupLength = 0;
    }


    /**
     * Add particle
     * @param elementTypeId
     * @param x
     * @param y
     * @param px
     * @param py
     */
    addParticle(elementTypeId,x, y, px, py){
        var that = this;

        that.particles.push(
            new Particle(fluid, elementTypeId, x, y, px, py)
        );

        //If the element is fire
        if(elementTypeId == type.fire.id){
            element.processFire(that.particles[that.particles.length - 1], fluid);
        }

        that.num_particles = that.particles.length;
    }


    /**
     * Delete particle outside canvas
     * @param obj
     */
    destroyParticle(obj){
        var that = this;

        //Remove only the particle with his id
        for(let i=0 ; i < that.particles.length; i++){
            if(that.particles[i].id == obj.id) {
                that.particles.splice(i, 1);
            }
        }

        that.num_particles = that.particles.length;
    }


    /**
     * Erase all particles and reset ids
     */
    eraseAllParticles(){
        this.particles = []; //reset
        this.num_particles = this.particles.length; //reset
        this.groupParticles = [];
        this.groupLength = this.groupParticles.length;
        this.particlesCreated = 0;
        this.idGroupParticlesCreated = 0;
    }


}


var fluid = new Fluid();
module.exports = fluid;