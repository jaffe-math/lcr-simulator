var Dollar = function (startingPlayerId, startingPosition) {
	this.startingPlayerId = startingPlayerId;
	this.startingPosition = startingPosition;
};

Dollar.prototype = {
	description: function() {
		return (this.startingPlayerId+1)+letters.substr(this.startingPosition-1, 1);
	}
};

var Player = function (playerId, initialDollars, maxDice) {
	var _this = this;
	this.playerId = playerId;
	this.maxDice = maxDice;
	this.dollars = [];
	for (var i = 0; i < initialDollars; i++) {
		this.dollars.push(new Dollar(this.playerId, i+1));
	}
}; 

Player.prototype = {
	rollDice: function() {
		var d = parseInt(Math.random() * 6, 0) + 1;
		dice[d-1]++;
		return d;
	},
	
	map: function(roll) {
		var returnValue = '';
		switch (roll) {
			case 1:
			case 2:
			case 3:
				returnValue = 0;
				break;
			case 4:
				returnValue = -1;
				break;
			case 5:
				returnValue = 1;
				break;
			case 6:
				returnValue = 'C';
				break;
			default:
				returnValue = '';
				break;
		}
		return returnValue;
	},
	
	rollCharacter: function(roll) {
		var character;
		switch (roll) {
			case 0:
				character = 'o';
				break;
			case 1:
				character = 'R';
				break;
			case -1:
				character = 'L';
				break;
			case 'C':
				character = 'C';
				break;
			default:
				character = '';
				break;
		}
		return character;
	},
	
	takeTurn: function(leftPlayer, rightPlayer, center) {
		var rollCount = Math.min(this.dollars.length, 3);
		var rollArray = [];
		for (var i = rollCount-1; i >= 0; i--) {
			var roll = this.map(this.rollDice());
			rollArray.push(this.rollCharacter(roll));
			var aDollar = this.dollars[i];
			switch (roll) {
				case -1:
					this.dollars.splice(i, 1);
					leftPlayer.dollars.push(aDollar);
					break;
				case 1:
					this.dollars.splice(i, 1);
					rightPlayer.dollars.push(aDollar);
					break;
				case 'C':
					this.dollars.splice(i, 1);
					center.push(aDollar);
					break;
				default:
					break;
			}
		}
		return rollArray;
	},
	
	haveMoney: function () {
		return this.dollars.length !== 0;
	}
};

var Game = function (maxDice, initialDollars, maxPlayers) {
	this.maxDice = maxDice;
	this.initialDollars = initialDollars;
	this.maxPlayers = maxPlayers;
	this.players = [];
	this.center = [];
	this.currentPlayer = 0;
	this.winnerCount = [];
	for (var i = 0; i < this.maxPlayers; i++) {
		this.players.push(new Player(i, this.initialDollars, this.maxDice));
	}
};

Game.prototype = {

	play: function () {
		_this = this;
		winner = this.playerRoll(this.currentPlayer);
		if (winner.win) {
			return;
		} else {
			do {
				this.currentPlayer = (this.currentPlayer === this.maxPlayers-1) ? 0 : this.currentPlayer+1;
			} while (this.players[this.currentPlayer].dollars.length === 0);
			this.play();
		}
	},
	
	playerRoll: function (player) {
		leftPlayer = (player === 0) ? this.maxPlayers-1 : player-1;
		rightPlayer = (player === this.maxPlayers-1) ? 0 : player+1;
		var rollArray = this.players[player].takeTurn(this.players[leftPlayer], this.players[rightPlayer], this.center);
		var winner = _this.win(_this);
		if (winner.win) {
			winnerCount[winner.player-1]++;
		}
		return winner;
	},
	
	win: function (game) {
		var count = 0;
		var winner = -1;
		$.each(game.players, function (i, el) {
			if (el.haveMoney()) {
				count++;
				winner = i+1;
			}
		});
		if (count !== 1) {
			return {win: false, player: winner};
		} else {
			return {win: true, player: winner};
		}
	}
	
};

var game = null;
var completed = false;
var count = 0;
var maxCount = 10000;
var maxTrial = 1000;
var maxDice = 3;
var initialDollars = 3;
var winnerCount = [];
var dice = [];
var winningPlayerDistribution = [];
var maxPlayers = 11;
var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function display() {
	var maxWinnerCount = 0;
	var expect = maxCount / maxPlayers;
	$.each(winnerCount, function (i, el) {
		maxWinnerCount = Math.max(maxWinnerCount, Math.abs(winnerCount[i]-expect));
	});
	$.each(this.winnerCount, function (i, el) {
		var thisClass = (maxWinnerCount === Math.abs(winnerCount[i]-expect)) ? 'max' : '';
		if (thisClass === 'max') {
			winningPlayerDistribution[i]++;
		}
		// $($('[name="roll"]')[i]).html(winnerCount[i]);
		// $($('[name="roll"]')[i]).parent().addClass(thisClass);
	});
	$.each(dice, function (i, el) {
		// $($('[name="dice"]')[i]).html(dice[i]);
	});
}

function displayDistribution() {
	$.each(winningPlayerDistribution, function (i, el) {
		$($('[name="roll"]')[i]).html(el);
	});
}

function initTable () {
	var tbody = $('tbody');
	tbody.empty();
	for (var i=0; i<maxPlayers; i++) {
		tbody.append('<tr><td>Player '+(i+1)+'</td><td name="dice">&nbsp;</td><td name="roll">&nbsp;</td><td name="chi2">&nbsp;</td></tr>');
	}
}

function initResults () {
	for (var i=0; i<maxPlayers; i++) {
		winnerCount[i] = 0;
		winningPlayerDistribution[i] = 0;
	}
	for (var j=0; j<6; j++) {
		dice[j] = 0;
	}	
}

function simulateTrials() {
	initResults();
	initTable();
	trial = 0;
	while (trial < maxTrial) {
		count = 0;
		while (count < maxCount) {
			game = new Game(maxDice, initialDollars, maxPlayers);
			game.play();
			count++;
		}
		display();
		trial++;
	}
	displayDistribution();
}

$(document).ready(function () {
	$('#play').click(simulateTrials);
});