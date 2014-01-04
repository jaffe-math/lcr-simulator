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
		return (parseInt(Math.random() * 6, 0) + 1);
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
	this.initTable();
	this.display();
};

Game.prototype = {

	play: function () {
		_this = this;
		// this.maxPlayers = $('.playerCount').val();
		// this.initTable();
		// this.display();
		this.playerRoll(this.currentPlayer);
		do {
			this.currentPlayer = (this.currentPlayer === this.maxPlayers-1) ? 0 : this.currentPlayer+1;
		} while (this.players[this.currentPlayer].dollars.length === 0);
	},
	
	playerRoll: function (player) {
		_this = this;
		leftPlayer = (player === 0) ? this.maxPlayers-1 : player-1;
		rightPlayer = (player === this.maxPlayers-1) ? 0 : player+1;
		var rollArray = this.players[player].takeTurn(this.players[leftPlayer], this.players[rightPlayer], this.center);
		this.displayRoll(player, rollArray);
		setTimeout(function () {
			_this.display();
			var winner = _this.win(_this);
			if (winner.win) {
				alert ('Player '+winner.player+' has won!');
			} else {
				setTimeout(function () {_this.play();}, timeDelay());
			}
		}, timeDelay());
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
	},
	
	display: function () {
		$('[name="colors"] td').remove();
		$('#center td').remove();
		$.each(this.players, function (i, el) {
			dollarCell = $($('[name="colors"] tbody')[i]);
			$.each(el.dollars, function (j, dol) {
				dollarCell.append('<td><div class='+dollarDisplay+'>'+dol.description()+'</div></td>');
			});
		});
		$.each(this.center, function (i, el) {
			$('#center tbody').append('<td><div class='+dollarDisplay+'>'+el.description()+'</div></td>');			
		});
	},
	
	displayRoll: function (player, rollArray) {
		$('[name="roll"]').empty();
		$('[name="roll"]').parent().removeClass();
		$.each(rollArray, function(i, el) {
			$($('[name="roll"]')[player]).append('<span>&nbsp;'+el+'&nbsp;</span>');
			$($('[name="roll"]')[player]).parent().addClass('thisTurn');
		});
	},
	
	initTable: function () {
		var tbody = $('tbody');
		tbody.empty();
		$.each(this.players, function (i, el) {
			tbody.append('<tr><td>Player '+(i+1)+'</td><td name="roll">&nbsp;</td><td><table name="colors"><tbody></tbody></table></td></tr>');
		});
		tbody.append('<tr><td colspan="3"></td></tr><tr><td>Center</td><td>&nbsp;</td><td><table id="center"><tbody></tbody></table></td></tr>');
	}
	
};

var game = null;
var maxDice = 3;
var initialDollars = 3;
var maxPlayers = 12;
var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//var dollarDisplay = 'dollar';
var dollarDisplay = 'realDollar';

function timeDelay() {
	var td = parseInt($("#timeDelay").val()*1000, 0);
	if (isNaN(td)) {
		td = 1000;
	}
	return td;
}

$(document).ready(function () {
	game = new Game(maxDice, initialDollars, maxPlayers);
	$('#play').click(function () {
		game.play();
	});
	$('#reset').click(function () {
		game = new Game(maxDice, initialDollars, maxPlayers);
	});
});