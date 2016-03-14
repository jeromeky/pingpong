var Match     = require('../models/match');
var Ranking     = require('../models/ranking');
var RankingService = require('./rankingService');
var util = require('util');

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

            RankingService.recordRanking(match.player1, match.score1, match.score2, match.score1 > match.score2, function(err, success) {
            	if(success) {
            		RankingService.recordRanking(match.player2, match.score2, match.score1, match.score2 > match.score1, function(err, success) {
            			if(success) {
            				return callback(null, true);
            			}
            		});
            	}
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
		console.log('cancel last match');

		Match.findOne({}, {}, {sort: {'date' : -1}}, function(err, match) {
            
console.log(match);

            if (err)
            	return callback(err);

            if (!match) {
            	return callback('nothing to cancel');
            }

            //Only remove last match if it was recorded in the last 10 minutes.
            var tenMinAgo = new Date();

            console.log('now : ' + tenMinAgo);
			tenMinAgo.setMinutes(tenMinAgo.getMinutes() - 105);

			console.log('ten min ago : ' + tenMinAgo);

			if(match.date > tenMinAgo) {
				message = util.format('%s : <b>%s</b> %s - %s <b> %s </b> was removed', match.date.toLocaleDateString(), match.player1, match.score1, match.score2, match.player2);
				

				RankingService.updateRanking(match.player1, match.score1 > match.score2, match.score1, match.score2);
				RankingService.updateRanking(match.player2, match.score2 > match.score1, match.score2, match.score1);

				match.remove();

				return callback(null, message);
			} else {
				console.log('or not');
				return callback('Only matches in the last 10 minutes can be cancelled');
			}

            return callback(null, match);

        });

	}

	return {
		recordNewMatch : _recordNewMatch,
		getHistory : _getHistory,
		cancelLastMatch : _cancelLastMatch,
	}
}();


module.exports = MatchService;