/*
The Rules
https://plentifun.com/rules-to-play-left-right-center-lcr-dice-game
*/

////////////////////////////////////
// global definitions:
////////////////////////////////////

let userTokens = 3; //all players begin game with three chips each
var centerTokens = 0;
var myPlayerID = null;
var myAvatarURL = "";
var currentWaitingPlayers = 0;
var gameStarted = false;
var connectedUsers = 0;

switch (Math.floor(Math.random() * 3)) {
	case 0:
		$("body").css("background", `darkslategray url(./assets/background_images/Oriental_Lizard-reduced.jpg) no-repeat top center/cover fixed`);
		break;
	case 1:
		$("body").css("background", `darkslategray url("./assets/background_images/sugarloaf_sunrise_reduced_cropped.jpg") no-repeat top center/cover fixed`);
		break;
	case 2:
		$("body").css("background", `darkslategray url("./assets/background_images/Gulls_on_Morro_Strand_State_Beach_reduced_cropped.jpg") no-repeat top center/cover fixed`);
		break;
		// no default case needed because we have a fallback in style.css for background color
}

////////////////////////////////////
// firebase functions:
////////////////////////////////////

/* global moment firebase */

// Initialize Firebase
// Make sure to match the configuration to the script version number in the HTML
// (Ex. 3.0 != 3.7.0)

var config = {
	apiKey: "AIzaSyBw0KSKijEdaesz-Unx7jMrhHqw4SBYHU4",
	authDomain: "lcr-game.firebaseapp.com",
	databaseURL: "https://lcr-game.firebaseio.com",
	projectId: "lcr-game",
	storageBucket: "lcr-game.appspot.com",
	messagingSenderId: "797678842345"
};

firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function (snap) {

	// If they are connected..
	if (snap.val()) {
		
		if (!myAvatarURL) {
			myAvatarURL = generateRandomAvatar();
			$("#avatar").html(`<img src=${myAvatarURL} alt="player avatar" height="25%" width="25%">`);
		}

		// Add user to the connections list.
		var con = connectionsRef.push({
			"waiting": false,
			"matched": false,
			"myAvatarURL": myAvatarURL,
			"userTokens": userTokens
		});
		
		// Remove user from the connection list when they disconnect.
		con.onDisconnect().remove(); // update waiting players or matched players
	}
	window.con = con;
});

var connectionsUpdateFunc = function (snap) {
		
	function countCurrentlyWaiting() {
		
		if (!gameStarted) {
			var waiting = 0;
			for (var x = 0; x < playerArray.length; x++) {
				if (connections[playerArray[x]].waiting) waiting++;
			}
		}
		else if (gameStarted) $("#currently-joined").html("<em>game in progress</em>");
			
			currentWaitingPlayers = waiting;
			console.log("currentWaitingPlayers: " + currentWaitingPlayers);
			return waiting;
		//if the updated child's waiting value updated, count all children's waiting = true
		//update currentWaitingPlayers
		//return currentWaitingPlayers
	}
	
	// Display the viewer count in the html.
	// The number of online users is the number of children in the connections list.
	var numChildren = snap.numChildren();
	window.playerArray = Object.keys(snap.val());
	window.connections = snap.val();
	if (connectedUsers != numChildren) {
		$("#connected-viewers").text(numChildren + " player(s) connected.");
		if (connectedUsers < numChildren) {
			console.log(countCurrentlyWaiting());
		}
		if (connectedUsers < numChildren) {
			
		}
	}
		connectedUsers = numChildren;

	
	
	if (!myPlayerID) myPlayerID = playerArray[playerArray.length - 1];
	
	$("#center-chips").text(centerTokens);
	$("#chip-total").text(userTokens);
	playerArray.indexOf(myPlayerID);

	$("#player-number").text(playerArray.indexOf(myPlayerID)+1); // ultimately, we don't want to display this number on the screen, because if someone leaves or becomes disconnected during a game, a player's player-number can change on the fly
	// we want to identify player's via their avataaar
}
// When first loaded or when the connections list changes...
var childUpdateFunc = function (snap) {
	
	if (myPlayerID) {
		if (myPlayerID === snap.key) {
			userTokens = snap.val().userTokens;
			$("#chiptotal").text(userTokens);
		}
	}
	
	if (!gameStarted && connectedUsers > 0) $("#currently-joined").text(currentWaitingPlayers + " players currently joined and waiting to begin.");
	else if (currentWaitingPlayers === 0) $("#currently-joined").text("There are zero players currently joined."); 
	
}

var childAddedFunc = function(snapshot, prevChildKey) {
	console.log(snapshot.val().key);
}	
connectionsRef.on("value", connectionsUpdateFunc);
connectionsRef.on("child_changed", childUpdateFunc);
connectionsRef.on("child_added", childAddedFunc);
var selfValueListener = function(snap) {
	if ($("#join-game").attr("disabled") && !gameStarted) {
		if (!gameStarted && connectedUsers > 0) $("#currently-joined").text(currentWaitingPlayers + " players currently joined and waiting to begin.");
		else if (currentWaitingPlayers === 0) $("#currently-joined").text("There are zero players currently joined.");
	}
} ;
connectionsRef.con.on("child_changed", selfValueListener);


$("#game-status").html('<em><strong>game_agent</strong></em>&emsp;Click "Join Game" to enter waiting pool.');
// $("#game-status").html('Click "Start or Join Game" to begin!');

////////////////////////////////////
// chat feature:
////////////////////////////////////

var chatHistory = [];
var chatRowLimit = 10;
var newUserComment = {
	commentator: "",
	comment: ""
}

// --------------------------------------------------------------
// At the page load and subsequent value changes, get a snapshot of the local data.
// This function allows you to update your page in real-time when the values within the firebase node chatData changes

database.ref("/chatData").on("value", function (snapshot) {
	if (snapshot.child("newComment").exists()) {
		newUserComment = snapshot.val().newComment;
		if (chatHistory[chatHistory.length - 1] !== snapshot.val().newComment)
			if (chatHistory.length > chatRowLimit) chatHistory = chatHistory.slice(1); //we only want a max of 16 comments after the push
	} else newUserComment = {};

	for (; chatHistory.length < chatRowLimit; chatHistory.push({})) {};
	chatHistory.push(newUserComment);
	$("#chat-history").html(chatHistory.map(showHistory));

	// If any errors are experienced, log them to console.
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});

function showHistory(commentObj) {
	if (typeof commentObj["commentator"] !== "undefined") return `<div class="row"><div class="col-auto mr-auto" style="text-align:left;"><strong>${commentObj["commentator"]}</strong></div><div class="col">${commentObj["comment"]}</div></div>`;
	else return `<div class="row"><div class="col" style="min-height:1.5em"></div></div>`;
}

////////////////////////////////////
// game functions:
////////////////////////////////////

//This function rolls a single dice and returns the value of that dice
function rollDie() {
	let possibleDieValues = ["L", "R", "C", "snake_eye", "snake_eye", "snake_eye"];
	let rand = possibleDieValues[Math.floor(Math.random() * possibleDieValues.length)];
	return rand;
}

//this function takes care of the players dice roll depending on the amount of tokens they have
//if the player has 4 tokens then the function will return an array of 4 dice/values
function playerRoll(dice) {
	let rollResults = [];

	for (var i = 0; i < dice; i++) {
		rollResults.push(rollDie());
	}
	return rollResults;
}

function renderDice(rollResultsArray) {

	
	var leftPlayer; 
	if (playerArray.indexOf(myPlayerID) === 0) leftPlayer = playerArray.length - 1;
	else leftPlayer = playerArray.indexOf(myPlayerID) - 1;

	var rightPlayer;
	if (playerArray.indexOf(myPlayerID) === playerArray.length - 1) rightPlayer = 0;
	else rightPlayer = playerArray.indexOf(myPlayerID) + 1;

	for (var i = 0; i < rollResultsArray.length; i++) {
		//Do nothing, player loses no chips 
		if (rollResultsArray[i] === "snake_eye") {
			$("#dice-images").append('<img class="diceimage" src="assets/images/dot.png" />');
		}
		//pass chip to right of player, player loses a chip
		if (rollResultsArray[i] === "R") {
			$("#dice-images").append('<img class="diceimage" src="assets/images/r.png" />');
			userTokens--;
			con.update({userTokens: userTokens});
			connections[playerArray[rightPlayer]].userTokens++;
			connectionsRef.child(playerArray[rightPlayer]).update({
				userTokens: connections[playerArray[rightPlayer]].userTokens
			});
		}
		//pass chip to left, player loses a chip
		if (rollResultsArray[i] === "L") {
			$("#dice-images").append('<img class="diceimage" src="assets/images/l.png" />');
			userTokens--;
			con.update({userTokens: userTokens});
			connections[playerArray[leftPlayer]].userTokens++;
			connectionsRef.child(playerArray[leftPlayer]).update({
				userTokens: connections[playerArray[leftPlayer]].userTokens
			});
		}
		//pass chip to the center pile, chip is out of circulation now , player loses a chip
		if (rollResultsArray[i] === "C") {
			$("#dice-images").append('<img class="diceimage" src="assets/images/c.png" />');
			userTokens--;
			con.update({userTokens: userTokens});
		}
	}
}

////////////////////////////////////
// click listener functions:
////////////////////////////////////

//CHAT button listeners:

// Whenever a user clicks the submit button
$("#submit-comment").on("click", function (event) {
	event.preventDefault();
	// Get the input values
	var commenterName = $("#commenter-name").val().trim();
	var newUserComment = $("#new-comment").val().trim();
	if (newUserComment && commenterName) {
		database.ref("/chatData").set({
			newComment: {
				commentator: commenterName,
				comment: newUserComment
			},
		});
	}
	$("#new-comment").val("");
});

// Whenever a user clicks the clear chat button
$("#clear-comments").on("click", function (event) {

	event.preventDefault();
	chatHistory = [];
	database.ref("/chatData").set({});

	for (; chatHistory.length < chatRowLimit; chatHistory.push({})) {};
	$("#chat-history").html(chatHistory.map(showHistory));
});

//GAME button listeners:

// Whenever a user clicks the roll dice button
$("#roll-dice").on("click", function (event) {
	event.preventDefault(); //is this necessary for all buttons or only for "input" type buttons?
	$("#dice-images").html("");
	renderDice(playerRoll(userTokens));
});

function activateGameButton(selector) {
	$(selector).addClass("btn-primary").removeClass("btn-secondary");
	$(selector).attr("disabled", false);
	if (selector.includes("start")) $("#start-game").html("Start Game");
	else if (selector.includes("join")) $(selector).html("Join Game");
}

function deactivateGameButton (selector) {
	$(selector).addClass("btn-secondary").removeClass("btn-primary");
	$(selector).attr("disabled","disabled");
	if (selector.includes("join")) $(selector).html("<i>Join Game</i>");
	else if (selector.includes("start")) $(selector).html("<i>Start Game</i>");
}

// Whenever a user clicks the join-game button
$("#join-game").on("click", function (event) {
	// event.preventDefault(); // commenting this out didn't seem to cause any issues for this "submit" type button
	
	//if waiting = false, then deactive join game button but don't activate start game button until at least three players are waiting (maybe cause start button to become visible if it begins invisible
	// also, change waiting to true, and set matched to false and push to firebase
	if (!connections[myPlayerID].waiting) {
		con.update({"waiting": true, "matched":false});
		
		deactivateGameButton("#join-game");
		//activateGameButton("#start-game");
		
		
		$("#game-status").html('<em><strong>game_agent</strong></em>&emsp;Waiting to start game....');
		//childUpdateFunc();
	}
	
});

// Whenever a user clicks the start-game button
$("#start-game").on("click", function (event) {
	event.preventDefault();
});