

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
    this.particles = null;
    this.grid= null;
    this.meta_ctx= null;

    this.context = this;

    this.threshold = 220;
    this.play = false;
    this.spacing = 45;
    this.radius = 30;
    this.limit = this.radius * 0.66;
    this.textures = [];
    this.num_particles = 0;
    this.mouseDrawing = false;

    this.previousX = 0;
    this.previousY = 0;
    this.outXposition = 0;
    this.outYposition = 0;


    this.mouse = {
        down: false,
        out: false,
        x: 0,
        y: 0
    };


};

Fluid.prototype.process_image = function() {
    var that = this;

    var imageData = that.meta_ctx.getImageData(0, 0, that.width, that.height);
    var pix = imageData.data;

    for (var i = 0, n = pix.length; i < n; i += 4) {
        (pix[i + 3] < that.threshold) && (pix[i + 3] /= 6);
    }

    that.ctx.putImageData(imageData, 0, 0);
};


Fluid.prototype.run = function () {
    var that = fluid.context;

    //var time = new Date().getTime();
    that.meta_ctx.clearRect(0, 0, that.width, that.height);

    for (var i = 0, l = that.num_x * that.num_y; i < l; i++){
        that.grid[i].length = 0;
    }


    var i = that.num_particles;
    if((!settings.pauseOnDrawing && that.mouseDrawing) || !that.mouseDrawing) {
        while(i--) that.particles[i].first_process();
    }

    i = that.num_particles;
    while (i--) that.particles[i].second_process();


    fluid.process_image();



    if(that.mouse.down) {

        var xDiff, yDiff;
        var increaseValueX, increaseValueY;

        var currentX = that.mouse.x;
        var currentY = that.mouse.y;

        if(that.previousX > currentX){ //Right to left
            xDiff = that.previousX - currentX;
            increaseValueX = false;
        }
        if(that.previousX < currentX ){ //Left to right
            xDiff = currentX - that.previousX;
            increaseValueX = true;
        }


        if(that.previousY > currentY){ //Bottom to Top
            yDiff = that.previousY - currentY;
            increaseValueY = false;
        }
        if(that.previousY < currentY ){ //Top to bottom
            yDiff = currentY - that.previousY;
            increaseValueY = true;
        }

        var finalX = 0;
        var finalY = 0;

        if(xDiff > 10){
            //console.log("      X     ");
            if(increaseValueX){
                for (var a = that.previousX; a < currentX; a+=5){ //For each position until current mouse x
                    if(that.mouse.out){
                        if(that.outXposition < that.width){ //if mouse go out of the canvas
                            currentX = 0;
                        }
                    }

                    if(increaseValueY && that.previousY < currentY){
                        that.previousY+=5;
                    } else if(!increaseValueY && that.previousY > currentY){
                        that.previousY-=5;
                    }


                    //Create particles on mouse position
                    that.particles.push(
                        new Particle(
                            0,
                            a,
                            that.previousY
                        )
                    );
                    finalX = a; //last position
                    finalY = that.previousY; //last position
                }
            } else{
                for (var a = that.previousX; a > currentX; a-=5){
                    if(that.mouse.out){
                        if(that.outXposition > that.width){
                            currentX = that.width;
                        }
                    }


                    if(increaseValueY && that.previousY < currentY){
                        that.previousY+=5;
                    } else if(!increaseValueY && that.previousY > currentY){
                        that.previousY-=5;
                    }

                    //Create particles on mouse position
                    that.particles.push(
                        new Particle(
                            0,
                            a,
                            that.previousY
                        )
                    );

                    finalX = a;
                    finalY = that.previousY; //last position
                }
            }

            that.previousX = finalX;
            that.previousY = finalY;

        }
        else if(yDiff > 10){
            //console.log("      Y     ");
            if(increaseValueY){
                for (var a = that.previousY; a < currentY; a+=5){ //For each position until current mouse x
                    if(that.mouse.out){
                        if(that.outYposition < that.height){ //if mouse go out of the canvas
                            currentY = 0;
                        }
                    }


                    if(increaseValueX && that.previousX < currentX){
                        that.previousX+=5;
                    } else if(!increaseValueX && that.previousX > currentX){
                        that.previousX-=5;
                    }

                    //Create particles on mouse position
                    that.particles.push(
                        new Particle(
                            0,
                            that.previousX,
                            a
                        )
                    );
                    finalX = that.previousX; //last position
                    finalY = a; //last position
                }
            } else{
                for (var a = that.previousY; a > currentY; a-=5){
                    if(that.mouse.out){
                        if(that.outYposition > that.height){
                            currentY = that.height;
                        }
                    }


                    if(increaseValueX && that.previousX < currentX){
                        that.previousX+=5;
                    } else if(!increaseValueX && that.previousX > currentX){
                        that.previousX-=5;
                    }


                    //Create particles on mouse position
                    that.particles.push(
                        new Particle(
                            0,
                            currentX,
                            a
                        )
                    );

                    finalX = that.previousX; //last position
                    finalY = a;
                }
            }

            that.previousX = finalX;
            that.previousY = finalY;
        }
        else{

            if(!that.mouse.out){

                //Create particles on mouse position
                that.particles.push(
                    new Particle(
                        0,
                        that.mouse.x,
                        that.mouse.y
                    )
                );
                that.previousX = that.mouse.x;
                that.previousY = that.mouse.y;
            }
        }


        that.num_particles = that.particles.length; //Update length
    } else{
        that.previousX = that.mouse.x;
        that.previousY = that.mouse.y;
    }

    //console.log(new Date().getTime() - time);

    if(that.play && !settings.pauseGame) {
        requestAnimFrame(fluid.run, fluid.ct);
    }
};



Fluid.prototype.init = function(canvas, w, h){
    var that = this;

    that.particles = [];
    that.grid      = [];
    that.textures  = [];

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

    for(var i = 0; i < settings.GROUPS.length; i++) {

        var color;

        color = settings.COLOR;

        that.textures[i] = document.createElement("canvas");
        that.textures[i].width  = that.radius * 2;
        that.textures[i].height = that.radius * 2;
        var nctx = that.textures[i].getContext("2d");

        var grad = nctx.createRadialGradient(
            that.radius,
            that.radius,
            1, //Inner circle that.radius
            that.radius,
            that.radius,
            that.radius
        );

        grad.addColorStop(0, color + ',1)'); //gradient coloring
        grad.addColorStop(1, color + ',0)');
        nctx.fillStyle = grad;

        nctx.beginPath();
        nctx.arc(that.radius, that.radius, that.radius, 0, Math.PI * 2, true);
        nctx.closePath();
        nctx.fill();
    }

    canvas.onmousedown = function(e) {
        that.mouse.down = true;
        that.mouseDrawing = true;
        return false;
    };

    document.onmouseup = function(e) { //on document 'cause we want to release fluid even if we are out canvas
        that.mouse.down = false;
        that.mouseDrawing = false;
        return false;
    };

    canvas.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        that.mouse.x = e.clientX - rect.left;
        that.mouse.y = e.clientY - rect.top;
        return false;
    };

    //If we are out or over the canvas
    canvas.onmouseout = function(e){
        that.outXposition = e.pageX - this.offsetLeft; //calculate the out x position of the mouse
        that.outYposition = e.pageY - this.offsetTop;

        that.mouse.out = true;

    };

    canvas.onmouseover = function(e){
        that.mouse.out = false;
    };

    that.num_x = Math.round(that.width / that.spacing) + 1;
    that.num_y = Math.round(that.height / that.spacing) + 1;


    for (var i = 0; i < that.num_x * that.num_y; i++) {
        that.grid[i] = {
            length: 0,
            close: []
        }
    }

    for (var i = 0; i < settings.GROUPS.length; i++ ) {
        for (var k = 0; k < settings.GROUPS[i]; k++ ) {
            that.particles.push(
                new Particle(
                    i,
                    that.radius + Math.random() * (that.width - that.radius * 2),
                    that.radius + Math.random() * (that.height - that.radius * 2)
                )
            );

        }
    }


    that.num_particles = that.particles.length;

    that.play = true;
    fluid.run(this);
};


Fluid.prototype.stop = function(){
    this.play = false;
};

Fluid.prototype.resume = function(){
    this.run();
};



var fluid = new Fluid();
fluid.init('canvas', 800, 600);


