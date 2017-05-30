/**
 * Create all elements' type (water, fire, ...)
 * @constructor
 */
var Type = function(){};


Type.prototype.init = function(){

    this.water = {id: 0, color: 'rgba(128, 186, 247'};
    this.fire = {id: 1, color:'rgba(247, 44, 44'};
};



var type = new Type();
type.init();