window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(t) {
    window.setTimeout(t, 1e3 / 60);
};

var Fluid = function() {
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.num_x = 0;
    this.num_y = 0;
    this.particles = null;
    this.grid = null;
    this.meta_ctx = null;
    this.context = this;
    this.threshold = 220;
    this.play = false;
    this.spacing = 45;
    this.limit = element.radius * .66;
    this.num_particles = 0;
};

Fluid.prototype.process_image = function() {
    var t = this;
    var i = t.meta_ctx.getImageData(0, 0, t.width, t.height);
    var e = i.data;
    for (var s = 0, n = e.length; s < n; s += 4) {
        e[s + 3] < t.threshold && (e[s + 3] /= 6);
    }
    t.ctx.putImageData(i, 0, 0);
};

Fluid.prototype.addParticle = function(t, i, e, s, n) {
    var r = this;
    r.particles.push(new Particle(t, i, e, s, n));
    r.num_particles = r.particles.length;
};

Fluid.prototype.destroyParticle = function(t) {
    var i = this;
    i.particles.splice(i.particles.indexOf(t), 1);
    i.num_particles = i.particles.length;
};

Fluid.prototype.run = function() {
    var t = fluid.context;
    t.meta_ctx.clearRect(0, 0, t.width, t.height);
    for (var i = 0, e = t.num_x * t.num_y; i < e; i++) {
        t.grid[i].length = 0;
    }
    var i = t.num_particles;
    if (!settings.pauseOnDrawing && mouse.mouseDrawing || !mouse.mouseDrawing) {
        while (i--) {
            if (t.particles[i]) {
                t.particles[i].first_process();
            }
        }
    }
    i = t.num_particles;
    while (i--) {
        if (t.particles[i]) {
            t.particles[i].second_process();
        }
    }
    fluid.process_image();
    if (settings.inflow) {
        fluid.addParticle(type.water.id, fluid.limit, fluid.limit, fluid.limit - 4);
    }
    if (mouse.down) {
        mouse.process();
    } else {
        mouse.previousX = mouse.x;
        mouse.previousY = mouse.y;
    }
    if (t.play && !settings.pauseGame) {
        requestAnimFrame(fluid.run);
    }
};

Fluid.prototype.init = function(t, i, e) {
    var s = this;
    s.particles = [];
    s.grid = [];
    var t = document.getElementById(t);
    s.ctx = t.getContext("2d");
    t.height = e || window.innerHeight;
    t.width = i || window.innerWidth;
    s.width = t.width;
    s.height = t.height;
    var n = document.createElement("canvas");
    n.width = s.width;
    n.height = s.height;
    s.meta_ctx = n.getContext("2d");
    element.createElement(type.water);
    s.num_x = Math.round(s.width / s.spacing) + 1;
    s.num_y = Math.round(s.height / s.spacing) + 1;
    for (var r = 0; r < s.num_x * s.num_y; r++) {
        s.grid[r] = {
            length: 0,
            close: []
        };
    }
    for (var r = 0; r < settings.GROUPS.length; r++) {
        for (var u = 0; u < settings.GROUPS[r]; u++) {
            s.particles.push(new Particle(r, element.radius + Math.random() * (s.width - element.radius * 2), element.radius + Math.random() * (s.height - element.radius * 2)));
        }
    }
    s.num_particles = s.particles.length;
    s.play = true;
    fluid.initEvents(t);
    fluid.run(this);
};

Fluid.prototype.initEvents = function(t) {
    t.onmousedown = function(t) {
        mouse.down = true;
        mouse.mouseDrawing = true;
        return false;
    };
    document.onmouseup = function(t) {
        mouse.down = false;
        mouse.mouseDrawing = false;
        mouse.previousX = 0;
        mouse.previousY = 0;
        return false;
    };
    t.onmousemove = function(i) {
        var e = t.getBoundingClientRect();
        mouse.x = i.clientX - e.left;
        mouse.y = i.clientY - e.top;
        return false;
    };
    t.onmouseout = function(t) {
        mouse.outXposition = t.pageX - this.offsetLeft;
        mouse.outYposition = t.pageY - this.offsetTop;
        mouse.out = true;
    };
    t.onmouseover = function(t) {
        mouse.out = false;
    };
};

Fluid.prototype.stop = function() {
    this.play = false;
};

Fluid.prototype.resume = function() {
    this.run();
};

var fluid = new Fluid();

var Element = function() {};

Element.prototype.init = function() {
    this.textures = [];
    this.radius = 30;
    this.newElement = [];
};

Element.prototype.createElement = function(t) {
    settings.currentElementTypeId = t.id;
    var i = t.color;
    this.newElement = document.createElement("canvas");
    this.newElement.width = this.radius * 2;
    this.newElement.height = this.radius * 2;
    this.textures[t.id] = this.newElement;
    var e = this.textures[t.id].getContext("2d");
    var s = e.createRadialGradient(this.radius, this.radius, 1, this.radius, this.radius, this.radius);
    s.addColorStop(0, i + ",1)");
    s.addColorStop(1, i + ",0)");
    e.fillStyle = s;
    e.beginPath();
    e.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, true);
    e.closePath();
    e.fill();
};

Element.prototype.setWaterElement = function() {
    this.createElement(type.water);
};

Element.prototype.setFireElement = function() {
    settings.currentElementTypeId = type.fire.id;
    this.createElement(type.fire);
};

var element = new Element();

element.init();

var Events = function() {};

Events.prototype.init = function() {
    document.getElementById("pauseOnDrawing").getElementsByTagName("input")[0].onclick = function(t) {
        settings.pauseOnDrawing = !settings.pauseOnDrawing;
    };
    document.getElementById("pauseGame").getElementsByTagName("input")[0].onclick = function(t) {
        settings.pauseGame = !settings.pauseGame;
        if (!settings.pauseGame) {
            fluid.resume();
        }
    };
    document.getElementById("outflow").getElementsByTagName("input")[0].onclick = function(t) {
        settings.outflow = !settings.outflow;
    };
    document.getElementById("inflow").getElementsByTagName("input")[0].onclick = function(t) {
        settings.inflow = !settings.inflow;
    };
    document.getElementById("water-button").onclick = function(t) {
        events.removeActive();
        this.classList.add("active");
        element.setWaterElement();
    };
    document.getElementById("fire-button").onclick = function(t) {
        events.removeActive();
        this.classList.add("active");
        element.setFireElement();
    };
};

Events.prototype.removeActive = function() {
    var t = document.getElementsByClassName("active");
    for (var i = 0; i < t.length; i++) {
        t[i].classList.remove("active");
    }
};

var events = new Events();

events.init();

var Mouse = function() {};

Mouse.prototype.init = function() {
    this.down = false;
    this.out = false;
    this.x = 0;
    this.y = 0;
    this.mouseDrawing = false;
    this.xDiff = 0;
    this.yDiff = 0;
    this.increaseValueX = 0;
    this.increaseValueY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.finalX = 0;
    this.finalY = 0;
    this.previousX = 0;
    this.previousY = 0;
    this.outXposition = 0;
    this.outYposition = 0;
};

Mouse.prototype.process = function() {
    this.currentX = this.x;
    this.currentY = this.y;
    if (this.previousX > this.currentX) {
        this.xDiff = this.previousX - this.currentX;
        this.increaseValueX = false;
    }
    if (this.previousX < this.currentX) {
        this.xDiff = this.currentX - this.previousX;
        this.increaseValueX = true;
    }
    if (this.previousY > this.currentY) {
        this.yDiff = this.previousY - this.currentY;
        this.increaseValueY = false;
    }
    if (this.previousY < this.currentY) {
        this.yDiff = this.currentY - this.previousY;
        this.increaseValueY = true;
    }
    if (this.xDiff > 10) {
        if (this.increaseValueX) {
            for (var t = this.previousX; t < this.currentX; t += 5) {
                if (this.out) {
                    if (this.outXposition < fluid.width) {
                        this.currentX = 0;
                    }
                }
                if (this.increaseValueY && this.previousY < this.currentY) {
                    this.previousY += 5;
                } else if (!this.increaseValueY && this.previousY > this.currentY) {
                    this.previousY -= 5;
                }
                fluid.addParticle(settings.currentElementTypeId, t, this.previousY);
                this.finalX = t;
                this.finalY = this.previousY;
            }
        } else {
            for (var t = this.previousX; t > this.currentX; t -= 5) {
                if (this.out) {
                    if (this.outXposition > fluid.width) {
                        this.currentX = fluid.width;
                    }
                }
                if (this.increaseValueY && this.previousY < this.currentY) {
                    this.previousY += 5;
                } else if (!this.increaseValueY && this.previousY > this.currentY) {
                    this.previousY -= 5;
                }
                fluid.addParticle(settings.currentElementTypeId, t, this.previousY);
                this.finalX = t;
                this.finalY = this.previousY;
            }
        }
        this.previousX = this.finalX;
        this.previousY = this.finalY;
    } else if (this.yDiff > 10) {
        if (this.increaseValueY) {
            for (var t = this.previousY; t < this.currentY; t += 5) {
                if (this.out) {
                    if (this.outYposition < fluid.height) {
                        this.currentY = 0;
                    }
                }
                if (this.increaseValueX && this.previousX < this.currentX) {
                    this.previousX += 5;
                } else if (!this.increaseValueX && this.previousX > this.currentX) {
                    this.previousX -= 5;
                }
                fluid.addParticle(settings.currentElementTypeId, this.previousX, t);
                this.finalX = this.previousX;
                this.finalY = t;
            }
        } else {
            for (var t = this.previousY; t > this.currentY; t -= 5) {
                if (this.out) {
                    if (this.outYposition > fluid.height) {
                        this.currentY = fluid.height;
                    }
                }
                if (this.increaseValueX && this.previousX < this.currentX) {
                    this.previousX += 5;
                } else if (!this.increaseValueX && this.previousX > this.currentX) {
                    this.previousX -= 5;
                }
                fluid.addParticle(settings.currentElementTypeId, this.currentX, t);
                this.finalX = this.previousX;
                this.finalY = t;
            }
        }
        this.previousX = this.finalX;
        this.previousY = this.finalY;
    } else {
        if (!this.out) {
            fluid.addParticle(settings.currentElementTypeId, this.x, this.y);
            this.previousX = this.x;
            this.previousY = this.y;
        }
    }
};

var mouse = new Mouse();

mouse.init();

var Particle = function(t, i, e, s, n) {
    this.currentElementTypeId = t;
    this.x = i;
    this.y = e;
    this.px = s ? s : i;
    this.py = n ? n : e;
    this.vx = 0;
    this.vy = 0;
};

Particle.prototype.first_process = function() {
    var t = fluid.grid[Math.round(this.y / fluid.spacing) * fluid.num_x + Math.round(this.x / fluid.spacing)];
    if (t) t.close[t.length++] = this;
    this.vx = this.x - this.px;
    this.vy = this.y - this.py;
    this.vx += settings.GRAVITY_X;
    this.vy += settings.GRAVITY_Y;
    this.px = this.x;
    this.py = this.y;
    this.x += this.vx;
    this.y += this.vy;
};

Particle.prototype.second_process = function() {
    var t = 0, i = 0, e = Math.round(this.x / fluid.spacing), s = Math.round(this.y / fluid.spacing), n = [];
    for (var r = -1; r < 2; r++) {
        for (var u = -1; u < 2; u++) {
            var o = fluid.grid[(s + u) * fluid.num_x + (e + r)];
            if (o && o.length) {
                for (var h = 0, a = o.length; h < a; h++) {
                    var l = o.close[h];
                    if (l != this) {
                        var f = l.x - this.x;
                        var c = l.y - this.y;
                        var d = Math.sqrt(f * f + c * c);
                        if (d < fluid.spacing) {
                            var p = 1 - d / fluid.spacing;
                            t += Math.pow(p, 2);
                            i += Math.pow(p, 3) / 2;
                            l.m = p;
                            l.dfx = f / d * p;
                            l.dfy = c / d * p;
                            n.push(l);
                        }
                    }
                }
            }
        }
    }
    t = (t - 3) * .5;
    for (var m = 0, a = n.length; m < a; m++) {
        var v = n[m];
        var g = t + i * v.m;
        if (this.currentElementTypeId != v.currentElementTypeId) g *= .35;
        var y = v.dfx * g * .5;
        var w = v.dfy * g * .5;
        v.x += y;
        v.y += w;
        this.x -= y;
        this.y -= w;
    }
    if (this.x < fluid.limit) {
        if (settings.outflow) {
            if (this.x < 0) {
                fluid.destroyParticle(this);
            }
        } else {
            this.x = fluid.limit;
        }
    } else if (this.x > fluid.width - fluid.limit) {
        if (settings.outflow) {
            if (this.x > fluid.width) {
                fluid.destroyParticle(this);
            }
        } else {
            this.x = fluid.width - fluid.limit;
        }
    }
    if (this.y < fluid.limit) {
        if (settings.outflow) {
            fluid.destroyParticle(this);
        } else {
            this.y = fluid.limit;
        }
    } else if (this.y > fluid.height - fluid.limit) {
        if (settings.outflow) {
            if (this.y > fluid.height) {
                fluid.destroyParticle(this);
            }
        } else {
            this.y = fluid.height - fluid.limit;
        }
    }
    this.draw();
};

Particle.prototype.draw = function() {
    var t = element.radius * 2;
    fluid.meta_ctx.drawImage(element.textures[this.currentElementTypeId], this.x - element.radius, this.y - element.radius, t, t);
};

var Settings = function() {};

Settings.prototype.init = function() {
    this.GRAVITY_X = 0;
    this.GRAVITY_Y = 1;
    this.GROUPS = [];
    this.currentElementTypeId = 0;
    this.pauseOnDrawing = true;
    this.pauseGame = false;
    this.outflow = false;
    this.inflow = false;
};

var settings = new Settings();

settings.init();

var Type = function() {};

Type.prototype.init = function() {
    this.water = {
        id: 0,
        color: "rgba(128, 186, 247"
    };
    this.fire = {
        id: 1,
        color: "rgba(247, 44, 44"
    };
};

var type = new Type();

type.init();