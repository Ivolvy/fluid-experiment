/**
 * The element himself (textures, shape, ...)
 * @constructor
 */
var Element = function(){};


Element.prototype.init = function(){
    this.textures  = []; //Use to get colors and form
    this.radius = 30;
    this.newElement = [];
};

Element.prototype.createElement = function(elementType){

    settings.elementTypeId = elementType.id;

    var color = elementType.color;

    this.newElement = document.createElement("canvas");


    this.newElement.width = this.radius * 2;
    this.newElement.height = this.radius * 2;

    this.textures[elementType.id] = this.newElement;
    var nctx = this.textures[elementType.id].getContext("2d");

    var grad = nctx.createRadialGradient(
        this.radius,
        this.radius,
        1, //Inner circle radius
        this.radius,
        this.radius,
        this.radius
    );

    grad.addColorStop(0, color + ',1)'); //gradient coloring
    grad.addColorStop(1, color + ',0)');
    nctx.fillStyle = grad;

    nctx.beginPath();
    nctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, true);
    nctx.closePath();
    nctx.fill();
};

var element = new Element();
element.init();