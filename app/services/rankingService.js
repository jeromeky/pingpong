var Match     = require('../models/match');
var Ranking     = require('../models/ranking');

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

	return {
		recordRanking : _recordRanking,
		updateRanking : _updateRanking,
	}
}();


module.exports = RankingService;