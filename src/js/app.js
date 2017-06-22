

window.requestAnimFrame =
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };


var Fluid = function(){
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.num_x = 0;
    this.num_y = 0;
    this.particles = [];
    this.grid= null;
    this.meta_ctx= null;

    this.context = this;

    this.threshold = 220;
    this.play = false;
    this.spacing = 45; //Minimal distance between two particles
    this.limit = element.radius * 0.66;
    this.num_particles = 0;

    this.particlesCreated = 0;
    this.idGroupParticlesCreated = 0;

    this.corners = [];


    this.currentGroupParticle = null;
    this.groupParticles = [];
    this.groupLength = 0;
};


Fluid.prototype.process_image = function() {
    var that = this;

    var imageData = that.meta_ctx.getImageData(0, 0, that.width, that.height);
    var pix = imageData.data;

    for (var i = 0, n = pix.length; i < n; i += 4) {
        (pix[i + 3] < that.threshold) && (pix[i + 3] /= 6);
    }

    that.ctx.putImageData(imageData, 0, 0);


    /*that.corners.forEach(function(arc){
        arc.draw();
    });*/

};

/**
 * Add particle
 * @param elementTypeId
 * @param x
 * @param y
 * @param px
 * @param py
 */
Fluid.prototype.addParticle = function(elementTypeId,x, y, px, py) {
    var that = this;

    that.particles.push(
        new Particle(
            elementTypeId,
            x,
            y,
            px,
            py
        )
    );

    //If the element is fire
    if(elementTypeId == type.fire.id){
        element.processFire(that.particles[that.particles.length - 1]);
    }

    that.num_particles = that.particles.length;
};


//Useful for debug and tests
Fluid.prototype.addGroupParticles = function(elementTypeId,x, y, px, py) {
    var that = this;



    var group =  new GroupParticle(type.fire.id, x, y,x+2);
    group.subParticles.push(new Particle(elementTypeId, x+10, y+10));
    group.subParticles.push(new Particle(elementTypeId, x+20, y+20));
    group.subParticles.push(new Particle(elementTypeId, x+30, y+30));
    group.subParticles.push(new Particle(elementTypeId, x+40, y+40));
    group.subParticles.push(new Particle(elementTypeId, x+50, y+50));


    that.groupParticles.push(group);
    that.groupLength = that.groupParticles.length;



    group.calculateXYParticlesFromLeader(group, group.subParticles);

};


/**
 * Create a group element to contains particles
 * @param elementTypeId
 * @param x
 * @param y
 */
Fluid.prototype.createGroupParticles = function(elementTypeId,x, y) {
    this.currentGroupParticle =  new GroupParticle(type.rigid.id, x, y);

    this.groupParticles.push(this.currentGroupParticle);
    this.groupLength = this.groupParticles.length;
};

/**
 * Close a group element of particles
 */
Fluid.prototype.closeGroupParticles = function() {
    //Calculate all particles coordinates
    this.currentGroupParticle.calculateXYParticlesFromLeader(this.currentGroupParticle, this.currentGroupParticle.subParticles);
    this.currentGroupParticle = null;
};


/**
 * Delete particle outside canvas
 * @param obj
 */
Fluid.prototype.destroyParticle = function(obj) {
    var that = this;

    //Remove only the particle with his id
    for(var i=0 ; i < that.particles.length; i++){
        if(that.particles[i].id == obj.id) {
            that.particles.splice(i, 1);
        }
    }

    that.num_particles = that.particles.length;
};

/**
 * Calculate particles movements and display them
 */
Fluid.prototype.calculateAndDisplayParticles = function(){
    var that = this;

    var i = that.num_particles;
    var y = that.groupLength;

    if((!settings.pauseOnDrawing && mouse.mouseDrawing) || !mouse.mouseDrawing) {
        while(i--) {
            if(that.particles[i]){
                that.particles[i].first_process();
            }
        }

        while(y--){
            if(that.groupParticles[y]){
                that.groupParticles[y].first_process();

                that.groupParticles[y].subParticles.forEach(function(particle){
                    particle.first_process();
                });
            }
        }
    }

    i = that.num_particles;
    while (i--) {
        if(that.particles[i]) {
            that.particles[i].second_process();
        }
    }

    y = that.groupLength;
    while(y--){
        if(that.groupParticles[y]){
            that.groupParticles[y].second_process();

            //Check all subParticles of each groupParticles
            that.groupParticles[y].subParticles.forEach(function(particle){
                particle.second_process();
            });
        }
    }
};


Fluid.prototype.run = function () {
    var that = fluid.context;

    //var time = new Date().getTime();
    that.meta_ctx.clearRect(0, 0, that.width, that.height);

    for (var i = 0, l = that.num_x * that.num_y; i < l; i++){
        that.grid[i].length = 0;
    }



    fluid.calculateAndDisplayParticles();
    fluid.process_image();


    //Added infinite particles at left corner
    if(settings.inflow){
        fluid.addParticle(type.water.id, fluid.limit, fluid.limit, fluid.limit-4); //-4 to give an impulse
    }


    //We draw particles between each point we get from mouse - in order to fill lines proportionally
    if(mouse.down) {
        //If the delete property is not activate
        if(!settings.wipe){
            mouse.process();
        }

        //Delete particles when we click on them
        if(settings.wipe) {
            for (var i = 0; i < that.num_particles; i++) {
                if (((mouse.x + element.radius) >= that.particles[i].x && (mouse.x - element.radius) <= that.particles[i].x)
                    && ((mouse.y + element.radius) >= that.particles[i].y && (mouse.y - element.radius) <= that.particles[i].y)) {
                    fluid.destroyParticle(that.particles[i]);
                }
            }
        }

    } else{
        mouse.previousX = mouse.x;
        mouse.previousY = mouse.y;
    }

    //console.log(new Date().getTime() - time);

    if(that.play && !settings.pauseGame) {
        requestAnimFrame(fluid.run);
    }
};



Fluid.prototype.init = function(canvas, w, h){
    var that = this;

    that.particles = [];
    that.grid      = [];

    var canvas 	  = document.getElementById(canvas);
    that.ctx   	      = canvas.getContext('2d');
    canvas.height = h || window.innerHeight;
    canvas.width  = w || window.innerWidth;
    that.width         = canvas.width;
    that.height        = canvas.height;

    var meta_canvas    = document.createElement("canvas");
    meta_canvas.width  = that.width;
    meta_canvas.height = that.height;
    that.meta_ctx           = meta_canvas.getContext("2d");


    //Preload all particles elements
    element.preloadAllElements();


    that.num_x = Math.round(that.width / that.spacing) + 1;
    that.num_y = Math.round(that.height / that.spacing) + 1;


    for (var i = 0; i < that.num_x * that.num_y; i++) {
        that.grid[i] = {
            length: 0,
            close: []
        }
    }

    //fluid.addGroupParticles(type.rigid.id, 80, 20, fluid.limit - 4);


    //fluid.drawCorners(); - for future use (rebound particles on curved corners)


    that.play = true;

    fluid.initEvents(canvas);
    fluid.run(this);
};

/**
 * Init events on mouse
 * @param canvas
 */
Fluid.prototype.initEvents = function(canvas){
    var that = this;

    canvas.onmousedown = function(e) {
        mouse.down = true;
        mouse.mouseDrawing = true;

        //If the selected element is the rigid element (Group formation - maybe to pass in parameter in future if we have several group)
        if(settings.elementTypeId == type.rigid.id){
            fluid.createGroupParticles(settings.elementTypeId, mouse.x, mouse.y); //todo: check if mouse x and y are correct
        }
    };

    //Useful for debug - deactivate requestAnimFrame(fluid.run); and press spacebar
    document.body.onkeydown = function(e){
        if(e.keyCode == 32){
            fluid.run();
        }
    };

    document.onmouseup = function(e) { //on document 'cause we want to release fluid even if we are out canvas
        mouse.down = false;
        mouse.mouseDrawing = false;

        //reset mouse positions
        mouse.previousX = 0;
        mouse.previousY = 0;


        //If there is a current group particle, close it
        if(that.currentGroupParticle != null){
            fluid.closeGroupParticles();
        }
    };

    canvas.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    //If we are out or over the canvas
    canvas.onmouseout = function(e){
        mouse.outXposition = e.pageX - this.offsetLeft; //calculate the out x position of the mouse
        mouse.outYposition = e.pageY - this.offsetTop;

        mouse.out = true;
    };

    canvas.onmouseover = function(e){
        mouse.out = false;
    };
};


Fluid.prototype.stop = function(){
    this.play = false;
};

Fluid.prototype.resume = function(){
    this.run();
};


/**
 * Erase all particles and reset ids
 */
Fluid.prototype.eraseAllParticles = function(){
    this.particles = []; //reset
    this.num_particles = this.particles.length; //reset
    this.groupParticles = [];
    this.groupLength = this.groupParticles.length;
    this.particlesCreated = 0;
    this.idGroupParticlesCreated = 0;
};


/**
 * Draw all corners
 */
Fluid.prototype.drawCorners = function(){
    fluid.drawArc(fluid.width - 75, 75, 75, -90, 0);
    fluid.drawArc(fluid.width - 75, fluid.height - 75, 75, 0, 90);
    fluid.drawArc(75, fluid.height - 75, 75, 90, 180);
    fluid.drawArc(75, 75, 75, 180, -90);
};


/**
 * Draw an arc
 * @param x
 * @param y
 * @param radius
 * @param startAngle
 * @param endAngle
 */
Fluid.prototype.drawArc = function(x, y, radius, startAngle, endAngle){
    var that = this;

    this.arc = {
        x: x,
        y: y,
        radius: radius,
        draw: function () {
            that.ctx.beginPath();
            that.ctx.arc(this.x, this.y, this.radius, fluid.degreesToRadians(startAngle), fluid.degreesToRadians(endAngle), false);
            that.ctx.stroke();
        }
    };

    this.corners.push(this.arc);
};

/**
 * Convert degrees to radians
 * @param degrees
 * @returns {number}
 */
Fluid.prototype.degreesToRadians = function(degrees) {
    return (degrees * Math.PI) / 180;
};


var fluid = new Fluid();



