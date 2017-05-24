document.getElementById('pauseOnDrawing-element').getElementsByTagName('input')[0].onclick = function(e) {
    settings.pauseOnDrawing = !settings.pauseOnDrawing;
};
document.getElementById('pauseGame-element').getElementsByTagName('input')[0].onclick = function(e) {
    settings.pauseGame = !settings.pauseGame;
    if(!settings.pauseGame){fluid.resume();}
};

