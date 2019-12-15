// Setup
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var bot = require('./public/js/chatbot.js');
var linkify = require('linkifyjs');

var app = express();
var port = process.env.PORT || 3000;

var admin_password = "1234";
var password_fail_message = "Password authentication <b>failed</b>.";

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
	var admin_pwd = req.query.p; // check admin password
	console.log(req.body);
	if (admin_pwd == admin_password){
		bot.create_bot(req.body.identity, req.body.description, req.body.image_url, req.body.bot_name, req.body.new_table, function(result) {
			res.json(result);
		});
	} else {
		res.json(password_fail_message);
	}
	
});
app.post('/del_chatbot', function(req, res){
	var admin_pwd = req.query.p; // check admin password
	if (admin_pwd == admin_password){
		bot.delete_bot(req.body.identity, function(result) {
			res.json(result);
		});
	} else {
		res.json(password_fail_message);
	}
});
app.post('/update_chatbot', function(req, res){
	var admin_pwd = req.query.p; // check admin password
	if (admin_pwd == admin_password){
		bot.update_bot(req.body.identity, req.body.description, req.body.image_url, req.body.bot_name, function(result) {
			res.json(result);
		});
	} else {
		res.json(password_fail_message);
	}
});

app.post('/response', function(req, res){
	var admin_pwd = req.query.p; // check admin password
	if (admin_pwd == admin_password){
		bot.add_response(req.body.identity, req.body.response, req.body.keywords, req.body.alternatives, function(result) {
			res.json(result);
		});
	} else {
		res.json(password_fail_message);
	}
});
app.post('/del_response', function(req, res){
	var admin_pwd = req.query.p; // check admin password
	if (admin_pwd == admin_password){
		bot.delete_response(req.body.identity, req.body.response, function(result) {
			res.json(result);
		});
	} else {
		res.json(password_fail_message);
	}
});


app.post('/messages', function(req, res){
	var user_id = req.query.user_id;
	var bot_id = req.query.bot_id;
	
	// check user_id on query
	if (user_id === undefined){ 
		// check user_id on cookies
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
	// user message lowercase
	var msg = req.body.text.toLowerCase();
	
	// give user message to chatbot and send bot reply to client
	bot.chat(msg, user_id, bot_id, function(best_result) {
		var array = linkify.find(best_result);
		
		if (array.length){
			var url = best_result;
			for (var x in array){
				var href = '<a href="' + array[x].href + '">' + array[x].value + '</a>';
				url = url.replace(array[x].value, href);
			}
			res.send(url); // send modified url
		} else {
			res.send(best_result); // send bot reply
		}
	});
});

// Listen
app.listen(port, function(){
	console.log('app listening on port ' + port + '!');
})