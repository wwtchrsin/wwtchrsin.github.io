var CanvasRefresher = function(canvas, mode) {
    var self = this;
    var layers = [];
    var objectsByLayer = {};
    var refreshIID = null;
    var refresh = function(t, invocation) {
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
        if ( invocation !== "manual" && refreshIID !== null )
            cancelAnimationFrame(refreshIID);
        if ( invocation !== "manual" && mode !== "manual" )
            refreshIID = requestAnimationFrame(refresh);
    };
    this.connect = function(_canvas) {
        if ( canvas ) this.disconn();
        if ( typeof _canvas === "string" ) _canvas = document.querySelector(_canvas);
        if ( !(_canvas instanceof HTMLElement) ) return;
        canvas = _canvas;
        if ( refreshIID !== null ) cancelAnimationFrame(refreshIID);
        if ( mode === "manual" ) refreshIID = null;
        else refreshIID = requestAnimationFrame(refresh);
    };
    this.disconn = function() {
        if ( refreshIID ) cancelAnimationFrame(refreshIID);
        refreshIID = null;
        canvas = null;
    };
    this.refresh = refresh.bind(null, 0, "manual");
    this.setRefreshMode = function(value) {
        if ( value === "manual" && refreshIID !== null ) {
            cancelAnimationFrame(refreshIID);
            refreshIID = null;
        }
        if ( value !== "manual" && refreshIID === null ) {
            refreshIID = requestAnimationFrame(refresh);
        }
        mode = value;
    };
    this.getRefreshMode = function(value) { return mode; };
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
    if ( canvas ) this.connect(canvas);
};