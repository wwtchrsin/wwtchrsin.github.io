var CanvasAdjuster = function(canvas, rescoef) {
    if ( arguments.length < 2 ) rescoef = 1;
    if ( typeof canvas === "string" ) canvas = document.querySelector(canvas);
    if ( (canvas instanceof HTMLElement) ) {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        window.addEventListener("resize", refresh);
    } else canvas = null;
    var dimensions = null;
    var REFRESH_INTERVAL = 225;
    var REFRESH_MIN_INTERVAL = 125;
    var lastRefresh = -REFRESH_INTERVAL;
    var refresh = function() {
        if ( !canvas || !canvas.getBoundingClientRect ) return;
        var timestamp = performance.now();
        if ( timestamp - lastRefresh < REFRESH_MIN_INTERVAL )
            return;
        var newDims = canvas.getBoundingClientRect();
        var newWidth = newDims.right - newDims.left;
        var newHeight = newDims.bottom - newDims.top;
        if ( newWidth === 0 || newHeight === 0 ) return;
        if ( !dimensions || dimensions.width !== newWidth || dimensions.height !== newHeight ) {
            canvas.width = newWidth * rescoef;
            canvas.height = newHeight * rescoef;
            if ( newWidth > newHeight ) {
                width = newWidth / newHeight;
                height = 1;
            } else {
                height = newHeight / newWidth;
                width = 1;
            }
            if ( !dimensions ) dimensions = {};
            dimensions.left = newDims.left;
            dimensions.right = newDims.right;
            dimensions.top = newDims.top;
            dimensions.bottom = newDims.bottom;
            dimensions.width = newWidth;
            dimensions.height = newHeight;
        }
        lastRefresh = timestamp;
    };
    var refreshIID = setInterval(refresh, REFRESH_INTERVAL);
    this.connect = function(_canvas) {
        if ( canvas !== null ) this.disconn();
        if ( typeof _canvas === "string" ) _canvas = document.querySelector(_canvas);
        if ( !(_canvas instanceof HTMLElement) ) return;
        canvas = _canvas;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        window.addEventListener("resize", refresh);
    };
    this.disconn = function() {
        canvas.style.width = "auto";
        canvas.style.height = "auto";
        window.removeEventListener("resize", refresh);
        canvas = null;
    };
    this.setResCoef = function(value) { 
        if ( !value ) return;
        if ( canvas !== null && value !== rescoef ) {
            canvas.width = canvas.width * value / rescoef;
            canvas.height = canvas.height * value / rescoef;
        }
        rescoef = value;
    };
    this.getResCoef = function() { return rescoef; };
    this.getCanvas = function() { return canvas; };
    this.getBoundingRect = function() { return dimensions; };
};