
var eps = 10*Number.EPSILON;

var questionImages= [];
var questions;
var alterLabels = [];
var taskAnswers = [];
var alternatives = [];
var altBlocks;
var nextButtons = [];
var applyButtons = [];
var buttonBlocks;
var rightAnswer = [];
var stats = [];
var statBlocks;
var statistics = { rightAnswers: 0, allAnswers: 0 };
var prevRightAnswers = [];
var prevGivenAnswers = [];

function GetDBIndex( mainname ) {
	for ( var i=0; i<db.length; i++ ) 
		if ( db[i].mainname == mainname ) return i;
	return -1;
}

function getReshuffledIdx( arrlen ) {
	var rshIdx = []; var psbIdx = [];
	for ( var i=0; i<arrlen; i++ ) psbIdx.push(i);
	for ( var i=0; i<arrlen; i++ ) {
		var newIdx = Math.floor(Math.random() * psbIdx.length);
		rshIdx.push(psbIdx[newIdx]);
		psbIdx.splice(newIdx, 1);
	}
	return rshIdx;
}

function checkAnswer(buttonNum, event) {
	var alterChoosen = -1;
	for ( var i in taskAnswers[buttonNum] ) {
		if ( !(taskAnswers[buttonNum][i] instanceof Element) ) continue;
		if ( taskAnswers[buttonNum][i].checked ) {
			alterChoosen = taskAnswers[buttonNum][i].value-1;
			break;
		}
	}
	if ( alterChoosen < 0 ) { if ( event ) event.preventDefault(); return false; }
	statistics.allAnswers++;
	if ( alterChoosen == rightAnswer[buttonNum] ) {
		statistics.rightAnswers++;
		alternatives[buttonNum][alterChoosen].className = "alternatives_result alternatives_right";
	} else {
		alternatives[buttonNum][alterChoosen].className = "alternatives_result alternatives_wrong";
		alternatives[buttonNum][rightAnswer[buttonNum]].className = "alternatives_result alternatives_right";
	}
	for ( var i in alternatives[buttonNum] ) {
		if ( i != alterChoosen && i != rightAnswer[buttonNum] ) {
			alternatives[buttonNum][i].className = "alternatives_result alternatives_other";
		}
	}
	stats[buttonNum].textContent = "Right answers: " + statistics.rightAnswers.toString() + " of " + statistics.allAnswers.toString();
	applyButtons[buttonNum]["hidden"] = true;
	nextButtons[buttonNum]["hidden"] = false;
	for ( var i in taskAnswers[buttonNum] ) {
		if ( !(taskAnswers[buttonNum][i] instanceof Element) ) continue;
		taskAnswers[buttonNum][i]["hidden"] = true;
	}
	
	if ( event ) {
		event.preventDefault();
		return false;
	}
	
}

function nextTask(buttonNum) {
	for ( var i in alternatives[buttonNum] ) {
		if ( !(alternatives[buttonNum][i] instanceof Element) ) continue;
		alternatives[buttonNum][i].className = "alternatives alternatives_other";
	}
	for ( var i in taskAnswers[buttonNum] ) {
		if ( !(taskAnswers[buttonNum][i] instanceof Element) ) continue;
		taskAnswers[buttonNum][i].checked = false;
		taskAnswers[buttonNum][i]["hidden"] = false;
	}
	
	var i=0;
	var rightAnswerDBIdx;
	do {
		rightAnswerDBIdx = Math.floor(db.length*Math.random());
	} while ( prevRightAnswers.indexOf(rightAnswerDBIdx) > -1 + eps || ++i < 64 );
	
	var alters = [ rightAnswerDBIdx ];
	if ( db[rightAnswerDBIdx].hasOwnProperty("challenge") && db[rightAnswerDBIdx].challenge.length>0 ) {
		var challengeNum = db[rightAnswerDBIdx].challenge.length;
		var rshIdx = getReshuffledIdx(challengeNum);
		for ( var i=0; i<challengeNum && alters.length<altLim; i++ ) {
			var challengeDBIdx = GetDBIndex( db[rightAnswerDBIdx].challenge[rshIdx[i]] );
			if ( challengeDBIdx < 0 ) continue;
			if ( Math.random() < Math.pow(challengePsb, alters.length) )
				alters.push(challengeDBIdx);
		}
	}
	i=0;
	while ( alters.length < altLim && ++i<2048 ) {
		var currAlter = Math.floor(db.length*Math.random());
		if ( alters.indexOf(currAlter) < 0 ) alters.push(currAlter);
	}
	var rshIdx = getReshuffledIdx(alters.length);
	rightAnswer[buttonNum] = rshIdx.indexOf(0);
	questionImages[buttonNum].src = "flags/"+db[alters[0]].mainname+".png";
	for ( var i in alterLabels[buttonNum] ) {
		if ( !(alterLabels[buttonNum][i] instanceof Element) || rshIdx.length <= i + eps ) continue;
		alterLabels[buttonNum][i].textContent = db[alters[rshIdx[i]]].mainname.replace(/_/g, " ");
	}
	if ( prevRightAnswers.length >= prevRightAnswersLim - eps )
		prevRightAnswers.shift();
	prevRightAnswers.push(alters[0]);
	
	nextButtons[buttonNum]["hidden"] = true;
	applyButtons[buttonNum]["hidden"] = false;
}

window.onload = function() {
	questions = document.querySelectorAll(".questions");
	for ( var i in questions ) {
		if ( !(questions[i] instanceof Element) ) continue;
		questionImages[i] = questions[i].querySelector("#question_image_"+(+i+1));
	}
	altBlocks = document.querySelectorAll(".alt_blocks");
	for ( var i in altBlocks ) {
		if ( !(altBlocks[i] instanceof Element) ) continue;
		alterLabels[i] = [];
		taskAnswers[i] = [];
		alternatives[i] = altBlocks[i].querySelectorAll(".alternatives.alternatives_other");
		for ( var j in alternatives[i] ) {
			if ( !(alternatives[i][j] instanceof Element) ) continue;
			taskAnswers[i][j] = alternatives[i][j].querySelector("[name='task_answer_"+(+i+1)+"']");
			alterLabels[i][j] = alternatives[i][j].querySelector("label");
		}
	}
	buttonBlocks = document.querySelectorAll(".button_blocks");
	for ( var i in buttonBlocks ) {
		if ( !(buttonBlocks[i] instanceof Element) ) continue;
		applyButtons[i] = buttonBlocks[i].querySelector("input[name='answer_"+(+i+1)+"']");
		applyButtons[i].onclick = (function(i) { var j=i; return function(event) { checkAnswer(j, event); }; })(i); 
		nextButtons[i] = buttonBlocks[i].querySelector("input[name='next_"+(+i+1)+"']");
		nextButtons[i].onclick = (function(i) { var j=i; return function() { nextTask(j); }; })(i);
		setTimeout( nextTask, 100, i );
	}
	statBlocks = document.querySelectorAll(".stat_blocks");
	for ( var i in statBlocks ) {
		if ( !(statBlocks[i] instanceof Element) ) continue;
		stats[i] = statBlocks[i].querySelector(".stats");
	}
};
