var TouchyPerson = function() {
    var self = this;
    var PI2 = Math.PI * 2;
    var PI12 = Math.PI * 0.5;
    var PI32 = Math.PI * 1.5;
    var visible = true;
    var animationIID = null;
    var scheduleOperatorIID = null;
    var animationLastRefresh = null;
    var scheduleLastRefresh = null;
    var schedule = {
        "iris_move": { left: 1500, duration: 1500 },
        "blink": { left: 2250, duration: 2250 },
        "eb_move": { left: 3000, duration: 3000 },
        "mouth_move": { left: 4000, duration: 4000 },
        "head_turn": { left: 5000, duration: 5000 },
        "agreement": { left: 0, duration: 0, cycles: 3, degree: 1 },
        "agreement_end": { left: 0, duration: 0 },
        "disagreement": { left: 0, duration: 0, cycles: 3, degree: 1 },
        "disagreement_end": { left: 0, duration: 0 },
    };
    var exhale_coef = 1;
    var inhale_coef = 1.1;
    var bv = {
        canvas_cx_delta: 0,
        canvas_cy_delta: 0,
        x_turn: 0,
        y_turn: 0,
        head_r: 0.3,
        eye_r: 0.23,
        iris_r: 0.33,
        iris_distance: 0,
        iris_turn_angle: Math.PI,
        iris_turn_module: 0.55,
        iris_shift_angle: 0,
        iris_shift_module: 0,
        pupil_r: 0.64,
        eb_angle: -0.4,
        eb_pos: 0,
        el_area: 0.45,
        mouth_angle: 0,
        mouth_pos: 0,
    };
    var styles = {
        "head-background": "trasparent",
        "eye-background": "trasparent",
        "eyelid-background": "#222222",
        "iris-background": "#555555",
        "pupil-background": "#222222",
        "head-border-width": 0.004,
        "eye-border-width": 0.004,
        "eyelid-border-width": 0,
        "iris-border-width": 0,
        "pupil-border-width": 0,
        "eyebrow-line-width": 0.006,
        "mouth-line-width": 0.004,
        "head-border-color": "#222222",
        "eye-border-color": "#222222",
        "eyelid-border-color": "#222222",
        "iris-border-color": "#222222",
        "pupil-border-color": "#222222",
        "eyebrow-line-color": "#222222",
        "mouth-line-color": "#222222",
    };
    var cv = {};
    var av = {};
    (function() {
        for ( var i in bv ) {
            cv[i] = bv[i];
            av[i] = { i_value: cv[i], f_value: cv[i], duration: 0, cycles: 0 };
        }
        av["head_r"].i_value = bv["head_r"] * exhale_coef;
        av["head_r"].f_value = bv["head_r"] * inhale_coef;
        av["head_r"].cycles = Infinity;
        av["head_r"].duration = 1200;
        av["head_r"].cycles = Infinity;
    })();
    var alterValue = function(name, value, duration, cycles, init_values) {
        if ( arguments.length < 5 ) init_values = cv;
        if ( arguments.length < 4 ) cycles = 1;
        if ( arguments.length < 3 ) duration = 0;
        av[name].i_value = init_values[name];
        av[name].f_value = value;
        av[name].duration = duration;
        av[name].cycles = cycles;
    };
    var setValue = function(name, value, duration) {
        if ( arguments.length < 3 ) duration = 0;
        bv[name] = value;
        if ( name in av ) {
            av[name].i_value = cv[name];
            av[name].f_value = bv[name];
            av[name].duration = duration;
            av[name].cycles = 1;
        }
    };
    var setRandomTaskDelay = function(name) {
        schedule[name].left = Math.floor(
            Math.random() * schedule[name].duration + 
            0.5 * schedule[name].duration);
    };
    var setTaskDelay = function(name, delay) {
        schedule[name].duration = delay;
        schedule[name].left = delay;
    };
    var sanitizeValue = function(value, llimit, ulimit) {
        if ( value < llimit ) return llimit;
        if ( value > ulimit ) return ulimit;
        return value;
    };
    var stopMovements = false;
    var scheduleOperator = function() {
        var timestamp = performance.now();
        if ( scheduleLastRefresh === null ) {
            scheduleLastRefresh = timestamp;
            return;
        }
        var dt = timestamp - scheduleLastRefresh;
        if ( schedule["iris_move"].duration > 0 ) {
            schedule["iris_move"].left -= dt;
            if ( schedule["iris_move"].left <= 0 ) {
                cv["iris_shift_module"] = 0.3 * Math.random();
                cv["iris_shift_angle"] = Math.random() * PI2;
                cv["pupil_r"] = bv["pupil_r"] * (0.9 + Math.random() * 0.2);
                if ( cv["pupil_r"] > 0.85 && bv["pupil_r"] < cv["pupil_r"] )
                    cv["pupil_r"] = bv["pupil_r"];
                setRandomTaskDelay("iris_move");
            }
        }
        if ( schedule["blink"].duration > 0 ) {
            schedule["blink"].left -= dt;
            if ( schedule["blink"].left <= 0 ) {
                if ( !av["el_area"].cycles ) alterValue("el_area", 1, 200, 2);
                setRandomTaskDelay("blink");
            }
        }
        if ( schedule["mouth_move"].duration > 0 && !stopMovements ) {
            schedule["mouth_move"].left -= dt;
            if ( schedule["mouth_move"].left <= 0 ) {
                if ( !av["mouth_pos"].cycles && !av["mouth_angle"].cycles ) {
                    var mouth_pos = (Math.random() * 0.4 - 0.2) + bv["mouth_pos"];
                    var mouth_angle = (Math.random() * 0.2 - 0.1) + bv["mouth_angle"];
                    alterValue("mouth_pos", mouth_pos, 200);
                    alterValue("mouth_angle", mouth_angle, 200);
                }
                setRandomTaskDelay("mouth_move");
            }
        }
        if ( schedule["eb_move"].duration > 0 && !stopMovements ) {
            schedule["eb_move"].left -= dt;
            if ( schedule["eb_move"].left <= 0 ) {
                if ( !av["el_area"].cycles && !av["eb_angle"].cycles ) {
                    var eb_pos = bv["eb_pos"] + 0.5 * Math.random() - 0.25;
                    var eb_angle = bv["eb_angle"] + (0.25 * Math.random() - 0.125) * Math.PI;
                    alterValue("eb_pos", eb_pos, 350);
                    alterValue("eb_angle", eb_angle, 350);
                }
                setRandomTaskDelay("eb_move");
            }
        }
        if ( schedule["head_turn"].duration > 0 && !stopMovements ) {
            schedule["head_turn"].left -= dt;
            if ( schedule["head_turn"].left <= 0 ) {
                if ( !av["x_turn"].cycles && !av["y_turn"].cycles ) {
                    if ( Math.random() > 0.5 ) {
                        var x_turn = bv["x_turn"] + 0.3 * Math.random() - 0.15;
                        alterValue("x_turn", sanitizeValue(x_turn, -1, 1), 500);
                    } else {
                        var y_turn = bv["y_turn"] + 0.3 * Math.random() - 0.15;
                        alterValue("y_turn", sanitizeValue(y_turn, -1, 1), 500);
                    }
                }
                setRandomTaskDelay("head_turn");
            }
        }
        if ( schedule["agreement_end"].duration > 0 ) {
            schedule["agreement_end"].left -= dt;
            if ( schedule["agreement_end"].left <= 0 ) {
                setTaskDelay("agreement_end", 0);
                stopMovements = false;
            }
        }
        if ( schedule["disagreement_end"].duration > 0 ) {
            schedule["disagreement_end"].left -= dt;
            if ( schedule["disagreement_end"].left <= 0 ) {
                setTaskDelay("disagreement_end", 0);
                stopMovements = false;
            }
        }
        scheduleLastRefresh = timestamp;
    };
    var animate = function() {
        var timestamp = performance.now();
        if ( animationLastRefresh === null ) {
            animationLastRefresh = timestamp;
            animationIID = requestAnimationFrame(animate);
            return;
        }
        var dt = timestamp - animationLastRefresh;
        for ( var i in cv ) {
            if ( !(i in av) || !av[i].cycles ) continue;
            var dir = ( av[i].i_value <= av[i].f_value ) ? 1 : -1;
            if ( av[i].duration === 0 ) cv[i] = av[i].f_value;
            else cv[i] += ( av[i].f_value - av[i].i_value ) / av[i].duration * dt;
            if ( cv[i] * dir >= av[i].f_value * dir ) {
                cv[i] = av[i].f_value;
                if ( !isFinite(av[i].cycles) || --av[i].cycles > 0 )
                    av[i].f_value = av[i].i_value;
                av[i].i_value = cv[i];
            }
        }
        animationIID = requestAnimationFrame(animate);
        animationLastRefresh = timestamp;
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
    this.refresh = function(canvas) {
        if ( !visible || !(canvas instanceof HTMLCanvasElement) ) return;
        var canvas_cx = Math.floor(canvas.width / 2) * (1 + cv.canvas_cx_delta);
        var canvas_cy = Math.floor(canvas.height / 2) * (1 + cv.canvas_cy_delta);
        var abs_scale_coef = Math.min(canvas.width, canvas.height);
        var x_size = Math.pow(1 - Math.abs(cv.x_turn), 0.25);
        var y_size = Math.pow(1 - Math.abs(cv.y_turn), 0.25);
        var head_r = Math.floor(cv.head_r * abs_scale_coef);
        var head_r_base = Math.floor(bv.head_r * abs_scale_coef);
        var head_cx = canvas_cx + cv.x_turn * 0.5 * head_r_base;
        var head_cy = canvas_cy + cv.y_turn * 0.5 * head_r_base;
        var eye_r = Math.floor(head_r_base * cv.eye_r) * (0.7 + 0.3 * Math.min(x_size, y_size));
        var eye_shift_x = head_r_base * 0.3 * x_size;
        var eye_shift_y = head_r_base * 0.3 * y_size;
        var left_eye_x = Math.floor(head_cx - eye_shift_x);
        var left_eye_y = Math.floor(head_cy - eye_shift_y);
        var right_eye_x = Math.floor(head_cx + eye_shift_x);
        var right_eye_y = Math.floor(head_cy - eye_shift_y);
        var eyelid_const_shift = Math.PI * 0.39 * (1 - bv.el_area);
        var eyelid_shift = Math.PI * 0.39 * (1 - cv.el_area);
        var lower_eyelid_const_pos = eyelid_const_shift;
        var upper_eyelid_const_pos = Math.PI + eyelid_const_shift;
        var lower_eyelid_pos_0 = eyelid_shift;
        var lower_eyelid_pos_1 = Math.PI - eyelid_shift;
        var upper_eyelid_pos_0 = Math.PI + eyelid_shift;
        var upper_eyelid_pos_1 = 2 * Math.PI - eyelid_shift;
        var left_eyebrow_line = left_eye_y - eye_r * (1.3 + cv.eb_pos);
        var right_eyebrow_line = right_eye_y - eye_r * (1.3 + cv.eb_pos);
        var left_eyebrow_x1 = left_eye_x - 0.9 * eye_r;
        var left_eyebrow_x2 = left_eye_x + 0.9 * eye_r;
        var left_eyebrow_y1 = left_eyebrow_line - eye_r * 0.25 * cv.eb_angle;
        var left_eyebrow_y2 = left_eyebrow_line + eye_r * 0.25 * cv.eb_angle;
        var right_eyebrow_x1 = right_eye_x - 0.9 * eye_r;
        var right_eyebrow_x2 = right_eye_x + 0.9 * eye_r;
        var right_eyebrow_y1 = right_eyebrow_line + eye_r * 0.25 * cv.eb_angle;
        var right_eyebrow_y2 = right_eyebrow_line - eye_r * 0.25 * cv.eb_angle;
        var mouth_line = Math.floor(head_cy + y_size * head_r_base * 0.3 * (1 + 0.5 * cv.mouth_pos));
        var mouth_y1 = mouth_line;
        var mouth_y2 = Math.floor(mouth_line + head_r_base * 0.075 * cv.mouth_angle);
        var mouth_x1 = Math.floor(head_cx - x_size * head_r_base * 0.2);
        var mouth_x2 = Math.floor(head_cx + x_size * head_r_base * 0.2);
        var iris_r = Math.floor(eye_r * cv.iris_r);
        var iris_distance = Math.floor(eye_r * cv.iris_distance);
        var iris_dx = Math.floor((eye_r - iris_r) * cv.iris_turn_module * Math.cos(cv.iris_turn_angle));
        var iris_dy = Math.floor((eye_r - iris_r) * cv.iris_turn_module * Math.sin(cv.iris_turn_angle));
        iris_dx += Math.floor((eye_r - iris_r) * cv.iris_shift_module * Math.cos(cv.iris_shift_angle));
        iris_dy += Math.floor((eye_r - iris_r) * cv.iris_shift_module * Math.sin(cv.iris_shift_angle));
        var iris_dy_llimit = (eye_r - iris_r) * Math.sin(upper_eyelid_const_pos);
        var iris_dy_ulimit = (eye_r - iris_r) * Math.sin(lower_eyelid_const_pos);
        var iris_dx_llimit = -(eye_r - 1.1 * iris_r);
        var iris_dx_ulimit = eye_r - 1.1 * iris_r;
        var left_iris_dx = iris_dx + iris_distance;
        var right_iris_dx = iris_dx - iris_distance;
        if ( iris_dy < iris_dy_llimit ) iris_dy = iris_dy_llimit;
        if ( iris_dy > iris_dy_ulimit ) iris_dy = iris_dy_ulimit;
        if ( left_iris_dx < iris_dx_llimit ) left_iris_dx = iris_dx_llimit;
        if ( left_iris_dx > iris_dx_ulimit ) left_iris_dx = iris_dx_ulimit;
        if ( right_iris_dx < iris_dx_llimit ) right_iris_dx = iris_dx_llimit;
        if ( right_iris_dx > iris_dx_ulimit ) right_iris_dx = iris_dx_ulimit;
        var left_iris_x = left_eye_x + left_iris_dx;
        var left_iris_y = left_eye_y + iris_dy;
        var right_iris_x = right_eye_x + right_iris_dx;
        var right_iris_y = right_eye_y + iris_dy;
        var pupil_r = Math.floor(iris_r * cv.pupil_r);
        var context = canvas.getContext("2d");
        var lineWidth = Math.floor(head_r_base / 50);
        contextState.alter(context, "lineWidth", Math.max( lineWidth, 1 ));
        
        context.beginPath();
        context.arc(canvas_cx, canvas_cy, head_r, 0, PI2);
        
        if ( styles["head-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["head-background"]);
            context.fill();
        }
        if ( styles["head-border-width"] ) {
            var lineWidth = Math.floor(styles["head-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["head-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(left_eye_x, left_eye_y, eye_r, 0, PI2);
        
        if ( styles["eye-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["eye-background"]);
            context.fill();
        }
        if ( styles["eye-border-width"] ) {
            var lineWidth = Math.floor(styles["eye-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eye-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(right_eye_x, right_eye_y, eye_r, 0, PI2);
        
        if ( styles["eye-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["eye-background"]);
            context.fill();
        }
        if ( styles["eye-border-width"] ) {
            var lineWidth = Math.floor(styles["eye-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eye-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(left_iris_x, left_iris_y, iris_r, 0, PI2);
        
        if ( styles["iris-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["iris-background"]);
            context.fill();
        }
        if ( styles["iris-border-width"] ) {
            var lineWidth = Math.floor(styles["iris-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["iris-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(right_iris_x, right_iris_y, iris_r, 0, PI2);
        
        if ( styles["iris-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["iris-background"]);
            context.fill();
        }
        if ( styles["iris-border-width"] ) {
            var lineWidth = Math.floor(styles["iris-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["iris-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(left_iris_x, left_iris_y, pupil_r, 0, PI2);
        
        if ( styles["pupil-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["pupil-background"]);
            context.fill();
        }
        if ( styles["pupil-border-width"] ) {
            var lineWidth = Math.floor(styles["pupil-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["pupil-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(right_iris_x, right_iris_y, pupil_r, 0, PI2);
        
        if ( styles["pupil-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["pupil-background"]);
            context.fill();
        }
        if ( styles["pupil-border-width"] ) {
            var lineWidth = Math.floor(styles["pupil-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["pupil-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(left_eye_x, left_eye_y, eye_r, 
            upper_eyelid_pos_0, upper_eyelid_pos_1, false);
        
        if ( styles["eyelid-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["eyelid-background"]);
            context.fill();
        }
        if ( styles["eyelid-border-width"] ) {
            var lineWidth = Math.floor(styles["eyelid-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eyelid-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(right_eye_x, right_eye_y, eye_r, 
            upper_eyelid_pos_0, upper_eyelid_pos_1, false);
        
        if ( styles["eyelid-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["eyelid-background"]);
            context.fill();
        }
        if ( styles["eyelid-border-width"] ) {
            var lineWidth = Math.floor(styles["eyelid-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eyelid-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(left_eye_x, left_eye_y, eye_r, 
            lower_eyelid_pos_0, lower_eyelid_pos_1, false);
        
        if ( styles["eyelid-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["eyelid-background"]);
            context.fill();
        }
        if ( styles["eyelid-border-width"] ) {
            var lineWidth = Math.floor(styles["eyelid-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eyelid-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.arc(right_eye_x, right_eye_y, eye_r, 
            lower_eyelid_pos_0, lower_eyelid_pos_1, false);
        
        if ( styles["eyelid-background"] !== "trasparent" ) {
            contextState.alter(context, "fillStyle", styles["eyelid-background"]);
            context.fill();
        }
        if ( styles["eyelid-border-width"] ) {
            var lineWidth = Math.floor(styles["eyelid-border-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eyelid-border-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.moveTo(left_eyebrow_x1, left_eyebrow_y1);
        context.lineTo(left_eyebrow_x2, left_eyebrow_y2);
        
        if ( styles["eyebrow-line-width"] ) {
            var lineWidth = Math.floor(styles["eyebrow-line-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eyebrow-line-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.moveTo(right_eyebrow_x1, right_eyebrow_y1);
        context.lineTo(right_eyebrow_x2, right_eyebrow_y2);
        
        if ( styles["eyebrow-line-width"] ) {
            var lineWidth = Math.floor(styles["eyebrow-line-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["eyebrow-line-color"]);
            context.stroke();
        }
        
        context.beginPath();
        context.moveTo(mouth_x1, mouth_y1);
        context.lineTo(mouth_x2, mouth_y2);
        
        if ( styles["mouth-line-width"] ) {
            var lineWidth = Math.floor(styles["mouth-line-width"] * abs_scale_coef);
            if ( lineWidth < 1 ) lineWidth = 1;
            contextState.alter(context, "lineWidth", lineWidth);
            contextState.alter(context, "strokeStyle", styles["mouth-line-color"]);
            context.stroke();
        }
        
        contextState.restore(context);
    };
    this.agree = function(iterations, degree) {
        if ( arguments.length < 2 ) degree = 1;
        if ( arguments.length < 1 ) iterations = 3;
        var dir = ( bv["y_turn"] < 0.1 ) ? 1 : -1;
        var y_turn = bv["y_turn"] + dir * 0.2;
        var duration = 350 / degree;
        var cycles = iterations * 2;
        alterValue("y_turn", y_turn, duration, cycles, bv);
        setTaskDelay("agreement_end", duration * cycles + 50);
        if ( schedule["disagreement_end"].duration > 0 ) {
            alterValue("x_turn", bv["x_turn"], duration, 1);
            setTaskDelay("disagreement_end", 0);
        }
        stopMovements = true;
    };
    this.disagree = function(iterations, degree) {
        if ( arguments.length < 2 ) degree = 1;
        if ( arguments.length < 1 ) iterations = 3;
        var dir = ( bv["x_turn"] < 0.1 ) ? 1 : -1;
        var x_turn = bv["x_turn"] + dir * 0.2;
        var duration = 350 / degree;
        var cycles = iterations * 2;
        alterValue("x_turn", x_turn, duration, cycles, bv);
        setTaskDelay("disagreement_end", duration * cycles + 50);
        if ( schedule["agreement_end"].duration > 0 ) {
            alterValue("y_turn", bv["y_turn"], duration, 1);
            setTaskDelay("agreement_end", 0);
        }
        stopMovements = true;
    };
    this.setAnxiety = function(value) {
        if ( value < 0 || value > 1 ) return;
        setValue("iris_r", 0.33 + 0.03 * value);
        setValue("pupil_r", 0.64 + 0.21 * value);
        setValue("eb_pos", 0.3 * value);
        exhale_coef = 1 - 0.03 * value;
        inhale_coef = 1.1 + 0.03 * value;
        av["head_r"].duration = 1200 * (1 - 0.3 * value);
        av["head_r"].i_value = bv["head_r"] * exhale_coef;
        av["head_r"].f_value = bv["head_r"] * inhale_coef;
        setTaskDelay("disagreement_end", 0);
        setTaskDelay("agreement_end", 0);
        stopMovements = false;
    };
    this.setAgression = function(value) {
        if ( value < -1 || value > 1 ) return;
        setValue("eb_angle", value, 300);
        setValue("mouth_pos", value, 400);
        setValue("mouth_angle", -value, 400);
        setValue("el_area", 0.45 - 0.2 * value, 400);
        setTaskDelay("disagreement_end", 0);
        setTaskDelay("agreement_end", 0);
        stopMovements = false;
    };
    this.setDepression = function(value, direction) {
        if ( value < 0 || value > 1 ) return;
        if ( value < 0.5 ) {
            setValue("y_turn", value, 500);
            setValue("x_turn", 0, 500);
            cv["iris_turn_angle"] = 0;
            cv["iris_turn_module"] = 0;
        } else {
            var dir = ( direction === "left" ) ? -1 : 1;
            setValue("y_turn", 0.5, 500);
            setValue("x_turn", 0.6 * dir * value, 500);
            cv["iris_turn_angle"] = ( dir === 1 ) ? 0 : Math.PI;
            cv["iris_turn_module"] = 0.4 * value + 0.5;
        }
        setTaskDelay("disagreement_end", 0);
        setTaskDelay("agreement_end", 0);
        stopMovements = false;
    };
    this.setSightDirection = function(angle, module) {
        if ( arguments.length < 2 ) module = 0.5;
        angle = -angle * Math.PI / 180;
        module = sanitizeValue(module, 0, 1);
        cv["iris_turn_angle"] = angle;
        cv["iris_turn_module"] = module;
    };
    this.setDirectSight = function() {
        cv["iris_turn_angle"] = 0;
        cv["iris_turn_module"] = 0;
    };
    this.setPosition = function(cx, cy, r) {
        if ( arguments.length < 3 ) r = 0.3;
        if ( arguments.length < 2 ) cy = 0;
        if ( arguments.length < 1 ) cx = 0;
        cv["head_r"] = bv["head_r"] = r;
        av["head_r"].i_value = bv["head_r"] * exhale_coef;
        av["head_r"].f_value = bv["head_r"] * inhale_coef;
        cv["canvas_cx_delta"] = bv["canvas_cx_delta"] = cx;
        cv["canvas_cy_delta"] = bv["canvas_cy_delta"] = cy;
    };
    this.moveTo = function(cx, cy, duration) {
        if ( arguments.length < 3 ) duration = 1500;
        alterValue("canvas_cx_delta", cx, duration, 1);
        alterValue("canvas_cy_delta", cy, duration, 1);
    };
    this.setVisibility = function(value) { visible = !(value === false); };
    this.setStyles = function(_styles) {
        for ( var name in _styles ) {
            if ( !(name in styles) ) continue;
            styles[name] = _styles[name];
        }
    };
    this.setStyle = function(name, value) {
        if ( !(name in styles) ) return;
        styles[name] = value;
    };
    (function() {
        scheduleOperatorIID = setInterval(scheduleOperator, 175);
        animate();
    })();
};