
/**
 * All the settings
 */
class Settings{
    constructor(){}

    init(){
        this.width = 0;
        this.height = 0;

        this.baseGravityX     = 0; //bas gravity settings
        this.baseGravityY     = 1;

        this.GRAVITY_X     = 0; //modified and used gravity settings
        this.GRAVITY_Y     = 1;
        this.gravityRange = 1; //Gravity range from the slider

        this.elementTypeId = 0; //Particles' color - current element type when drawing

        this.pauseOnDrawing = true; //Pause the game when we draw
        this.pauseGame = false; //Pause all the game
        this.outflow = false; //Let fluid go out of the canvas
        this.inflow = false; //Create infinite water fluid at left corner
        this.wipe = false; //Delete particles on click on them

        this.maxDistanceForChemistry = 7; //How close two particles must be to transform
        this.maxWaterAroundToTransformInFire = 5; //How close two particles must be to transform

        this.gravity = true;
    }

    /**
     * Disable Gravity
     */
    disableGravity(){
        this.GRAVITY_X = 0;
        this.GRAVITY_Y = 0;
    }

    /**
     * Enable Gravity
     */
    enableGravity(){
        this.GRAVITY_X = this.baseGravityX;
        this.GRAVITY_Y = this.baseGravityY;
    }

    /**
     * Convert degrees to radians
     * @param degrees
     * @returns {number}
     */
    degreesToRadians(degrees){
        return (degrees * Math.PI) / 180;
    }
}


var settings = new Settings();
module.exports = settings;
settings.init();

