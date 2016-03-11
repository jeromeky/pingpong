// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var util = require('util');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/pingpong');


var Match     = require('./app/models/match');
var Ranking     = require('./app/models/ranking');

var MatchService = require('./app/services/matchService');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.route('/')

    .post(function(req, res) {
        
    	console.log(req.body);

    	var message = req.body.item.message.message;

    	//Action will depends on received message
    	//Possible actions are : 
    	// - add 
    	// - help
    	// - top10
    	// - history
    	// 

		var code = message.split(' ');

		switch(code[1]) {
			case 'add' :


				var match = new Match();      // create a new instance of the Bear model
		        match.player1 = req.body.name;  // set the bears name (comes from the request)
		        console.log(req.body.item.message.message);

		        var score = req.body.item.message.message;
		        score = score.split(' ');


		        match.player1 = score[2].replace("@", "");
		        match.player2 = score[5].replace("@", "");
		        match.score1 = score[3];
		        match.score2 = score[4];
		        match.date = new Date();

				MatchService.recordNewMatch(match, function(err, success) {
					console.log('success is :' + success);
					console.log(success);
					if(success) {
						res.json({ message: 'match created!' });
					}
				});


				break;
			case 'help' :
				message = "Commands available are : ";
				message += "<ul>"+
								"<li>"+
									"/pingpong add @Tony 11 5 @John : Will add a new match."+
								"</li>"+
								"<li>"+
									"/pingpong top10 : Will show top 10 players"+
								"</li>"+
								"<li>"+
									"/pingpong history : Will show last 10 matches"+
								"</li>"+
							"</ul>";
				res.json({message_format : 'html', message : message});

				break;
			case 'top10' :
		    	Ranking.find({}).sort({totalPoints:-1}).limit(10).execFind(function(err, rankings) {
		            if (err)
		                res.send(err);
		            console.log(rankings);
		            var message = '<table><tr><th>Player</th><th>Win</th><th>Defeat</th><th>Points</th>';
		            rankings.forEach(function(rank) {
		            	console.log(rank);
		            	message += '';

		            	rank.numWin = (rank.numWin == null) ? 0 : rank.numWin;
		            	rank.numLost = (rank.numLost == null) ? 0 : rank.numLost;
		            	rank.totalPoints = (rank.totalPoints == null) ? 0 : rank.totalPoints;

		            	message += util.format('</tr><tr><th>%s</th><th>%s</th><th>%s</th><th>%s</th></tr>', rank.player, rank.numWin, rank.numLost, rank.totalPoints);
		            });

		            message += '</table>';

					res.json({message_format : 'html', message : message});

		        });

				break;
			case 'history' :


    // var promises = [];

		    	MatchService.getHistory(function(err, matches) {
		            // var deferred = $q.defer();
		            // deferred.resolve(currentNewRequests);
		            // return deferred.promise;

		            if (err)
		                res.send(err);

		            var message = '<ol>';
		            matches.forEach(function(match) {
		            	console.log(match);

		            	message += util.format('<li>%s : <b>%s</b> %s - %s <b> %s </b></li>', match.date.toLocaleDateString(), match.player1, match.score1, match.score2, match.player2);
		            });

		            message += '</ol>';


					res.json({message_format : 'html', message : message});
		        });

				break;
			default:
				res.json({ message: 'Incorrect command!' });
		}

		return;


		console.log('LOL');

        



        
    })

    .get(function(req, res) {
    	console.log(Match);

    	Match.find({}).sort({date:-1}).limit(10).execFind(function(err, matches) {
            if (err)
                res.send(err);

            res.json(matches);
        });
    });


router.route('/ranking')

    .get(function(req, res) {
    	console.log(Match);

    	Ranking.find({}).sort({date:-1}).limit(10).execFind(function(err, rankings) {
            if (err)
                res.send(err);

            res.json(rankings);
        });
    });


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);




console.log('Magic happens on port ' + port);