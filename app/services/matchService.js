var Match     = require('../models/match');
var Ranking     = require('../models/ranking');
var RankingService = require('./rankingService');

var MatchService	 = function () {

	/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	var _recordNewMatch = function(match, callback) {

		// save the match and check for errors
        match.save(function(err) {
            if (err)
            	return callback(err, false);

            if(match.score1 > match.score2) {
            	var wonPlayer = match.player1;
            	var lostPlayer = match.player2;
            } else {
            	var wonPlayer = match.player2;
            	var lostPlayer = match.player1;
            }

            RankingService.recordRanking(wonPlayer, true, function(err, success) {
            	console.log('record ranking success');
            	console.log(success);
            	if(success) {
            		RankingService.recordRanking(lostPlayer, false, function(err, success) {
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
		console.log('getHistory');

		Match.find({}).sort({date:-1}).limit(10).execFind(function(err, matches) {
            // var deferred = $q.defer();
            // deferred.resolve(currentNewRequests);
            // return deferred.promise;

            if (err)
                res.send(err);

            return callback(null, matches);

        });

	}

	return {
		recordNewMatch : _recordNewMatch,
		getHistory : _getHistory,
	}
}();


module.exports = MatchService;