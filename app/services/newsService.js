var News     = require('../models/news');
var util = require('util');
var utf8 = require('utf8');

var NewsService	 = function () {

	/**
	 * Find driver with a given ID
	 * @param  {[type]}   driverId [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	var _insertNews = function(news, callback) {

		news.message = utf8.encode(news.message);
		// save the match and check for errors
        news.save(function(err) {
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
	var _getNews = function(callback) {
		News.find({}).sort({date:-1}).limit(10).execFind(function(err, news) {

            if (err)
                res.send(err);

            return callback(null, news);

        });

	}

	return {
		insertNews : _insertNews,
		getNews : _getNews,
	}
}();


module.exports = NewsService;