var SpeechBalloon = function() {
    var self = this;
    var position = { oX: 0, oY: 0, x: 0.1, y: 0.1 };
    var alignment = { oX: 0, oY: 0 };
    var styles = {
        width: 0.3,
        "font-size": 0.03, 
        "border-width": 0.004,
        "border-color": "#222222",
        "font-color": "#222222",
        "background": "#cccccc"
    };
    var pointerPosition = 0;
    var pointerSide = {
        "0": 0, "1": 0, "2": 1, "3": 1,
        "4": 1, "5": 2, "6": 2, "7": 2,
        "8": 3, "9": 3, "10": 3, "11": 0,
    };
    var pointerDirection = {
        "0": 1, "1": 2, "2": 0, "3": 1,
        "4": 2, "5": 0, "6": 1, "7": 2,
        "8": 0, "9": 1, "10": 2, "11": 0,
    };
    var boundingRect = {
        left: 0, right: 0,
        top: 0, bottom: 0,
        width: 0, height: 0,
    };
    var visible = true;
    var text = ["hello"];
    var stateChanged = true;
    var log = console.log.bind(console);
    var splitText = function(text, symbolsPerLine) {
        var symbolsConsumed = 0;
        var lines = [];
        while ( text.length > symbolsPerLine ) {
            var line = text.slice(0,symbolsPerLine);
            var index = line.lastIndexOf(" ");
            if ( index < 0 || text.charAt(symbolsPerLine) === " " ) {
                lines.push(line);
                index = (( index < 0 ) ? 0 : 1) + symbolsPerLine;
                text = text.slice(index);
            } else {
                lines.push(text.slice(0,index));
                text = text.slice(index+1);
            }
        }
        if ( text.length ) lines.push(text);
        return lines;
    };
    var contextState = new (function() {
        var defaults = {};
        var NOT_SET = {};
        var NOT_EXISTS = {};
        this.alter = function(object, name, value) {
            if ( !(name in defaults) ) defaults[name] = NOT_SET;
            if ( defaults[name] === NOT_SET ) {
                if ( !(name in object) ) defaults[name] = NOT_EXISTS;
                else defaults[name] = object[name];
            }
            object[name] = value;
        };
        this.restore = function(object) {
            for ( var name in defaults ) {
                if ( defaults[name] === NOT_SET ) continue;
                if ( defaults[name] === NOT_EXISTS ) delete object[name];
                else object[name] = defaults[name];
                defaults[name] = NOT_SET;
            }
        };
        this.skip = function() {
            for ( var name in defaults )
                defaults[name] = NOT_SET;
        };
    })();
    this.refresh = (function() {
        var vals = {};
        var curve = [ [], [], [], [], [] ];
        var pointer = [];
        var canvasWidth = null;
        var canvasHeight = null;
        return function(canvas) {
            if ( !visible || !(canvas instanceof HTMLCanvasElement) ) return;
            var context = canvas.getContext("2d");
            var scaleCoef = Math.min(canvas.width, canvas.height);
            contextState.skip();
            stateChanged = stateChanged || (canvas.width !== canvasWidth) || (canvas.height !== canvasHeight);
            if ( stateChanged ) {
                vals.border = Math.floor(styles["border-width"] * scaleCoef);
                vals.fs = Math.floor(styles["font-size"] * scaleCoef);
                vals.font = vals.fs + "px monospace";
                vals.ch = Math.floor(canvas.height * 0.01);
                if ( vals.ch < 1 ) vals.ch = 1;
                vals.w = Math.floor(styles["width"] * scaleCoef); 
                vals.h = Math.floor(vals.fs * 1 * text.length + vals.ch * 2);
                vals.h = Math.floor(vals.h * 1.2);
                vals.oX = Math.floor(alignment.oX * canvas.width);
                vals.oY = Math.floor(alignment.oY * canvas.height);
                vals.l = vals.oX + Math.floor(position.x * scaleCoef - vals.w * position.oX);
                vals.t = vals.oY + Math.floor(position.y * scaleCoef - vals.h * position.oY);
                vals.hw = Math.floor(vals.w * 0.5);
                vals.hh = Math.floor(vals.h * 0.5);
                vals.qw = Math.floor(vals.w * 0.25);
                vals.qh = Math.floor(vals.h * 0.25);
                vals.ew = Math.floor(vals.w * 0.125);
                vals.eh = Math.floor(vals.h * 0.125);
                vals.pdx = vals.qw + vals.ew;
                vals.pdy = vals.qh + vals.eh;
                if ( vals.pdx > 0.05 * scaleCoef ) vals.pdx = 0.05 * scaleCoef;
                if ( vals.pdy > 0.05 * scaleCoef ) vals.pdy = 0.05 * scaleCoef;
                vals.x0 = vals.l + vals.w;
                vals.y0 = vals.t + vals.hh;
                vals.pointerSide = -1;
                if ( pointerPosition >= 0 && pointerPosition <= 11 )
                    vals.pointerSide = pointerSide[pointerPosition];
                if ( vals.pointerSide === 0 ) {
                    var dir = pointerDirection[pointerPosition];
                    pointer[0] = vals.l + vals.w;
                    pointer[1] = vals.t + vals.hh + vals.qh - dir * vals.eh;
                    pointer[2] = pointer[0] + vals.pdx;
                    pointer[3] = vals.t + vals.h - vals.eh - dir * (vals.qh + vals.eh);
                    pointer[4] = pointer[0];
                    pointer[5] = pointer[1] - vals.qh;
                } else if ( vals.pointerSide === 1 ) {
                    var dir = pointerDirection[pointerPosition];
                    pointer[0] = vals.l + vals.hw + vals.qw - dir * vals.ew;
                    pointer[1] = vals.t;
                    pointer[2] = vals.l + vals.w - vals.ew - dir * (vals.qw + vals.ew);
                    pointer[3] = pointer[1] - vals.pdy;
                    pointer[4] = pointer[0] - vals.qw;
                    pointer[5] = pointer[1];
                } else if ( vals.pointerSide === 2 ) {
                    var dir = pointerDirection[pointerPosition];
                    pointer[0] = vals.l;
                    pointer[1] = vals.t + vals.qh + dir * vals.eh;
                    pointer[2] = pointer[0] - vals.pdx;
                    pointer[3] = vals.t + vals.eh + dir * (vals.qh + vals.eh);
                    pointer[4] = pointer[0];
                    pointer[5] = pointer[1] + vals.qh;
                } else if ( vals.pointerSide === 3 ) {
                    var dir = pointerDirection[pointerPosition];
                    pointer[0] = vals.l + vals.qw + dir * vals.ew;
                    pointer[1] = vals.t + vals.h;
                    pointer[2] = vals.l + vals.ew + dir * (vals.qw + vals.ew);
                    pointer[3] = pointer[1] + vals.pdy;
                    pointer[4] = pointer[0] + vals.qw;
                    pointer[5] = pointer[1];
                }
                if ( pointerSide[pointerPosition] === 0 ) {
                    vals.x0 = pointer[0];
                    vals.y0 = pointer[1];
                }
                curve[1][0] = vals.l + vals.w;
                curve[1][1] = vals.t;
                curve[1][2] = vals.l + vals.hw;
                curve[1][3] = vals.t;
                curve[2][0] = vals.l;
                curve[2][1] = vals.t;
                curve[2][2] = vals.l;
                curve[2][3] = vals.t + vals.hh;
                curve[3][0] = vals.l;
                curve[3][1] = vals.t + vals.h;
                curve[3][2] = vals.l + vals.hw;
                curve[3][3] = vals.t + vals.h;
                curve[4][0] = vals.l + vals.w;
                curve[4][1] = vals.t + vals.h;
                curve[4][2] = vals.x0;
                curve[4][3] = vals.y0;
                boundingRect.left = vals.l;
                boundingRect.right = vals.l + vals.w;
                boundingRect.top = vals.t;
                boundingRect.bottom = vals.t + vals.h;
                boundingRect.width = vals.w;
                boundingRect.height = vals.h;
                stateChanged = false;
            }
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
            contextState.alter(context, "font", vals.font);
            contextState.alter(context, "textAlign", "center");
            contextState.alter(context, "lineWidth", vals.border);
            contextState.alter(context, "fillStyle", styles["background"]);
            contextState.alter(context, "strokeStyle", styles["border-color"]);
            context.beginPath();
            context.moveTo(vals.x0, vals.y0);
            for ( var i=0; i < curve.length; i++ ) {
                if ( i > 0 ) {
                    if ( vals.pointerSide === i ) {
                        context.quadraticCurveTo(
                            curve[i][0], curve[i][1],
                            pointer[0], pointer[1]);
                    } else {
                        context.quadraticCurveTo(
                            curve[i][0], curve[i][1], 
                            curve[i][2], curve[i][3]);
                    }
                }
                if ( vals.pointerSide === i ) {
                    context.lineTo(pointer[2], pointer[3]);
                    context.lineTo(pointer[4], pointer[5]);
                }
            }
            context.fill();
            context.stroke();
            contextState.alter(context, "fillStyle", styles["font-color"]);
            for ( var i=0; i < text.length; i++ ) {
                var yShift = Math.floor(1 * vals.fs * (i+1) - 0.25 * vals.fs);
                context.fillText(text[i],
                    vals.l + vals.hw, 
                    vals.t + vals.ch + 0.1 * vals.h + yShift,
                    vals.hw + vals.qw );
            }
            contextState.restore(context);
        };
    })();
    this.setText = function(_text) {
        var symbolsPerLine = styles["width"] / styles["font-size"];
        text = splitText(_text, symbolsPerLine);
        if ( text.length === 0 ) text[0] = "";
        stateChanged = true;
    };
    this.setPosition = function(oX, oY, x, y) {
        position.oX = oX;
        position.oY = oY;
        position.x = x;
        position.y = y;
        stateChanged = true;
    };
    this.setAlignment = function(oX, oY) {
        alignment.oX = oX;
        alignment.oY = oY;
        stateChanged = true;
    }
    this.setPointer = function(position) {
        position = position % 12;
        pointerPosition = position;
        stateChanged = true;
    };
    this.setStyles = function(_styles) {
        for ( var name in _styles ) {
            if ( !(name in styles) ) continue;
            styles[name] = _styles[name];
        }
        stateChanged = true;
    };
    this.setStyle = function(name, value) {
        if ( !(name in styles) ) return;
        styles[name] = value;
        stateChanged = true;
    };
    this.getBoundingRect = function() { return boundingRect; };
    this.setVisibility = function(value) { 
        visible = !(value === false);
        boundingRect.left = 0;
        boundingRect.right = 0;
        boundingRect.top = 0;
        boundingRect.bottom = 0;
        boundingRect.width = 0;
        boundingRect.height = 0;
    };
    this.isVisible = function() { return visible; };
};