var Match     = require('../models/match');
var Ranking     = require('../models/rankingv2');
var RankingService = require('./rankingService');
var util = require('util');
var async = require('async');
var elo = require('elo-rank')(15);

var MatchService	 = function () {

	/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	var _recordNewMatch = function(match, callback) {

		if(match.score1 == match.score2) {
			return callback('Tie is not possible in ping pong !');
		}

		// save the match and check for errors
        match.save(function(err) {
            if (err)
            	return callback(err, false);

            var locals = {};

            async.parallel([
            	//Load player1 elo
            	function(callback) {
            		RankingService.getPlayerElo(match.player1, function(err, elo) {
            			locals.player1 = elo;
            			callback();
            		});
            		
            	},

            	//Load player2 elo
            	function(callback) {
            		RankingService.getPlayerElo(match.player2, function(err, elo) {
            			locals.player2 = elo;
            			callback();
            		});
            		
            	},
            	

            	], function(err) {

            		if (err) return next(err);


            		var expectedScore1 = elo.getExpected(locals.player1, locals.player2);
					var expectedScore2 = elo.getExpected(locals.player2, locals.player1);


					elo1 = elo.updateRating(expectedScore1, match.score1 > match.score2, locals.player1);
					elo2 = elo.updateRating(expectedScore2, match.score2 > match.score1, locals.player2);

		            RankingService.recordRankingWithElo(match.player1, match.score1, match.score2, match.score1 > match.score2, elo1);
		            RankingService.recordRankingWithElo(match.player2, match.score2, match.score2, match.score2 > match.score1, elo2);
		            return callback(null, true);

            	});
            
        });

	}

		/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	var _getHistory = function(callback) {
		Match.find({}).sort({date:-1}).limit(10).execFind(function(err, matches) {
            // var deferred = $q.defer();
            // deferred.resolve(currentNewRequests);
            // return deferred.promise;

            if (err)
                res.send(err);

            return callback(null, matches);

        });

	}

	var _cancelLastMatch = function(callback) {
		//Find the last match
		//

		Match.findOne({}, {}, {sort: {'date' : -1}}, function(err, match) {
            
            if (err)
            	return callback(err);

            if (!match) {
            	return callback('nothing to cancel');
            }

            //Only remove last match if it was recorded in the last 10 minutes.
            var tenMinAgo = new Date();

			tenMinAgo.setMinutes(tenMinAgo.getMinutes() - 105);


			if(match.date > tenMinAgo) {
				message = util.format('%s : <b>%s</b> %s - %s <b> %s </b> was removed', match.date.toLocaleDateString(), match.player1, match.score1, match.score2, match.player2);
				

				RankingService.updateRanking(match.player1, match.score1 > match.score2, match.score1, match.score2);
				RankingService.updateRanking(match.player2, match.score2 > match.score1, match.score2, match.score1);

				match.remove();

				return callback(null, message);
			} else {
				return callback('Only matches in the last 10 minutes can be cancelled');
			}

            return callback(null, match);

        });

	}


	var _cancelWithId = function(id, callback) {
		//Find the last match
		//

		Match.findById(id, function(err, match) {
            
            if (err)
            	return callback(err);

            if (!match) {
            	return callback('nothing to cancel');
            }

			RankingService.updateRanking(match.player1, match.score1 > match.score2, match.score1, match.score2);
			RankingService.updateRanking(match.player2, match.score2 > match.score1, match.score2, match.score1);

			message = util.format('%s : <b>%s</b> %s - %s <b> %s </b> was removed', match.date.toLocaleDateString(), match.player1, match.score1, match.score2, match.player2);

			match.remove();

            return callback(null, message);

        });

	}

	return {
		recordNewMatch : _recordNewMatch,
		getHistory : _getHistory,
		cancelLastMatch : _cancelLastMatch,
		cancelWithId : _cancelWithId,
	}
}();


module.exports = MatchService;