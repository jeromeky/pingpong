var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RankingSchema   = new Schema({
    player: String,
    playerLower:String,
    numWin: Number,
    numDefeat: Number,
    pointsFor: Number,
    pointsAgainst: Number,
    pointsDifference: Number,
    elo: Number
});

RankingSchema.static('findByName', function(name, callback) {
	return this.find({player : name}, callback);
});

module.exports = mongoose.model('RankingV2', RankingSchema);