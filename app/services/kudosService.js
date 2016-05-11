var Kudos     = require('../models/kudos');
var util = require('util');
var utf8 = require('utf8');

var KudosService	 = function () {

	/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	var _insertKudos = function(kudos, callback) {

		kudos.message = utf8.encode(kudos.message);
		
		// 
		// TODO CHECK IF THIS REPORTER CAN GIVE POINT OR NOT
        kudos.save(function(err) {
            if (err)
            	return callback(err, false);

           return callback(null, true);
            
        });

	}

		/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	var _getKudos = function(callback) {
		Kudos.find({}).sort({date:-1}).limit(1000).execFind(function(err, kudos) {

            if (err)
                res.send(err);

            return callback(null, kudos);

        });

	}

	return {
		insertKudos : _insertKudos,
		getKudos : _getKudos,
	}
}();


module.exports = KudosService;