var Match     = require('../models/match');
var Ranking     = require('../models/rankingv2');

var elo = require('elo-rank');

var DEFAULT_ELO = 1000;

var RankingService	 = function () {

	/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */	
	var _recordRanking = function(namePlayer, pointsFor, pointsAgainst, hasWon, callback) {

		Ranking.findOne({playerLower : namePlayer.toLowerCase()}, function(err, ranking) {
			if(err)
				return callback(err, false);

        	if(ranking == null || ranking.length == 0) {
		        var ranking = new Ranking();
		        ranking.player = namePlayer;
		        ranking.playerLower = namePlayer.toLowerCase();

				ranking.numDefeat = 0;
		       	ranking.totalPoints = 0;
		       	ranking.numWin = 0;

	        	ranking.pointsFor = pointsFor;
	        	ranking.pointsAgainst = pointsAgainst;
	        	ranking.pointsDifference = pointsFor - pointsAgainst;

		        if(hasWon) {
		        	ranking.numWin = 1;	
		        	ranking.totalPoints = 3;
		        } else {
		        	ranking.numDefeat = 1;
		        }
		        
		        ranking.save();
        	} else {

	        	ranking.pointsFor += pointsFor;
	        	ranking.pointsAgainst += pointsAgainst;
	        	ranking.pointsDifference += pointsFor - pointsAgainst;

        		if(hasWon) {
        			ranking.numWin += 1;
        			ranking.totalPoints += 3;
        		} else {
        			ranking.numDefeat +=1;
        			if(ranking.totalPoints > 0) {
        				ranking.totalPoints -= 1;
        			}
        		}

        		ranking.save();
        	}

			return callback(null, true);

        });

	}

	var _recordRankingWithElo = function(namePlayer, pointsFor, pointsAgainst, hasWon, elo) {

		Ranking.findOne({playerLower : namePlayer.toLowerCase()}, function(err, ranking) {
			if(err)
				return;

        	if(ranking == null || ranking.length == 0) {
		        var ranking = new Ranking();
		        ranking.player = namePlayer;
		        ranking.playerLower = namePlayer.toLowerCase();

				ranking.numDefeat = 0;
		       	ranking.elo = elo;
		       	ranking.numWin = 0;

	        	ranking.pointsFor = pointsFor;
	        	ranking.pointsAgainst = pointsAgainst;
	        	ranking.pointsDifference = pointsFor - pointsAgainst;

		        if(hasWon) {
		        	ranking.numWin = 1;	
		        } else {
		        	ranking.numDefeat = 1;
		        }
		        
		        ranking.save();
        	} else {

	        	ranking.pointsFor += pointsFor;
	        	ranking.pointsAgainst += pointsAgainst;
	        	ranking.pointsDifference += pointsFor - pointsAgainst;
	        	ranking.elo = elo;

        		if(hasWon) {
        			ranking.numWin += 1;
        		} else {
        			ranking.numDefeat +=1;
        		}

        		ranking.save();
        	}

        });

	}


	var _updateRanking = function(player, hasWon, pointsFor, pointsAgainst) {
		Ranking.findOne({player : player}, function(err, ranking) {
			if(err)
				return;

			if(!ranking)
				return;

			if(hasWon) {
				ranking.numWin--;
				ranking.totalPoints -= 3;
			} else {
				ranking.numDefeat--;
				ranking.totalPoints -= 1;
			}

			ranking.pointsFor -= pointsFor;
			ranking.pointsAgainst -= pointsAgainst;
			ranking.pointsDifference -= pointsFor - pointsAgainst;



			if(ranking.totalPoints < 0) {
				ranking.totalPoints = 0;
			}
			ranking.save();
		});
	}

	var _getPlayerElo = function (playerName, callback) {
		Ranking.findOne({playerLower : playerName.toLowerCase()}, function(err, ranking) {
			if(err) {
				return callback(null, DEFAULT_ELO);
			}

			if(!ranking) {
				return callback(null, DEFAULT_ELO);
			}

			return callback(null, ranking.elo);
		});
	}

	return {
		recordRanking : _recordRanking,
		updateRanking : _updateRanking,
		getPlayerElo : _getPlayerElo,
		recordRankingWithElo : _recordRankingWithElo,
	}
}();


module.exports = RankingService;