document.getElementById('pauseOnDrawing-element').getElementsByTagName('input')[0].onclick = function(e) {
    settings.pauseOnDrawing = !settings.pauseOnDrawing;
};
document.getElementById('pauseGame-element').getElementsByTagName('input')[0].onclick = function(e) {
    settings.pauseGame = !settings.pauseGame;
    if(!settings.pauseGame){fluid.resume();}
};
document.getElementById('outflow-element').getElementsByTagName('input')[0].onclick = function(e) {
    settings.outflow = !settings.outflow;
};
document.getElementById('inflow-element').getElementsByTagName('input')[0].onclick = function(e) {
    settings.inflow = !settings.inflow;
};


document.getElementById('water-button').onclick = function(e) {
    element.setWaterElement();
};
document.getElementById('fire-button').onclick = function(e) {
    element.setFireElement();
};
