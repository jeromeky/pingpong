var Match     = require('../models/match');
var Ranking     = require('../models/ranking');

var RankingService	 = function () {

	/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */	
	var _recordRanking = function(namePlayer, hasWon, callback) {

		Ranking.findOne({player : namePlayer.toLowerCase()}, function(err, ranking) {
			if(err)
				return callback(err, false);

        	if(ranking == null || ranking.length == 0) {
		        var ranking = new Ranking();
		        ranking.player = namePlayer;

				ranking.numLost = 0;
		       	ranking.totalPoints = 0;
		       	ranking.numWin = 0;

		        if(hasWon) {
		        	ranking.numWin = 1;	
		        	ranking.totalPoints = 3;
		        } else {
		        	ranking.numLost = 1;
		        }
		        
		        ranking.save();
        	} else {

        		if(hasWon) {
        			ranking.numWin += 1;
        			ranking.totalPoints += 3;
        		} else {
        			ranking.numLost +=1;
        			if(ranking.totalPoints > 0) {
        				ranking.totalPoints -= 1;
        			}
        		}

        		ranking.save();
        	}

        	console.log('here finish;');
			return callback(null, true);

        });

	}

	return {
		recordRanking : _recordRanking,
	}
}();


module.exports = RankingService;