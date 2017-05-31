/*Base particles script get from dissimulate on codepen*/

var Particle = function(type, x, y, px, py){
    this.elementTypeId = type; //Type of the particle (water, fire, ...)
    this.x = x;
    this.y = y;
    this.px = px ? px : x;
    this.py = py ? py : y;
    this.vx = 0;
    this.vy = 0;
};

/**
 * Handle the gravity
 */
Particle.prototype.first_process = function () {


    var g = fluid.grid[Math.round(this.y / fluid.spacing) * fluid.num_x + Math.round(this.x / fluid.spacing)];

    if (g){
        g.close[g.length++] = this;
    }

    //If the particle is a wall, we don't move it
    if(this.elementTypeId == type.wall.id){
        return;
    }

    this.vx = this.x - this.px;
    this.vy = this.y - this.py;

    /*if (mouse.down) {
        //here useful to interact with the fluid with mouse?
    }*/

    this.vx += settings.GRAVITY_X;
    this.vy += settings.GRAVITY_Y;
    this.px = this.x;
    this.py = this.y;
    this.x += this.vx;
    this.y += this.vy;
};


/**
 * Handle the behavior between particles
 */
Particle.prototype.second_process = function () {

    var force = 0,
        force_b = 0,
        cell_x = Math.round(this.x / fluid.spacing),
        cell_y = Math.round(this.y / fluid.spacing),
        close = [],
        xDistance = 0,
        yDistance = 0,
        distance = 0;


    for (var x_off = -1; x_off < 2; x_off++) {
        for (var y_off = -1; y_off < 2; y_off++) {
            var cell = fluid.grid[(cell_y + y_off) * fluid.num_x + (cell_x + x_off)];

            if (cell && cell.length) {
                for (var a = 0, l = cell.length; a < l; a++) {
                    var particle = cell.close[a];

                    //If the current particle is not a wall and the neighbor particle is a wall
                    if(particle != this && this.elementTypeId != type.wall.id && particle.elementTypeId == type.wall.id){

                        xDistance = particle.x - this.x;
                        yDistance = particle.y - this.y;
                        distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2)); //Distance between two points: sqrt((xb-xa)² + (yb-ya)²)

                        if (distance < fluid.spacing) {
                            var m = 1 - (distance / fluid.spacing); //leading coefficient - give the direction and the steepness of the line: ((yb-ya)/(xb-xa))
                            force += 1;
                            force_b += 1;
                            particle.m = m;
                            particle.dfx = (xDistance / distance) * m; //rate of increase
                            particle.dfy = (yDistance / distance) * m; //rate of increase
                            close.push(particle);
                        }
                    }
                    else if (particle != this && (particle.elementTypeId != type.wall.id)) {

                        xDistance = particle.x - this.x;
                        yDistance = particle.y - this.y;
                        distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2)); //Distance between two points: sqrt((xb-xa)² + (yb-ya)²)

                        if (distance < fluid.spacing) {
                            var m = 1 - (distance / fluid.spacing); //leading coefficient - give the direction and the steepness of the line: ((yb-ya)/(xb-xa))
                            force += Math.pow(m, 2);
                            force_b += Math.pow(m, 3) / 2;
                            particle.m = m;
                            particle.dfx = (xDistance / distance) * m; //rate of change
                            particle.dfy = (yDistance / distance) * m; //rate of change
                            close.push(particle);
                        }
                    }
                }
            }
        }
    }

    //If gravity activated and his value not equals 0
    if(settings.gravity && settings.gravityRange != 0){
        force = (force - 3) * 0.5;

        for (var i = 0; i < close.length; i++) {

            var neighbor = close[i];

            var press = force + force_b * neighbor.m;


            if (this.elementTypeId != type.wall.id && neighbor.elementTypeId == type.wall.id){
                press *= 0.35;
            } else{
                press *= 0.35;
            }

            var dx = neighbor.dfx * press * 0.5; //increase rebound
            var dy = neighbor.dfy * press * 0.5;


            //If the neighbor is not a wall - we don't want the wall moving
            if (this.elementTypeId != type.wall.id && neighbor.elementTypeId != type.wall.id) {
                neighbor.x += dx;
                neighbor.y += dy;
            }

            //If the current element is not a wall - we don't want the wall moving
            if(this.elementTypeId != type.wall.id && neighbor.elementTypeId == type.wall.id){
                this.x -= dx;
                this.y -= dy;
            }
        }
    }


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


    this.draw();
};


Particle.prototype.draw = function () {

    var size = element.radius * 2;

    fluid.meta_ctx.drawImage(
        element.textures[this.elementTypeId], //Draw the current type of the particle (water, fire, ...)
        this.x - element.radius,
        this.y - element.radius,
        size,
        size);
};
