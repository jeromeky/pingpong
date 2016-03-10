var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MatchSchema   = new Schema({
    player1: String,
    player2: String,
    score1: Number,
    score2: Number,
    date: Date
});

module.exports = mongoose.model('Match', MatchSchema);