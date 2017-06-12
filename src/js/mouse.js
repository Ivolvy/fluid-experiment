/**
 * Mouse events and particles drawing
 * @constructor
 */
var Mouse = function(){};


Mouse.prototype.init = function(){

    this.down = false;
    this.out = false;
    this.x = 0;
    this.y = 0;

    this.mouseDrawing = false;
    
    this.diff = 0;
    this.xDiff = 0;
    this.yDiff = 0;
    this.increaseValueX = 0;
    this.increaseValueY = 0;

    this.currentX = 0; //Current position get for the mouse
    this.currentY = 0;

    this.finalX = 0;
    this.finalY = 0;

    this.previousX = 0; //Previous position get for the mouse
    this.previousY = 0;
    this.outXposition = 0;
    this.outYposition = 0;

};

Mouse.prototype.process = function(){

    this.currentX = this.x;
    this.currentY = this.y;

    //Test the distance between two points and if it increase or decrease
    this.diff = this.currentX - this.previousX;
    this.xDiff = Math.abs(this.diff);
    this.increaseValueX = Math.sign(this.diff) == 1; //if == 1 -> true ; else -> false | 1: positive number | -1: negative number

    this.diff = this.currentY - this.previousY;
    this.yDiff = Math.abs(this.diff);
    this.increaseValueY = Math.sign(this.diff) == 1;



    if(this.xDiff > 10){
        if(this.increaseValueX){
            for (var drawX = this.previousX; drawX < this.currentX; drawX+=5){ //For each position until current mouse x
                if(this.out){
                    if(this.outXposition < fluid.width){ //if mouse go out of the canvas
                        this.currentX = 0;
                    }
                }
                mouse.drawXMissingParticles(drawX);
            }
        } else{
            for (var drawX = this.previousX; drawX > this.currentX; drawX-=5){
                if(this.out){
                    if(this.outXposition > fluid.width){
                        this.currentX = fluid.width;
                    }
                }
                mouse.drawXMissingParticles(drawX);
            }
        }

        this.previousX = this.finalX;
        this.previousY = this.finalY;

    }
    else if(this.yDiff > 10){
        if(this.increaseValueY){
            for (var drawY = this.previousY; drawY < this.currentY; drawY+=5){ //For each position until current mouse x
                if(this.out){
                    if(this.outYposition < fluid.height){ //if mouse go out of the canvas
                        this.currentY = 0;
                    }
                }
                mouse.drawYMissingParticles(drawY);
            }
        } else{
            for (var drawY = this.previousY; drawY > this.currentY; drawY-=5){
                if(this.out){
                    if(this.outYposition > fluid.height){
                        this.currentY = fluid.height;
                    }
                }
                mouse.drawYMissingParticles(drawY);
            }
        }

        this.previousX = this.finalX;
        this.previousY = this.finalY;
    }
    else{

        if(!this.out){

            mouse.testReplaceParticles(this.x, this.y);

            //Create particles on mouse position
            fluid.addParticle(settings.elementTypeId,this.x, this.y);

            this.previousX = this.x;
            this.previousY = this.y;
        }
    }
};


/**
 * Draw missing X particles
 */
Mouse.prototype.drawXMissingParticles = function(drawX){
    if(this.increaseValueY && this.previousY < this.currentY){
        this.previousY+=5;
    } else if(!this.increaseValueY && this.previousY > this.currentY){
        this.previousY-=5;
    }

    mouse.testReplaceParticles(drawX, this.previousY);

    //Create particles on mouse position
    fluid.addParticle(settings.elementTypeId, drawX, this.previousY);


    this.finalX = drawX; //last position
    this.finalY = this.previousY; //last position
};

/**
 * Draw missing Y particles
 */
Mouse.prototype.drawYMissingParticles = function(drawY){
    if(this.increaseValueX && this.previousX < this.currentX){
        this.previousX+=5;
    } else if(!this.increaseValueX && this.previousX > this.currentX){
        this.previousX-=5;
    }

    mouse.testReplaceParticles(this.previousX, drawY);

    //Create particles on mouse position
    fluid.addParticle(settings.elementTypeId,this.previousX, drawY);

    this.finalX = this.previousX; //last position
    this.finalY = drawY; //last position
};


/**
 * Replace below particles by those who are drawn above
 */
Mouse.prototype.testReplaceParticles = function(mouseX, mouseY){
    for (var i = 0; i < fluid.num_particles; i++) {
        if(settings.elementTypeId != fluid.particles[i].elementTypeId) {
            if (((mouseX + element.radius) >= fluid.particles[i].x && (mouseX - element.radius) <= fluid.particles[i].x)
                && ((mouseY + element.radius) >= fluid.particles[i].y && (mouseY - element.radius) <= fluid.particles[i].y)) {
                fluid.destroyParticle(fluid.particles[i]);
            }
        }
    }
};


var mouse = new Mouse();
mouse.init();