var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RankingSchema   = new Schema({
    player: String,
    numWin: Number,
    numLost: Number,
    totalPoints: Number
});

RankingSchema.static('findByName', function(name, callback) {
	return this.find({player : name}, callback);
});

module.exports = mongoose.model('Ranking', RankingSchema);