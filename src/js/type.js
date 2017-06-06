/**
 * Create all elements' type (water, fire, ...)
 * @constructor
 */
var Type = function(){};


Type.prototype.init = function(){

    this.water = {id: 0, color: 'rgba(128, 186, 247'};
    this.fire = {id: 1, color:'rgba(247, 44, 44'};
    this.wall = {id: 2, color:'rgba(229, 129, 96'};
    this.gas = {id: 3, color:'rgba(179, 219, 226'};
    this.liquidFuel = {id: 4, color:'rgba(244, 128, 12'};
};



var type = new Type();
type.init();