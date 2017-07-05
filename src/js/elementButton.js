
var settings = require('./settings.js');
var events = require('./events.js');



class ElementButton{

    /**
     * Create an element button selector
     * @param elementName
     * @param text
     * @param associatedElement
     * @param isDefault
     * @constructor
     */
    constructor(elementName, text, associatedElement, isDefault){
        var that = this;

        this.buttonsDiv = document.getElementById('buttons');

        //Button
        this.button = document.createElement('button');
        this.button.setAttribute('id', `${elementName}-button`);
        this.button.setAttribute('class', 'button');

        if(isDefault){
            this.button.setAttribute('class', 'active');
            settings.elementTypeId = associatedElement.id; //Set this element by default
        }

        this.text = document.createTextNode(text);
        this.button.appendChild(this.text);


        this.button.addEventListener("click", evt => that.testAssociatedElement(evt.currentTarget, associatedElement), false);

        this.buttonsDiv.appendChild(this.button);
    }


    /**
     * Test the callback for specifics elements
     * @param buttonEl
     * @param associatedElement
     */
    testAssociatedElement(buttonEl, associatedElement){
        if(associatedElement == "delete"){
            this.resetButtons();
            buttonEl.classList.add("active");
            settings.wipe = true;
        } else{
            this.resetButtons();
            buttonEl.classList.add("active");
            settings.elementTypeId = associatedElement.id;
        }
    }


    /**
     * Reset Buttons
     */
    resetButtons(){
        var elements = document.getElementsByClassName("active");

        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }

        settings.wipe = false; //disable wipe
    }



}


module.exports = ElementButton;