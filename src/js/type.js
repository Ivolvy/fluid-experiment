/**
 * Create all elements' type (water, fire, ...)
 * @constructor
 */
var Type = function(){};


Type.prototype.init = function(){

    this.els = {
        water: {id: 0, color: 'rgba(128, 186, 247'},
        fire: {id: 1, color:'rgba(247, 44, 44'},
        wall: {id: 2, color:'rgba(229, 129, 96'},
        gas: {id: 3, color:'rgba(179, 219, 226'},
        liquidFuel: {id: 4, color:'rgba(244, 128, 12'},
        rigid: {id: 5, color:'rgba(117, 239, 123'}
    };

    //Just to simplify the values recovery in other files
    this.water = this.els.water;
    this.fire = this.els.fire;
    this.wall = this.els.wall;
    this.gas = this.els.gas;
    this.liquidFuel = this.els.liquidFuel;
    this.rigid = this.els.rigid;
};



var type = new Type();
module.exports = type;
type.init();

