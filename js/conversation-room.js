var ConversationRoom = function() {
    var values = { corner_x: 0.3, corner_y: 0.6 };
    var animation = {
        corner_x: {start: 0, end: 0, duration: 1500, enabled: false},
        corner_y: {start: 0, end: 0, duration: 1500, enabled: false},
    };
    var styles = {
        "left-wall-bg": "rgba(0,0,0,0.3)",
        "right-wall-bg": "rgba(0,0,0,0.2)",
        "floor-bg": "rgba(0,0,0,0.1)",
    };
    var animationLastRefresh = null;
    var animationIID = null;
    var animate = function() {
        var animatedValuesCounter = 0;
        var timestamp = performance.now();
        if ( animationLastRefresh === null ) 
            animationLastRefresh = timestamp;
        var delta_t = timestamp - animationLastRefresh;
        for ( var name in animation ) {
            if ( !animation[name].enabled ) continue;
            if ( !(name in values) ) continue;
            var interval = animation[name].end - animation[name].start;
            var delta_v = interval * delta_t / animation[name].duration;
            var dir = ( interval < 0 ) ? -1 : 1;
            values[name] += delta_v;
            animatedValuesCounter++;
            if ( values[name] * dir >= animation[name].end * dir ) {
                values[name] = animation[name].end;
                animation[name].start = animation[name].end;
                animation[name].enabled = false;
            }
        }
        if ( animatedValuesCounter > 0 ) {
            animationLastRefresh = timestamp;
            animationIID = requestAnimationFrame(animate);
        } else {
            animationLastRefresh = null;
            animationIID = null;
        }
    };
    this.refresh = function(canvas) {
        var context = canvas.getContext("2d");
        var cornerX = Math.floor(canvas.width * values.corner_x);
        var cornerY = Math.floor(canvas.height * values.corner_y);
        var defaultFillStyle = context.fillStyle;
        context.fillStyle = styles["left-wall-bg"];
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(cornerX, 0);
        context.lineTo(cornerX, cornerY);
        context.lineTo(0, canvas.height);
        context.fill();
        context.fillStyle = styles["right-wall-bg"];
        context.beginPath();
        context.moveTo(canvas.width, 0);
        context.lineTo(cornerX, 0);
        context.lineTo(cornerX, cornerY);
        context.lineTo(canvas.width, cornerY);
        context.fill();
        context.fillStyle = styles["floor-bg"];
        context.beginPath();
        context.moveTo(canvas.width, canvas.height);
        context.lineTo(canvas.width, cornerY);
        context.lineTo(cornerX, cornerY);
        context.lineTo(0, canvas.height);
        context.fill();
        context.fillStyle = defaultFillStyle;
    };
    this.setCornerPosition = function(x, y) {
        values.corner_x = x;
        values.corner_y = y;
    };
    this.moveCornerPosition = function(x, y, duration) {
        if ( arguments.length < 3 ) duration = 1500;
        animation.corner_x.start = values.corner_x;
        animation.corner_y.start = values.corner_y;
        animation.corner_x.end = x;
        animation.corner_y.end = y;
        animation.corner_x.duration = duration;
        animation.corner_y.duration = duration;
        animation.corner_x.enabled = true;
        animation.corner_y.enabled = true;
        if ( !animationIID ) animationIID = requestAnimationFrame(animate);
    };
    this.setStyles = function(_styles) {
        for ( var name in _styles ) {
            if ( !(name in styles) ) continue;
            styles[name] = _styles[name];
        }
    };
    this.setStyle = function(name, color) {
        if ( !(name in styles) ) return;
        styles[name] = color;
    };
};