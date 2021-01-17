var CanvasRefresher = function() {
    var self = this;
    var canvas = null;
    var layers = [];
    var objectsByLayer = {};
    var refreshIID = null;
    var refresh = function() {
        if ( !canvas ) return;
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        for ( var i=0; i < layers.length; i++ ) {
            var layer = layers[i];
            for ( var j=0; j < objectsByLayer[layer].length; j++ ) {
                if ( !objectsByLayer[layer][j].refresh ) return;
                objectsByLayer[layer][j].refresh(canvas);
            }
        }
        if ( refreshIID ) refreshIID = requestAnimationFrame(refresh);
    };
    this.connect = function(_canvas) {
        if ( canvas ) this.disconn();
        if ( typeof _canvas === "string" ) _canvas = document.querySelector(_canvas);
        if ( !(_canvas instanceof HTMLElement) ) return;
        canvas = _canvas;
        refreshIID = requestAnimationFrame(refresh);
    };
    this.disconn = function() {
        if ( refreshIID ) cancelAnimationFrame(refreshIID);
        refreshIID = null;
        canvas = null;
    };
    this.insertObject = function(layer, object) {
        layer = +layer;
        if ( !(layer in objectsByLayer) ) {
            var layerInserted = false;
            for ( var i=0; i < layers.length; i++ )
                if ( layers[i] > layer ) {
                    layers.splice(i, 0, layer);
                    layerInserted = true;
                    break;
                }
            if ( !layerInserted ) layers.push(layer);
            objectsByLayer[layer] = [];
        }
        objectsByLayer[layer].push(object);
    };
    this.removeObject = function(object) {
        for ( var i=0; i < layers.length; i++ ) {
            var layer = layers[i];
            for ( var j=0; j < objectsByLayer[layer].length; j++ )
                if ( objectsByLayer[layer][j] === object ) {
                    objectsByLayer[layer].splice(j, 1);
                    if ( !objectsByLayer[layer].length ) {
                        delete objectsByLayer[layer];
                        layers.splice(i, 1);
                        return;
                    }
                }
        }
    };
    this.getCanvas = function() { return canvas; };
    if ( arguments.length > 0 ) this.connect(arguments[0]); 
};