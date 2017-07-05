

var fluid = require('./fluid.js');
var mouse = require('./mouse.js');
var element = require('./element.js');
var events = require('./events.js');
var settings = require('./settings.js');
var type = require('./type.js');
var Particle = require('./particle.js');
var GroupParticle = require('./groupParticle.js');




window.requestAnimFrame =
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };


var App = function(){
    this.ctx = null;


    this.context = this;

    this.threshold = 220;
    this.play = false;


    this.corners = [];


    this.currentGroupParticle = null;

    events.init(this);
};


App.prototype.process_image = function() {
    var that = this;

    var imageData = fluid.meta_ctx.getImageData(0, 0, settings.width, settings.height);
    var pix = imageData.data;

    for (let i = 0, n = pix.length; i < n; i += 4) {
        (pix[i + 3] < that.threshold) && (pix[i + 3] /= 6);
    }

    that.ctx.putImageData(imageData, 0, 0);


    /*that.corners.forEach(function(arc){
        arc.draw();
    });*/

};




//Useful for debug and tests
App.prototype.addGroupParticles = function(elementTypeId,x, y, px, py) {
    var that = this;

    var group =  new GroupParticle(fluid, type.fire.id, x, y,x+2);
    group.subParticles.push(new Particle(fluid, elementTypeId, x+10, y+10));
    group.subParticles.push(new Particle(fluid, elementTypeId, x+20, y+20));
    group.subParticles.push(new Particle(fluid, elementTypeId, x+30, y+30));
    group.subParticles.push(new Particle(fluid, elementTypeId, x+40, y+40));
    group.subParticles.push(new Particle(fluid, elementTypeId, x+50, y+50));


    fluid.groupParticles.push(group);
    fluid.groupLength = fluid.groupParticles.length;


    group.calculateXYParticlesFromLeader(group, group.subParticles);
};


/**
 * Create a group element to contains particles
 * @param elementTypeId
 * @param x
 * @param y
 */
App.prototype.createGroupParticles = function(elementTypeId,x, y) {
    this.currentGroupParticle =  new GroupParticle(fluid, type.rigid.id, x, y);

    fluid.groupParticles.push(this.currentGroupParticle);
    fluid.groupLength = fluid.groupParticles.length;
};

/**
 * Close a group element of particles
 */
App.prototype.closeGroupParticles = function() {
    //Calculate all particles coordinates
    this.currentGroupParticle.calculateXYParticlesFromLeader(this.currentGroupParticle, this.currentGroupParticle.subParticles);
    this.currentGroupParticle = null;
};




/**
 * Calculate particles movements and display them
 */
App.prototype.calculateAndDisplayParticles = function(){
    var that = this;

    var i = fluid.num_particles;
    var y = fluid.groupLength;

    if((!settings.pauseOnDrawing && mouse.mouseDrawing) || !mouse.mouseDrawing) {
        while(i--) {
            if(fluid.particles[i]){
                fluid.particles[i].first_process(fluid);
            }
        }

        while(y--){
            if(fluid.groupParticles[y]){
                fluid.groupParticles[y].first_process(fluid);

                fluid.groupParticles[y].subParticles.forEach(particle => particle.first_process(fluid));
            }
        }
    }

    i = fluid.num_particles;
    while (i--) {
        if(fluid.particles[i]) {
            fluid.particles[i].second_process(fluid);
        }
    }

    y = fluid.groupLength;
    while(y--){
        if(fluid.groupParticles[y]){
            fluid.groupParticles[y].second_process(fluid);

            //Check all subParticles of each groupParticles
            fluid.groupParticles[y].subParticles.forEach(particle => particle.second_process(fluid));
        }
    }
};


App.prototype.run = function () {
    var that = app.context;

    //var time = new Date().getTime();
    fluid.meta_ctx.clearRect(0, 0, settings.width, settings.height);

    for (let i = 0, l = fluid.num_x * fluid.num_y; i < l; i++){
        fluid.grid[i].length = 0;
    }



    app.calculateAndDisplayParticles();
    app.process_image();


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
            for (let i = 0; i < fluid.num_particles; i++) {
                if (((mouse.x + element.radius) >= fluid.particles[i].x && (mouse.x - element.radius) <= fluid.particles[i].x)
                    && ((mouse.y + element.radius) >= fluid.particles[i].y && (mouse.y - element.radius) <= fluid.particles[i].y)) {
                    fluid.destroyParticle(fluid.particles[i]);
                }
            }
        }
    } else{
        mouse.previousX = mouse.x;
        mouse.previousY = mouse.y;
    }

    //console.log(new Date().getTime() - time);

    if(that.play && !settings.pauseGame) {
        requestAnimFrame(app.run);
    }
};



App.prototype.init = function(canvas, w, h){
    var that = this;

    fluid.particles = [];
    fluid.grid      = [];

    var canvas 	  = document.getElementById(canvas);
    that.ctx   	      = canvas.getContext('2d');
    canvas.height = h || window.innerHeight;
    canvas.width  = w || window.innerWidth;
    settings.width         = canvas.width;
    settings.height        = canvas.height;

    var meta_canvas    = document.createElement("canvas");
    meta_canvas.width  = settings.width;
    meta_canvas.height = settings.height;
    fluid.meta_ctx           = meta_canvas.getContext("2d");


    //Preload all particles elements
    element.preloadAllElements();


    fluid.num_x = Math.round(settings.width / fluid.spacing) + 1;
    fluid.num_y = Math.round(settings.height / fluid.spacing) + 1;


    for (let i = 0; i < fluid.num_x * fluid.num_y; i++) {
        fluid.grid[i] = {
            length: 0,
            close: []
        }
    }

    //app.addGroupParticles(type.rigid.id, 80, 20, settings.limit - 4);


    //app.drawCorners(); - for future use (rebound particles on curved corners)


    that.play = true;

    app.initEvents(canvas);
    app.run(this);
};

/**
 * Init events on mouse
 * @param canvas
 */
App.prototype.initEvents = function(canvas){
    var that = this;

    canvas.onmousedown = function(e) {
        mouse.down = true;
        mouse.mouseDrawing = true;

        //If the selected element is the rigid element (Group formation - maybe to pass in parameter in future if we have several group)
        if(settings.elementTypeId == type.rigid.id){
            app.createGroupParticles(settings.elementTypeId, mouse.x, mouse.y);
        }
    };

    //Useful for debug - deactivate requestAnimFrame(app.run); and press spacebar
    document.body.onkeydown = function(e){
        if(e.keyCode == 32){
            app.run();
        }
    };

    document.onmouseup = function(e) { //on document 'cause we want to release app even if we are out canvas
        mouse.down = false;
        mouse.mouseDrawing = false;

        //reset mouse positions
        mouse.previousX = 0;
        mouse.previousY = 0;


        //If there is a current group particle, close it
        if(that.currentGroupParticle != null){
            app.closeGroupParticles();
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


App.prototype.stop = function(){
    this.play = false;
};

App.prototype.resume = function(){
    this.run();
};



/**
 * Draw all corners
 */
App.prototype.drawCorners = function(){
    app.drawArc(settings.width - 75, 75, 75, -90, 0);
    app.drawArc(settings.width - 75, settings.height - 75, 75, 0, 90);
    app.drawArc(75, settings.height - 75, 75, 90, 180);
    app.drawArc(75, 75, 75, 180, -90);
};


/**
 * Draw an arc
 * @param x
 * @param y
 * @param radius
 * @param startAngle
 * @param endAngle
 */
App.prototype.drawArc = function(x, y, radius, startAngle, endAngle){
    var that = this;

    this.arc = {
        x: x,
        y: y,
        radius: radius,
        draw: function () {
            that.ctx.beginPath();
            that.ctx.arc(this.x, this.y, this.radius, app.degreesToRadians(startAngle), app.degreesToRadians(endAngle), false);
            that.ctx.stroke();
        }
    };

    this.corners.push(this.arc);
};




var app = new App();
module.exports = app;

app.init('canvas', 800, 600);

