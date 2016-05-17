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
var utf8 = require('utf8');


var Match     = require('./app/models/match');
var Ranking     = require('./app/models/ranking');
var News     = require('./app/models/news');
var Kudos     = require('./app/models/kudos');

var MatchService = require('./app/services/matchService');
var NewsService = require('./app/services/newsService');
var KudosService = require('./app/services/kudosService');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.route('/pingpong')

    .post(function(req, res) {
        

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


		        var score = req.body.item.message.message;
		        score = score.split(' ');


		        match.player1 = score[2].replace("@", "");
		        match.player2 = score[5].replace("@", "");
		        match.score1 = score[3];
		        match.score2 = score[4];
		        match.date = new Date();

				MatchService.recordNewMatch(match, function(err, success) {

					if(err) 
						res.json({message: err, color : 'red'});

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

		            var message = '<table><tr><th><strong>Player</strong></th><th>Win</th><th>Def</th><th>+/-</th><th>Pts</th>';
		            rankings.forEach(function(rank) {

		            	message += '';

		            	rank.numWin = (rank.numWin == null) ? 0 : rank.numWin;
		            	rank.numLost = (rank.numLost == null) ? 0 : rank.numLost;
		            	rank.totalPoints = (rank.totalPoints == null) ? 0 : rank.totalPoints;

		            	upperCaseName = rank.player.charAt(0).toUpperCase() + rank.player.slice(1);

		            	message += util.format('</tr><tr><th>%s</th><th>%s</th><th>%s</th><th>%s</th><th>%s</th></tr>', upperCaseName, rank.numWin, rank.numDefeat, rank.pointsDifference, rank.totalPoints);
		            });

		            message += '</table>';

					res.json({message_format : 'html', message : message});

		        });

				break;
			case 'history' :


    // var promises = [];
    // 
	            var incomingMessage = req.body.item.message.message;
				params = incomingMessage.split(' ');
				var showId = false;
				if(params.length > 2 && params[2] == 'showId') {
					showId = true;
				}


		    	MatchService.getHistory(function(err, matches) {
		            // var deferred = $q.defer();
		            // deferred.resolve(currentNewRequests);
		            // return deferred.promise;


		            if (err)
		                res.json({message: err});

		            var message = '<ol>';


		            matches.forEach(function(match) {
		            	message += util.format('<li>%s : <b>%s</b> %s - %s <b> %s </b>', match.date.toLocaleDateString(), match.player1, match.score1, match.score2, match.player2);
		            	if(showId) {
		            		message += util.format(' // <i>%s</i> //', match._id);
		            	}
		            	message += "</li>";
		            });

		            message += '</ol>';


					res.json({message_format : 'html', message : message});
		        });

				break;
			case 'cancel':

				var message = req.body.item.message.message;

				messages = message.split(' ');

				matchId = 0;

				if(messages.length > 2) {
					matchId = messages[2];	
				}

				if(matchId) {

					//Only ME can delete with ID
					if(req.body.item.message.from.id == 667354) {
						MatchService.cancelWithId(matchId, function(err, successMessage) {
							if(err) {
								res.json({message: err, color:red});
							}
							res.json({message: successMessage})
						});
					} else {
						res.json({message: 'Only @Jerome can cancel a match !', message_format : 'text', color: 'red'});
					}

					
				} else {
					MatchService.cancelLastMatch(function(err, successMessage) {
						if(err) {
							res.json({message: err, color : red});
						}
						res.json({message: successMessage})
					});
				}
				break;

		        
			case 'news' :

				var message = req.body.item.message.message;

				messages = message.split(' ');

				if(messages[2] == 'add') {

					message = message.replace("/pingpong news add", "");

					var news = new News();
					news.message = message;
					news.date = new Date();
					news.reporter = req.body.item.message.from.mention_name;

					NewsService.insertNews(news, function(err, success) {
						res.json({ message: 'News saved !' });
					});
				} else if(messages[2] == 'list'){
					NewsService.getNews(function(err, news) {
			            // var deferred = $q.defer();
			            // deferred.resolve(currentNewRequests);
			            // return deferred.promise;


			            if (err)
			                res.json({message: err});

			            var message = '<ol>';


			            news.forEach(function(loopNews) {
			            	message += util.format('<li>%s : <b>%s</b> - %s</li>', loopNews.date.toLocaleDateString(), loopNews.reporter, loopNews.message);
			            });

			            message += '</ol>';


						res.json({message_format : 'html', message : message});
			        });
				} else {
					res.json({ message: 'Incorrect command!', color:'red' });
				}

				

				

				
				break;
			default:
				res.json({ message: 'Incorrect command!', color:'red' });
		}

		return;



        
    })

    .get(function(req, res) {


    	Match.find({}).sort({date:-1}).limit(10).execFind(function(err, match) {
            if (err)
                res.send(err);



            res.json(matches);
        });
    });

router.route('/kudos')

    .post(function(req, res) {
        



		var values = ['customer','solution','iterate','data','guru','different','nurture'];

    	var message = req.body.item.message.message;
		var split = message.split(' ');



		switch(split[1]) {

			case 'list' :

				console.log(req.body.item.room);
				//Only ME can delete with ID
				
				if(req.body.item.room.id != 2694937) {
					res.json({message: 'Incorrect room to list Kudos', message_format : 'text', color: 'red'});
					return;
				}

				if(req.body.item.message.from.id != 667354 && req.body.item.message.from.id != 3035229) {
					//TODO CHECK ROOM TOO
					res.json({message: 'You are not authorized to list Kudos', message_format : 'text', color: 'red'});
					return;
				}


				KudosService.getKudos(function(err, kudos) {
		            if (err)
		                res.json({message: err});

		            var message = '<ol>';


		            kudos.forEach(function(kudo) {
		            	message += util.format('<li>%s : %s gives point to <b>%s</b> for <b>%s</b> - %s', kudo.date.toLocaleDateString(), kudo.reporter, kudo.nominate, kudo.value, kudo.message);
		            	message += "</li>";
		            });

		            message += '</ol>';


					res.json({message_format : 'html', message : message});

		        });
				break;
			case 'help' :
				message = "Commands available are : ";
				message += "<ul>"+
								"<li>"+
									"/kudos @name (value) reason of the kudos. i.e : /kudos @jerome (solution) a simple reason"+
								"</li>"+
								"<li>"+
									"values are : " + values.join(' ') +
								"</li>"+
							"</ul>";
				res.json({message_format : 'html', message : message});

				break;
			default:
				//Message should be like this : 
				//
				// /kudos @Annie (solution) An example message

				if(split.length < 3) {
					//Missing something
					res.json({ message: 'Your command is incorrect !', color:'red' });
					return;
				}

				//Validate the message
				var nominate = split[1].replace('@', '');
				var value = split[2].replace('(','').replace(')','').toLowerCase();
				var reporter = req.body.item.message.from.mention_name;
				var reporterId = req.body.item.message.from.id;
				var message;

				if(split.length == 3 ) {
					message = 'no reason';
				} else {
					message = split.splice(3, split.length).join(' ');	
				}
				


				//Check if value is correct
				if(values.indexOf(value) == -1) {
					res.json({ message: 'The value is incorrect ! Correct values are : ' + values.join(' '), color:'red' });
					return;
				}

				//Check if nominate != reporter
				if(nominate == reporter) {
					res.json({ message: 'You can\'t give yourself a point !', color:'red' });	
					return;
				}

				var kudos = new Kudos();
				kudos.date = new Date();
				kudos.reporter = reporter;
				kudos.nominate = nominate;
				kudos.message = message;
				kudos.value = value;
				kudos.reporterId = reporterId;

				console.log(kudos);
				console.log(reporterId);

				KudosService.insertKudos(kudos, function(err, success) {
					res.json({ message: 'Kudos saved !' });
				});

				
			break;

		}
		// res.json({ message: 'Kudos wasn\'t save, please try again !', color:'red' });
		return;




        
    })

    .get(function(req, res) {


    	Kudos.find({}).sort({date:-1}).limit(10).execFind(function(err, kudos) {
            if (err)
                res.send(err);



            res.json(kudos);
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);