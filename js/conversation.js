var Conversation = function(canvases) {
    var self = this;
    var mainCanvasElement = canvases.main || canvases;
    var textCanvasElement = canvases.text || mainCanvasElement;
    var bgCanvasElement = canvases.bg || mainCanvasElement;
    var bgCanvasAdjuster = new CanvasAdjuster(bgCanvasElement, 2);
    var mainCanvasAdjuster = new CanvasAdjuster(mainCanvasElement, 2);
    var textCanvasAdjuster = new CanvasAdjuster(textCanvasElement, 2);
    var bgCanvasRefresher = new CanvasRefresher(bgCanvasAdjuster.getCanvas(), "manual");
    var mainCanvasRefresher = new CanvasRefresher(mainCanvasAdjuster.getCanvas());
    var textCanvasRefresher = new CanvasRefresher(textCanvasAdjuster.getCanvas(), "manual");
    var hostPerson = new TouchyPerson();
    var guestPerson = new TouchyPerson();
    var hostWords = new SpeechBalloon();
    var positiveResponse = new SpeechBalloon();
    var negativeResponse = new SpeechBalloon();
    window.conversationRoom = new ConversationRoom();
    var toStringGen = Object.prototype.toString;
    var isArray = function(v) { return (toStringGen.call(v) === "[object Array]"); };
    var getGradientCompletion = function(value, lowerLim, upperLim, entropyRange) {
        var entropyCoef = Math.random() * entropyRange * 2 - entropyRange;
        var entropy = Math.abs(upperLim - lowerLim) * entropyCoef;
        var completion = (value - lowerLim) / (upperLim - lowerLim);
        return Math.max(Math.min(completion, 1), 0);
    };
    var hostMood = {
        agression: 0,
        depression: 0,
        anxiety: 0,
        bipolarity: 0.5,
    };
    var timeVelocity = 1;
    var response = "noresponse";
    var stage = "0";
    var futureStage = "0";
    var subStage =  "post-stage";
    var stageType = "no-guest-response";
    var delaysType = "normal";
    var delays = {
        "with-guest-response": {
            "normal": {
                "pre-stage": 5500,
                "display-host-sentence": 2500,
                "display-guest-sentences": 0,
                "await-guest-response": 12000,
                "display-host-reaction": 6000,
                "post-stage": 0,
            },
            "no-response": {
                "pre-stage": 5500,
                "display-host-sentence": 2500,
                "display-guest-sentences": 0,
                "await-guest-response": 12000,
                "display-host-reaction": 4000,
                "post-stage": 0,
            },
        },
        "no-guest-response": {
            "normal": {
                "pre-stage": 4500,
                "display-host-sentence": 5500,
                "display-host-reaction": 1500,
                "post-stage": 0,
            },
            "quick-response": {
                "pre-stage": 1500,
                "display-host-sentence": 4500,
                "display-host-reaction": 1500,
                "post-stage": 0,
            },
        },
    };
    var subStages = {
        "with-guest-response": {
            "pre-stage": { ontimeout: "display-host-sentence" },
            "display-host-sentence": { ontimeout: "display-guest-sentences" },
            "display-guest-sentences": { ontimeout: "await-guest-response" },
            "await-guest-response": {
                onaction: "display-host-reaction",
                ontimeout: "display-host-reaction",
            },
            "display-host-reaction": { ontimeout: "post-stage" },
            "post-stage": { ontimeout: "pre-stage" },
        },
        "no-guest-response": {
            "pre-stage": { ontimeout: "display-host-sentence" },
            "display-host-sentence": { ontimeout: "display-host-reaction" },
            "display-host-reaction": { ontimeout: "post-stage" },
            "post-stage": { ontimeout: "pre-stage" },
        },
    };
    var stages = {
        "0": {
            actions: ["rollout"],
            noresponse: { next: ["1A","1B"] },
            delays: "quick-response",
        }, 
        "1A": {
            sentence: "Hi, how is it going?",
            negative: {
                sentence: "Get lost!",
                depression_delta: 0.45,
                agression_delta: 0.5,
                anxiety_delta: -0.5,
                chances: 0.5,
                next: "1N",
                reactions: [{
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, 0, -0.55, 0.2);
                    },
                    depression_delta: 0.25,
                    agression_delta: 0.2,
                    anxiety_delta: -0.25,
                    next: "1PB",
                }, {
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, -0.55, 0, 0.2);
                    },
                    depression_delta: 0.45,
                    agression_delta: 0.5,
                    anxiety_delta: -0.5,
                    next: "1N",
                }],
            },
            positive: {
                sentence: "Fine. Thanks",
                depression_delta: -0.33,
                agression_delta: -0.4,
                anxiety_delta: -0.5,
                chances: 0.5,
                next: "1PA",
                reactions: [{
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, 0.4, -0.1, 0.2);
                    },
                    depression_delta: -0.25,
                    agression_delta: -0.3,
                    anxiety_delta: -0.4,
                    next: "1PA",
                }, {
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, -0.1, 0.4, 0.2);
                    },
                    depression_delta: -0.1,
                    agression_delta: -0.1,
                    anxiety_delta: -0.3,
                    next: "1I",
                }],
            },
            noresponse: {
                next: "1V",
                anxiety_delta: 0.3,
                depression_delta: 0.2,
                agression_delta: 0.1,
            },
            delays: "normal",
        },
        "1B": {
            sentence: "Hello, how are you?",
            negative: {
                sentence: "Better than you",
                depression_delta: 0.45,
                agression_delta: 0.5,
                anxiety_delta: -0.5,
                chances: 0.5,
                next: "1N",
                reactions: [{
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, 0, -0.5, 0.2);
                    },
                    depression_delta: 0.25,
                    agression_delta: 0.2,
                    anxiety_delta: -0.25,
                    next: "1PA",
                }, {
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, -0.5, 0, 0.2);
                    },
                    depression_delta: 0.45,
                    agression_delta: 0.5,
                    anxiety_delta: -0.5,
                    next: "1N",
                }],
            },
            positive: {
                sentence: "Good",
                depression_delta: -0.33,
                agression_delta: -0.4,
                anxiety_delta: -0.5,
                chances: 0.5,
                next: "1PA",
                reactions: [{
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, 0.25, -0.25, 0.2);
                    },
                    depression_delta: -0.25,
                    agression_delta: -0.3,
                    anxiety_delta: -0.4,
                    next: "1PA",
                }, {
                    chances: function(mood) {
                        return getGradientCompletion(
                            mood.agression, -0.25, 0.25, 0.2);
                    },
                    depression_delta: -0.1,
                    agression_delta: -0.1,
                    anxiety_delta: -0.3,
                    next: "1I",
                }],
            },
            noresponse: {
                next: "1V",
                anxiety_delta: 0.3,
                depression_delta: 0.2,
                agression_delta: 0.1,
            },
            delays: "normal",
        },
        "1N": {
            sentence: "It was mean",
            noresponse: {
                depression_delta: -0.1,
                agression_delta: -0.3,
                next: ["2A", "2B"]
            },
            delays: "normal",
        },
        "1I": {
            sentence: "Really?",
            noresponse: { next: ["2A", "2B"] },
            delays: "normal",
        },
        "1PA": {
            sentence: "Fine!",
            noresponse: { next: ["2A", "2B"] },
            delays: "quick-response",
        },
        "1PB": {
            sentence: "Okay",
            noresponse: { next: ["4"] },
            delays: "quick-response",
        },
        "1V": {
            sentence: "Mmmm..",
            noresponse: {
                anxiety_delta: 0.3,
                next: ["3A", "3B"], 
            },
            delays: "normal",
        },
        "2A": {
            sentence: "How do you like my code?",
            negative: {
                sentence: "A pile of crap!",
                depression_delta: 0.55,
                agression_delta: 0.75,
                anxiety: 0.2,
                next: "2N",
            },
            positive: { 
                sentence: "Pretty clever",
                depression_delta: -0.55,
                agression_delta: -0.65,
                anxiety: 0,
                next: "2P",
            },
            noresponse: { next: "2V" },
            delays: "normal",
        },
        "2B": {
            sentence: "How do you like my style?",
            negative: {
                sentence: "Uncool",
                depression_delta: 0.35,
                agression_delta: 0.55,
                anxiety: 0.2,
                next: "2N",
            },
            positive: {
                sentence: "Pretty good",
                depression_delta: -0.45,
                agression_delta: -0.55,
                anxiety: 0,
                next: "2P",
            },
            noresponse: { next: "2V" },
            delays: "normal",
        },
        "2N": {
            sentence: "I don't wanna talk to you anymore",
            noresponse: { next: "2NN" },
            delays: "normal",
        },
        "2NN": {
            sentence: "...",
            noresponse: {
                depression_delta: -0.2,
                agression_delta: -0.2,
                anxiety_delta: -0.3,
                next: ["3A", "3B"],
            },
            delays: "normal",
        },
        "2P": {
            sentence: "Oh, you seem a savvy person",
            noresponse: { next: ["3A", "3B"] },
            delays: "quick-response",
        },
        "2V": {
            sentence: "If you don't wanna talk you really don't have to",
            noresponse: { next: ["3A", "3B"] },
            delays: "quick-response",
        },
        "3A": {
            sentence: "Okay, I gotta go",
            noresponse: { next: "4" },
            delays: "normal",
        },
        "3B": {
            sentence: "Well, bye then",
            noresponse: { next: "4" },
            delays: "normal",
        },
        "4": {
            actions: ["rollaway"],
            noresponse: {
                next: "5",
                chances: 0.5,
                reactions: [{
                    chances: function(mood) {
                        return Math.random();
                    },
                    next: "5",
                    anxiety_coef: 0.5,
                    depression_coef: 0.5,
                    agression_coef: 0.5,
                }, {
                    chances: function(mood) {
                        var aggressionThr = getGradientCompletion(
                            mood.agression, -0.25, 0.25, 0.2);
                        if ( aggressionThr > 0.5 ) return 0;
                        return getGradientCompletion(
                            mood.bipolarity, 0.2, 0.8, 0.2);
                    },
                    next: "5",
                    anxiety: 0,
                    depression: 0,
                    agression: 0.75,
                }, {
                    chances: function(mood) {
                        var aggressionThr = getGradientCompletion(
                            mood.agression, -0.25, 0.25, 0.2);
                        if ( aggressionThr < 0.5 ) return 0;
                        return getGradientCompletion(
                            mood.bipolarity, 0.2, 0.8, 0.2);
                    },
                    next: "5",
                    anxiety: 0,
                    depression: 0,
                    agression: -0.75,
                }, {
                    chances: function(mood) {
                        var depressionThr = getGradientCompletion(
                            mood.depression, 0, 0.25, 0.2);
                        if ( depressionThr > 0.5 ) return 0;
                        return getGradientCompletion(
                            mood.bipolarity, 0.2, 0.8, 0.2);
                    },
                    next: "5",
                    anxiety: 0,
                    depression: 0.75,
                    agression: 0,
                }],
            },
            delays: "normal",
        },
        "5": {
            actions: ["change-perspective"],
            noresponse: {
                next: "0",
                anxiety_delta: -0.2,
            },
            delays: "normal",
        },
    };
    var schedule = { 
        "sub-stage-timeout": 0,
        "optimize-performance": -1,
        "bg-canvas-resize-end": -1,
        "text-canvas-resize-end": -1,
    };
    var stageActions = {
        "pre-stage": function() {
            hostWords.setVisibility(false);
            positiveResponse.setVisibility(false);
            negativeResponse.setVisibility(false);
            if ( "sentence" in stages[stage] ) {
                var font = ( stages[stage].sentence.length > 36 ) ? 0.03 : 0.04;
                hostWords.setAlignment(0.3, 0.5);
                hostWords.setPosition(0, 1, 0, -0.24);
                hostWords.setPointer(8);
                hostWords.setStyle("font-size", font);
                hostWords.setText(stages[stage].sentence);
            }
            if ( "positive" in stages[stage] ) {
                var font = ( stages[stage].positive.sentence.length > 36 ) ? 0.03 : 0.04;
                positiveResponse.setAlignment(0.25, 0.94);
                positiveResponse.setPosition(0.5, 1, 0, 0);
                positiveResponse.setPointer(10);
                hostWords.setStyle("font-size", font);
                positiveResponse.setText(stages[stage].positive.sentence);
            }
            if ( "negative" in stages[stage] ) {
                var font = ( stages[stage].negative.sentence.length > 32 ) ? 0.03 : 0.04;
                negativeResponse.setAlignment(0.75, 0.94);
                negativeResponse.setPosition(0.5, 1, 0, 0);
                negativeResponse.setPointer(10);
                hostWords.setStyle("font-size", font);
                negativeResponse.setText(stages[stage].negative.sentence);
            }
            textCanvasRefresher.refresh();
            response = "noresponse";
            stageType = ( "positive" in stages[stage] || "negative" in stages[stage] )
                    ? "with-guest-response"
                    : "no-guest-response";
            delaysType = ( "delays" in stages[stage] )
                    ? stages[stage].delays
                    : "normal";
            
        },
        "display-host-sentence": function() {
            if ( "sentence" in stages[stage] ) {
                hostWords.setVisibility(true);
                textCanvasRefresher.refresh();
            }
            if ( "actions" in stages[stage] ) {
                if ( stages[stage].actions.indexOf("rollout") > -1 )
                    hostPerson.moveTo(-0.4, 0, 3000);
                else if ( stages[stage].actions.indexOf("rollaway") > -1 )
                    hostPerson.moveTo(-1.5, 0, 3000);
                else if ( stages[stage].actions.indexOf("change-perspective") > -1 ) {
                    var corner_x = 0.25 + Math.random() * 0.15;
                    var corner_y = 0.55 + Math.random() * 0.15;
                    conversationRoom.moveCornerPosition(corner_x, corner_y, 1500);
                }
            }
        },
        "display-guest-sentences": function() {
            positiveResponse.setVisibility(true);
            negativeResponse.setVisibility(true);
            textCanvasRefresher.refresh();
            
        },
        "display-host-reaction": function() {
            var reaction = stages[stage][response];
            if ( reaction.reactions && reaction.reactions.length ) {
                var maxchances = ("chances" in reaction) ? reaction.chances : 0.5;
                var options = [{
                    option: reaction,
                    chances: maxchances
                }];
                for ( var i=0, option; option = reaction.reactions[i]; i++ ) {
                    var chances  = 0;
                    if ( typeof option.chances === "function" ) {
                        chances = option.chances(hostMood);
                    } else if ( typeof option.chances === "number" && isFinite(option.chances) ) {
                        chances = Math.min(Math.random() * option.chances * 2, 1);
                    }
                    if ( chances >= maxchances ) {
                        options.push({
                            option: option,
                            chances: chances,
                        });
                        maxchances = chances;
                    }
                }
                for ( var i=0; i < options.length; i++ ) {
                    if ( options[i].chances < maxchances ) {
                        options.splice(i--, 1);
                    }
                }
                var reactionIndex = Math.floor(Math.random() * options.length);
                reaction = options[reactionIndex].option;
            }
            if ( "depression_delta" in reaction ) hostMood.depression += reaction["depression_delta"];
            if ( "agression_delta" in reaction ) hostMood.agression += reaction["agression_delta"];
            if ( "anxiety_delta" in reaction ) hostMood.anxiety += reaction["anxiety_delta"];
            if ( "depression_coef" in reaction ) hostMood.depression *= reaction["depression_coef"];
            if ( "agression_coef" in reaction ) hostMood.agression *= reaction["agression_coef"];
            if ( "anxiety_coef" in reaction ) hostMood.anxiety *= reaction["anxiety_coef"];
            if ( typeof reaction["depression"] === "number" ) hostMood.depression = reaction["depression"];
            if ( typeof reaction["agression"] === "number" ) hostMood.agression = reaction["agression"];
            if ( typeof reaction["anxiety"] === "number" ) hostMood.anxiety = reaction["anxiety"];
            if ( typeof reaction["depression"] === "function" ) hostMood.depression = reaction["depression"]();
            if ( typeof reaction["agression"] === "function" ) hostMood.agression = reaction["agression"]();
            if ( typeof reaction["anxiety"] === "function" ) hostMood.anxiety = reaction["anxiety"]();
            if ( hostMood.depression < 0 ) hostMood.depression = 0;
            if ( hostMood.depression > 1 ) hostMood.depression = 1;
            if ( hostMood.agression < -1 ) hostMood.agression = -1;
            if ( hostMood.agression > 1 ) hostMood.agression = 1;
            if ( hostMood.anxiety < 0 ) hostMood.anxiety = 0;
            if ( hostMood.anxiety > 1 ) hostMood.anxiety = 1;
            hostPerson.setAgression(hostMood.agression);
            hostPerson.setDepression(hostMood.depression, "left");
            hostPerson.setAnxiety(hostMood.anxiety);
            hostPerson.setSightDirection(0);
            if ( response === "positive" ) {
                hostPerson.setSightDirection(0);
                negativeResponse.setVisibility(false);
                positiveResponse.setAlignment(0.7, 0.5);
                positiveResponse.setPosition(1, 0, 0, 0.24);
                positiveResponse.setPointer(2);
            } else if ( response === "negative" ) {
                hostPerson.setSightDirection(0);
                positiveResponse.setVisibility(false);
                negativeResponse.setAlignment(0.7, 0.5);
                negativeResponse.setPosition(1, 0, 0, 0.24);
                negativeResponse.setPointer(2);
            } else {
                positiveResponse.setVisibility(false);
                negativeResponse.setVisibility(false);
                if ( stageType === "with-guest-response" )
                    delaysType = "no-response";
            }
            var nextStage = reaction.next;
            if ( !isArray(nextStage) ) {
                futureStage = reaction.next;
            } else {
                var index = Math.floor(Math.random() * nextStage.length);
                futureStage = nextStage[index];
            }
            textCanvasRefresher.refresh();
        },
        "post-stage": function() {
            stage = futureStage;
            futureStage = "0";
        },
    };
    var stageOperator = function(event) {
        if ( !(event in subStages[stageType][subStage]) ) return;
        subStage = subStages[stageType][subStage][event];
        if ( subStage in stageActions ) stageActions[subStage]();
        schedule["sub-stage-timeout"] = delays[stageType][delaysType][subStage];
    };
    var scheduleLastRefresh = null;
    var scheduleOperatorIID = null;
    var scheduleOperator = function() {
        var timestamp = performance.now();
        if ( scheduleLastRefresh === null ) {
            scheduleLastRefresh = timestamp;
            return;
        }
        var delta_t = (timestamp - scheduleLastRefresh) * timeVelocity;
        if ( schedule["sub-stage-timeout"] >= 0 ) {
            if ( (schedule["sub-stage-timeout"] -= delta_t) <= 0 ) {
                schedule["sub-stage-timeout"] = -1;
                stageOperator("ontimeout");
            }
        }
        if ( schedule["optimize-performance"] >= 0 ) {
            if ( (schedule["optimize-performance"] -= delta_t) <= 0 ) {
                schedule["optimize-performance"] = -1;
                mainCanvasAdjuster.setResCoef(2);
                var timeConsumed = Infinity, coef = 2, iterations = 0;
                while ( ++iterations < 4 ) {
                    var timeConsumed = Math.min(
                        self.runBenchmark("main"),
                        self.runBenchmark("main"),
                        self.runBenchmark("main"));
                    if ( timeConsumed <= 12 ) break;
                    if ( Math.abs(coef - 0.5) < Number.EPSILON ) break;
                    mainCanvasAdjuster.setResCoef(coef*=0.5);
                }
                textCanvasAdjuster.setResCoef(coef);
                bgCanvasAdjuster.setResCoef(coef);
            }
        }
        if ( schedule["bg-canvas-resize-end"] >= 0 ) {
            if ( (schedule["bg-canvas-resize-end"] -= delta_t) <= 0 ) {
                schedule["bg-canvas-resize-end"] = -1;
                bgCanvasRefresher.setRefreshMode("manual");
            }
        }
        if ( schedule["text-canvas-resize-end"] >= 0 ) {
            if ( (schedule["text-canvas-resize-end"] -= delta_t) <= 0 ) {
                schedule["text-canvas-resize-end"] = -1;
                textCanvasRefresher.setRefreshMode("manual");
            }
        }
        scheduleLastRefresh = timestamp;
    };
    var listeners = {
        onclick: function(ev) {
            var boundingRect = textCanvasAdjuster.getBoundingRect();
            if ( ev.clientX < boundingRect.left ||
                ev.clientX > boundingRect.right ||
                ev.clientY < boundingRect.top ||
                ev.clientY > boundingRect.bottom )
                    return;
            var coef = textCanvasAdjuster.getResCoef();
            var x = ev.clientX * coef;
            var y = ev.clientY * coef;
            if ( positiveResponse.isVisible() ) {
                var brPositiveResponse = positiveResponse.getBoundingRect();
                if ( x >= brPositiveResponse.left && 
                    x <= brPositiveResponse.right &&
                    y >= brPositiveResponse.top && 
                    y <= brPositiveResponse.bottom ) {
                        response = "positive";
                        stageOperator("onaction");
                    }
            }
            if ( negativeResponse.isVisible() ) {
                var brNegativeResponse = negativeResponse.getBoundingRect();
                if ( x >= brNegativeResponse.left && 
                    x <= brNegativeResponse.right &&
                    y >= brNegativeResponse.top && 
                    y <= brNegativeResponse.bottom ) {
                        response = "negative";
                        stageOperator("onaction");
                    }
            }
        },
        bgCanvasResize: function(width, height) {
            schedule["bg-canvas-resize-end"] = 125;
            bgCanvasRefresher.setRefreshMode("auto");
        },
        textCanvasResize: function(width, height) {
            schedule["text-canvas-resize-end"] = 125;
            textCanvasRefresher.setRefreshMode("auto");
        },
        mainCanvasResize: function(width, height) {
            var refreshInterval = mainCanvasAdjuster.getRefreshInterval();
            schedule["optimize-performance"] = refreshInterval + 200;
        },
        roomCornerAnimation: function() {
            schedule["bg-canvas-resize-end"] = 125;
            bgCanvasRefresher.setRefreshMode("auto");
        },
    };
    this.runBenchmark = function(componentName) {
        var startTime = performance.now();
        var bgRefreshMode = bgCanvasRefresher.getRefreshMode();
        var mainRefreshMode = mainCanvasRefresher.getRefreshMode();
        var textRefreshMode = textCanvasRefresher.getRefreshMode();
        bgCanvasRefresher.setRefreshMode("manual");
        mainCanvasRefresher.setRefreshMode("manual");
        textCanvasRefresher.setRefreshMode("manual");
        if ( !componentName || componentName === "bg" )
            bgCanvasRefresher.refresh();
        if ( !componentName || componentName === "main" )
            mainCanvasRefresher.refresh();
        if ( !componentName || componentName === "text" )
            textCanvasRefresher.refresh();
        bgCanvasRefresher.setRefreshMode(bgRefreshMode);
        mainCanvasRefresher.setRefreshMode(mainRefreshMode);
        textCanvasRefresher.setRefreshMode(textRefreshMode);
        return performance.now() - startTime;
    };
    (function() {
        hostPerson.setPosition(-1.5, 0, 0.2);
        hostPerson.setSightDirection(0);
        hostPerson.setStyles({
            "head-background": "#aaaaaa",
            "eye-background": "#cccccc",
        });
        guestPerson.setPosition(0.4, 0, 0.2);
        guestPerson.setSightDirection(180);
        guestPerson.setStyles({
            "head-background": "#aaaaaa",
            "eye-background": "#cccccc",
        });
        hostWords.setVisibility(false);
        hostWords.setStyles({
            "width": 0.4,
            "font-size": 0.04,
            "font-color": "#222222",
            "background": "#878787",
        });
        positiveResponse.setVisibility(false);
        positiveResponse.setStyles({
            "width": 0.4,
            "font-size": 0.04,
            "font-color": "#eeeeee",
            "background": "#444444",
        });
        negativeResponse.setVisibility(false);
        negativeResponse.setStyles({
            "width": 0.4,
            "font-size": 0.04,
            "font-color": "#eeeeee",
            "background": "#444444",
        });
        conversationRoom.setCornerPosition(0.3, 0.6);
        bgCanvasRefresher.insertObject(0, conversationRoom);
        mainCanvasRefresher.insertObject(0, hostPerson);
        mainCanvasRefresher.insertObject(0, guestPerson);
        textCanvasRefresher.insertObject(0, hostWords);
        textCanvasRefresher.insertObject(0, positiveResponse);
        textCanvasRefresher.insertObject(0, negativeResponse);
        bgCanvasRefresher.refresh();
        textCanvasRefresher.refresh();
        hostPerson.setAgression(hostMood.agression);
        hostPerson.setDepression(hostMood.depression, "left");
        hostPerson.setAnxiety(hostMood.anxiety);
        bgCanvasAdjuster.addEventListener("resize", listeners.bgCanvasResize);
        textCanvasAdjuster.addEventListener("resize", listeners.textCanvasResize);
        mainCanvasAdjuster.addEventListener("resize", listeners.mainCanvasResize);
        conversationRoom.addEventListener("animationframe", listeners.roomCornerAnimation);
        window.addEventListener("click", listeners.onclick);
        scheduleOperatorIID = setInterval(scheduleOperator, 125);
    })();
};