// Setup
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var bot = require('./public/js/chatbot.js');
var linkify = require('linkifyjs');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());

// Routes
app.use('/', express.static(__dirname + '/public'));

app.get('/chat', function (req, res){
	// example query: http://localhost:3000/?user_id=01&bot_id=happy
	var bot_id = req.query.bot_id;
	
	if (bot_id === undefined){
		if (req.cookies.bot_id !== undefined) {
			bot_id = String(req.cookies.bot_id);
		}
	}
	
	bot.setup(bot_id, function(bot_identity){
		res.cookie('bot_id', bot_identity.identity); // save bot identity
		res.json(bot_identity); // send bot info to client
	});
});

app.post('/chatbot', function(req, res){
	bot.create_bot(req.body.identity, req.body.description, req.body.url, req.body.new_table, function(result) {
		res.json(result);
	});
});
app.post('/del_chatbot', function(req, res){
	bot.delete_bot(req.body.identity, function(result) {
		res.json(result);
	});
});
app.post('/update_chatbot', function(req, res){
	bot.update_bot(req.body.identity, req.body.description, req.body.url, function(result) {
		res.json(result);
	});
});

app.post('/response', function(req, res){
	bot.add_response(req.body.identity, req.body.response, req.body.keywords, req.body.alternatives, function(result) {
		res.json(result);
	});
});
app.post('/del_response', function(req, res){
	bot.delete_response(req.body.identity, req.body.response, function(result) {
		res.json(result);
	});
});


app.post('/messages', function(req, res){
	var user_id = req.query.user_id;
	var bot_id = req.query.bot_id;
	
	// check user_id on query
	if (user_id === undefined){ 
		// check if user_id is in cookies
		if (req.cookies.user_id === undefined) {
			// generate new user_id
			var result = '';
			var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for ( var i = 0; i < 12; i++ ) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			user_id = result;
			res.cookie('user_id', user_id);
		} else {
			user_id = req.cookies.user_id;
		}
	} else {
		res.cookie('user_id', user_id);
	}
	
	// check cookie for bot_id
	if (bot_id === undefined){
		if (req.cookies.bot_id !== undefined) {
			bot_id = String(req.cookies.bot_id);
		}
	}
	// user message
	var msg = req.body.text.toLowerCase();
	
	// give user message to chatbot and send bot reply to client
	bot.chat(msg, user_id, bot_id, function(best_result) {
		if (linkify.test(best_result)){
			var url = "";
			if (best_result.includes("user_id")){
				url = best_result.replace("user_id", user_id); // attach user id to questionnaire url
			} else {
				url = best_result;
			}
			res.send([url, 1]); // send url, and 1 to signify this is an url
		} else {
			res.send([best_result, 0]); // send bot reply
		}
	});
});

// Listen
app.listen(port, function(){
	console.log('app listening on port ' + port + '!');
})