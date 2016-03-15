var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NewsSchema   = new Schema({
    reporter: String,
    message: String,
    date: Date
});

module.exports = mongoose.model('News', NewsSchema);