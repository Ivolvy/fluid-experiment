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

    if(this.previousX > this.currentX){ //Right to left
        this.xDiff = this.previousX - this.currentX;
        this.increaseValueX = false;
    }
    if(this.previousX < this.currentX ){ //Left to right
        this.xDiff = this.currentX - this.previousX;
        this.increaseValueX = true;
    }


    if(this.previousY > this.currentY){ //Bottom to Top
        this.yDiff = this.previousY - this.currentY;
        this.increaseValueY = false;
    }
    if(this.previousY < this.currentY ){ //Top to bottom
        this.yDiff = this.currentY - this.previousY;
        this.increaseValueY = true;
    }



    if(this.xDiff > 10){
        if(this.increaseValueX){
            for (var drawX = this.previousX; drawX < this.currentX; drawX+=5){ //For each position until current mouse x
                if(this.out){
                    if(this.outXposition < fluid.width){ //if mouse go out of the canvas
                        this.currentX = 0;
                    }
                }

                if(this.increaseValueY && this.previousY < this.currentY){
                    this.previousY+=5;
                } else if(!this.increaseValueY && this.previousY > this.currentY){
                    this.previousY-=5;
                }


                //Create particles on mouse position
                fluid.addParticle(settings.elementTypeId, drawX, this.previousY);


                this.finalX = drawX; //last position
                this.finalY = this.previousY; //last position
            }
        } else{
            for (var drawX = this.previousX; drawX > this.currentX; drawX-=5){
                if(this.out){
                    if(this.outXposition > fluid.width){
                        this.currentX = fluid.width;
                    }
                }


                if(this.increaseValueY && this.previousY < this.currentY){
                    this.previousY+=5;
                } else if(!this.increaseValueY && this.previousY > this.currentY){
                    this.previousY-=5;
                }

                //Create particles on mouse position
                fluid.addParticle(settings.elementTypeId, drawX, this.previousY);


                this.finalX = drawX;
                this.finalY = this.previousY; //last position
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


                if(this.increaseValueX && this.previousX < this.currentX){
                    this.previousX+=5;
                } else if(!this.increaseValueX && this.previousX > this.currentX){
                    this.previousX-=5;
                }

                //Create particles on mouse position
                fluid.addParticle(settings.elementTypeId,this.previousX, drawY);

                this.finalX = this.previousX; //last position
                this.finalY = drawY; //last position
            }
        } else{
            for (var drawY = this.previousY; drawY > this.currentY; drawY-=5){
                if(this.out){
                    if(this.outYposition > fluid.height){
                        this.currentY = fluid.height;
                    }
                }


                if(this.increaseValueX && this.previousX < this.currentX){
                    this.previousX+=5;
                } else if(!this.increaseValueX && this.previousX > this.currentX){
                    this.previousX-=5;
                }


                //Create particles on mouse position
                fluid.addParticle(settings.elementTypeId,this.currentX, drawY);

                this.finalX = this.previousX; //last position
                this.finalY = drawY;
            }
        }

        this.previousX = this.finalX;
        this.previousY = this.finalY;
    }
    else{

        if(!this.out){

            //Create particles on mouse position
            fluid.addParticle(settings.elementTypeId,this.x, this.y);

            this.previousX = this.x;
            this.previousY = this.y;
        }
    }
};


var mouse = new Mouse();
mouse.init();