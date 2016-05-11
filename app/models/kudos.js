var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var KudosSchema   = new Schema({
    reporter: String,
    reporterId:String,
    nominate: String,
    value:String,
    message: String,
    date: Date
});

module.exports = mongoose.model('Kudos', KudosSchema);