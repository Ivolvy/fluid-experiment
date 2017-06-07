/**
 * Create an element button selector
 * @param elementName
 * @param text
 * @param associatedElement
 * @param isDefault
 * @constructor
 */
var ElementButton = function(elementName, text, associatedElement, isDefault){
    var that = this;

    this.buttonsDiv = document.getElementById('buttons');

    //Button
    this.button = document.createElement('button');
    this.button.setAttribute('id', elementName + '-button');
    this.button.setAttribute('class', 'button');

    if(isDefault){
        this.button.setAttribute('class', 'active');
        settings.elementTypeId = associatedElement.id; //Set this element by default
    }

    this.text = document.createTextNode(text);
    this.button.appendChild(this.text);


    this.button.addEventListener("click", function(){
        that.testAssociatedElement(this, associatedElement);
    }, false);


    this.buttonsDiv.appendChild(this.button);
};


/**
 * Test the callback for specifics elements
 * @param buttonEl
 * @param associatedElement
 */
ElementButton.prototype.testAssociatedElement = function(buttonEl, associatedElement){
    if(associatedElement == "delete"){
        events.resetButtons();
        buttonEl.classList.add("active");
        settings.wipe = true;
    } else{
        events.resetButtons();
        buttonEl.classList.add("active");
        settings.elementTypeId = associatedElement.id;
    }
};