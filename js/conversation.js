var Conversation = function(canvasElement) {
    var canvasAdjuster = new CanvasAdjuster(canvasElement, 2);
    var canvasRefresher = new CanvasRefresher(canvasAdjuster.getCanvas());
    var hostPerson = new TouchyPerson();
    var guestPerson = new TouchyPerson();
    var hostWords = new SpeechBalloon();
    var positiveResponse = new SpeechBalloon();
    var negativeResponse = new SpeechBalloon();
    window.conversationRoom = new ConversationRoom();
    var hostMood = {
        agression: 0,
        depression: 0,
        anxiety: 0,
    };
    var response = "noresponse";
    var stage = "0";
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
            noresponse: { next: "1" },
            delays: "quick-response",
        },
        "1": {
            sentence: "Hi, how is it going?",
            negative: {
                sentence: "Get lost!",
                depression_delta: 0.45,
                agression_delta: 0.5,
                anxiety_delta: -0.5,
                next: "1N",
            },
            positive: {
                sentence: "Fine. Thanks",
                depression_delta: -0.33,
                agression_delta: -0.4,
                anxiety_delta: -0.5,
                next: "1P",
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
                next: "2",
            },
            delays: "normal",
        },
        "1P": {
            sentence: "Fine!",
            noresponse: { next: "2" },
            delays: "quick-response",
        },
        "1V": {
            sentence: "Mmmm..",
            noresponse: {
                anxiety_delta: 0.3,
                next: "3" 
            },
            delays: "normal",
        },
        "2": {
            sentence: "How do you like my code?",
            negative: {
                sentence: "A pile of crap!",
                depression_delta: 0.55,
                agression_delta: 0.75,
                anxiety: 0,
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
                next: "3",
            },
            delays: "normal",
        },
        "2P": {
            sentence: "Oh, you seem a savvy person",
            noresponse: { next: "3" },
            delays: "quick-response",
        },
        "2V": {
            sentence: "If you don't wanna talk you really don't have to",
            noresponse: { next: "3" },
            delays: "quick-response",
        },
        "3": {
            sentence: "Okay, I gotta go",
            noresponse: { next: "4" },
            delays: "normal",
        },
        "4": {
            actions: ["rollaway"],
            noresponse: { next: "5" },
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
    var schedule = { "sub-stage-timeout": 0 };
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
            response = "noresponse";
            stageType = ( "positive" in stages[stage] || "negative" in stages[stage] )
                    ? "with-guest-response"
                    : "no-guest-response";
            delaysType = ( "delays" in stages[stage] )
                    ? stages[stage].delays
                    : "normal";
        },
        "display-host-sentence": function() {
            if ( "sentence" in stages[stage] ) 
                hostWords.setVisibility(true);
            if ( "actions" in stages[stage] ) {
                if ( stages[stage].actions.indexOf("rollout") > -1 )
                    hostPerson.moveTo(-0.4, 0, 3000);
                else if ( stages[stage].actions.indexOf("rollaway") > -1 )
                    hostPerson.moveTo(-1.5, 0, 3000);
                else if ( stages[stage].actions.indexOf("change-perspective") > -1 ) {
                    var corner_x = 0.25 + Math.random() * 0.15;
                    var corner_y = 0.55 + Math.random() * 0.15;
                    conversationRoom.moveCornerPosition(corner_x, corner_y);
                }
            }
        },
        "display-guest-sentences": function() {
            positiveResponse.setVisibility(true);
            negativeResponse.setVisibility(true);
            
        },
        "display-host-reaction": function() {
            if ( "depression_delta" in stages[stage][response] )
                hostMood.depression += stages[stage][response]["depression_delta"];
            if ( "agression_delta" in stages[stage][response] )
                hostMood.agression += stages[stage][response]["agression_delta"];
            if ( "anxiety_delta" in stages[stage][response] )
                hostMood.anxiety += stages[stage][response]["anxiety_delta"];
            if ( "depression" in stages[stage][response] )
                hostMood.depression = stages[stage][response]["depression"];
            if ( "agression" in stages[stage][response] )
                hostMood.agression = stages[stage][response]["agression"];
            if ( "anxiety" in stages[stage][response] )
                hostMood.anxiety = stages[stage][response]["anxiety"];
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
        },
        "post-stage": function() {
            stage = stages[stage][response].next;
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
        var delta_t = timestamp - scheduleLastRefresh;
        if ( schedule["sub-stage-timeout"] >= 0 ) {
            if ( (schedule["sub-stage-timeout"] -= delta_t) <= 0 ) {
                schedule["sub-stage-timeout"] = -1;
                stageOperator("ontimeout");
            }
        }
        scheduleLastRefresh = timestamp;
    };
    var listeners = {
        onclick: function(ev) {
            var boundingRect = canvasAdjuster.getBoundingRect();
            if ( ev.clientX < boundingRect.left ||
                ev.clientX > boundingRect.right ||
                ev.clientY < boundingRect.top ||
                ev.clientY > boundingRect.bottom )
                    return;
            var coef = canvasAdjuster.getResCoef();
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
        canvasRefresher.insertObject(-1, conversationRoom);
        canvasRefresher.insertObject(0, hostPerson);
        canvasRefresher.insertObject(0, guestPerson);
        canvasRefresher.insertObject(1, hostWords);
        canvasRefresher.insertObject(1, positiveResponse);
        canvasRefresher.insertObject(1, negativeResponse);
        window.addEventListener("click", listeners.onclick);
        scheduleOperatorIID = setInterval(scheduleOperator, 125);
    })();
};