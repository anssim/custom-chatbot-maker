// set up word tokenizer
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
// levenshtein
const levenshtein = require('js-levenshtein');

// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "eu-north-1",
  //endpoint: "http://localhost:8000" // remove comment for local
});

var dynamodb = new AWS.DynamoDB();
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient();

var DEFAULT_BOT_IDENTITY = "chatbot"; // change default bot identity name (will be used if a chatbot doesn't have unique dialogue table)
var DEFAULT_RESPONSE = {response: "I don't know what you mean.",  // default response, if no match found
						alternatives:  ["Please repeat.", "I didn't catch that.", "I am confused."]};

function tables(table_name, callback){
	var params = {
	};
	
	dynamodb.listTables(params, function(err,data){
		if (err) {
			console.log(err, err.stack);
		} else {
			if (data.TableNames.includes(table_name)){ // check if given bot identity has unique chatbot data table
				callback(table_name);
			} else {
				callback(DEFAULT_BOT_IDENTITY); // default chatbot data table
			}
		}
	});
}

function get_data(table_name, callback){
	// check if bot_identity has a personality, else use default chatbot
	tables(table_name, function(result){ 
		params = {
			TableName: result
		};
		
		// return chatbot dialogue of requested identity
		docClient.scan(params, function(err, data) {
			if (err) {
				console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
			} else {
				callback(data.Items);
			}
		});
	});
}

function create_bot(identity, description, image_url, bot_name, new_table, callback){
	var msg = "";
	// if new dialogue table is needed
	if (new_table == "yes"){
		// add new 
		var params = {
			TableName : identity,
			KeySchema: [       
				{ AttributeName: "response", KeyType: "HASH"} //Partition key
			],
			AttributeDefinitions: [       
				{ AttributeName: "response", AttributeType: "S" }
			],
			ProvisionedThroughput: {       
				ReadCapacityUnits: 1, 
				WriteCapacityUnits: 1
			}
		};
		console.log("creating chatbot table");
		dynamodb.createTable(params, function(err, data) {
			if (err) {
				console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
				msg = "Add chatbot table <b>failed</b>: <b>" + identity + "</b>. Error message: " + err.message;
			} else {
				console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
				msg = "Add chatbot table <b>succeeded</b>: <b>" + identity + "</b>";
			}
		});
	}
	
	// add chatbot data to identities table
	var params_identities = {
		TableName: "bot_identities",
		Item: {
			"identity":  identity,
			"description": description,
			"image_url": image_url,
			"bot_name": bot_name
		}
	};
	
	docClient.put(params_identities, function(err, data) {
		if (err) {
			console.error("Unable to add item", identity, ". Error JSON:", JSON.stringify(err, null, 2));
			callback(msg + "Add chatbot <b>failed</b>: <b>" + identity + "</b>. Error message: " + err.message + ".");
		} else {
			console.log("PutItem succeeded:", identity);
			callback(msg + "Add chatbot <b>succeeded</b>: <b>" + identity + "</b>.");
		}
	});
}
function delete_bot(identity, callback){
	var msg = "";
	var params = {
		TableName:identity
	}
	
	console.log("Attempting item delete...");
	dynamodb.deleteTable(params, function(err, data) {
		if (err) {
			console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
			msg = "Delete chatbot <b>failed</b>: <b>" + identity + "</b>. Error message: " + err.message + ".";
		} else {
			console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
			msg = "Delete chatbot table <b>succeeded</b>: <b>" + identity + "</b>.";
		}
	});
	
	var params2 = {
		TableName:"bot_identities",
		Key:{
			"identity": identity
		}
	}
	
	console.log("Attempting item delete...");
	docClient.delete(params2, function(err, data) {
		if (err) {
			console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
			callback(msg + "<br>Chatbot <b>" + identity + "</b> delete from bot_identities table <b>failed</b>. Error message: " + err.message + ".");
		} else {
			console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
			callback(msg + "<br>Chatbot <b>" + identity + "</b> delete from bot_identities table <b>succeeded</b>.");
		}
	});
}
function update_bot(identity, description, image_url, bot_name, callback){
	setup(identity, function(bot_identity){
		if (bot_identity.identity != identity){
			callback("Updating chatbot <b>" + identity + "</b> info <b>failed</b>. Requested chatbot identity couldn't be found.");
		} else {
			// replace empty values with previous values
			if (description == ""){description = bot_identity.description;}
			if (image_url == ""){image_url = bot_identity.image_url;}
			if (bot_name == ""){bot_name = bot_identity.bot_name;}
			
			var params = {
				TableName: "bot_identities",
				Key: {
					"identity":  identity
				},
				UpdateExpression: "set description = :x, image_url = :y, bot_name = :z",
				ExpressionAttributeValues:{
				":x": description,
				":y": image_url,
				":z": bot_name
				}
			};
			
			docClient.update(params, function(err, data) {
				if (err) {
					console.error("Unable to update item", identity, ". Error JSON:", JSON.stringify(err, null, 2));
					callback("Updating chatbot <b>" + identity + "</b> info <b>failed</b>. Error message: " + err.message + ".");
				} else {
					console.log("UpdateItem succeeded:", identity);
					callback("Updating chatbot <b>" + identity + "</b> info succeeded.");
				}
			});
		}
	});
}

function add_response(identity, response, keywords, alternatives, callback){
	var keywords_list = keywords.split(' ');
	var alternatives_list = alternatives.split(';');
	
	if (alternatives_list == ""){
		var params = {
			TableName: identity,
			Item: {
				"response": response,
				"keywords": keywords_list
			}
		}
	} else {
		var params = {
			TableName: identity,
			Item: {
				"response": response,
				"keywords": keywords_list,
				"alternatives": alternatives_list
			}
		}
	}
	
    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add item", response, ". Error JSON:", JSON.stringify(err, null, 2));
		   callback("Chatbot <b>" + identity + "</b> add response <b>failed<b>: <b>" + response + "</b>. Error message: " + err.message + ".");
       } else {
           console.log("PutItem succeeded:", response);
		   callback("Chatbot <b>" + identity + "</b> add response <b>succeeded</b>: <b>" + response + "</b>. Keywords are: " + keywords + ".");
       }
    });
}

function delete_response(identity, response, callback){
	var params = {
		TableName:identity,
		Key:{
			"response": response
		}
	}
	
	console.log("Attempting item delete...");
	docClient.delete(params, function(err, data) {
		if (err) {
			console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
			callback("Chatbot <b>" + identity + "</b> delete response <b>failed</b>: <b>" + response + "</b>. Error message: " + err.message + ".");
		} else {
			console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
			callback("Chatbot <b>" + identity + "</b> delete response <b>succeeded</b>: <b>" + response + "</b>.");
		}
	});
}

function store_data(table_name, data, meta, callback){
	// Create DynamoDB document client
	//var docClient = new AWS.DynamoDB.DocumentClient();
	var date = new Date();
	var params = {
        TableName: table_name,
		Item:{
			"user_id": data[0],
			"datetime": date.toISOString(),
			"meta": meta,
			"user_message": data[2],
			"bot_id": data[1],
			"bot_response": data[3]
		}
    };
	
	docClient.put(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log(params);
		}
	});
}
function replace_user_id(user_id, best_response, callback){
	// replace generic 'user_id' with actual user_id 
	if (best_response.includes("user_id")){
		var new_response = best_response.replace("user_id", user_id); // attach user id to questionnaire url
		callback(new_response);
	} else {
		callback(best_response);
	}
}
function return_longer(keyword, word){
	if (word.length > keyword.length){
		return word.length;
	} else {
		return keyword.length;
	}
}

function chat(msg, user_id, bot_id, meta, callback){
	var history_table = "chat_history";
	
	// tokenize message
	var message = tokenizer.tokenize(msg);
	
	// decide best response
	get_data(bot_id, function(result){
		var best_match_score = 0;
		var best_response = DEFAULT_RESPONSE.response;
		var best_match = DEFAULT_RESPONSE;
		
		for (var x in result){ 					// for each entry in chatbot database
			var match_score = 0;
			var combined_message_score = 0;
			
			for (var y in result[x].keywords){ 	// for each keyword in chatbot database entry
				var word_score = 0;
				var levenshtein_distance = 0;
				var longer_word_length = 0;
			
				var keyword = result[x].keywords[y].toLowerCase(); // lowercase
				keyword = natural.PorterStemmer.stem(keyword); // stem each keyword
				
				for (var z in message){ 		// for each tokenized word in message
					
					var word = natural.PorterStemmer.stem(message[z]); // stem each word in message
					
					levenshtein_distance  = levenshtein(word, keyword); // calculate similarity between words
					longer_word_length = return_longer(keyword, word); // return longer of the two words
					
					word_score = 1 - (levenshtein_distance / longer_word_length); // calculate word score
					
					if (word_score < 0.6){
						word_score = 0; // remove score from words that are too far apart
					}
					combined_message_score = combined_message_score + word_score;
				}
			}
			// filter out vague responses by dividing found matches with total keywords in response
			match_score = combined_message_score / (result[x].keywords.length);
			
			// check if better match is found
			if (match_score > best_match_score && match_score > 0.45){
				best_match_score = match_score;
				best_response = result[x].response;
				best_match = result[x];
			} else if (match_score == 1 && result[x].keywords.length > best_match.keywords.length) { // in case of multiple perfect matches pick most accurate one
				best_response = result[x].response;
				best_match = result[x];
			}
		}
		// check for alternative responses and select one at random
		if (best_match.hasOwnProperty('alternatives')){
			var size = best_match.alternatives.length + 1;
			var random = Math.floor(Math.random() * size);
			if (random == 0){
				best_response = best_match.response;
			} else {
				best_response = best_match.alternatives[random-1];
			}
		}
		// store user_id, bot_id, user message, and bot response to chat_history table in database
		data =  [ user_id, bot_id, msg, best_response ];
		store_data(history_table, data, meta);
		
		// replace generic 'user_id' with actual user_id for urls
		replace_user_id(user_id, best_response, function(result){
			callback(result);
		});
	});
}

function setup(identity, callback){
	var identities_table = "bot_identities";
	
	get_data(identities_table, function(result){
		var bot = {};
		var default_bot = {};
		
		// for each bot_identity in bot_identities table
		for (var x in result){
			// check if selected identity is found in bot_identities table
			if (result[x].identity == identity){
				bot = result[x];
			} else if (result[x].identity == DEFAULT_BOT_IDENTITY){ // check for default bot identity and save position in query result
				default_bot = result[x];
			}
		}
		// check if selected identity is not found in bot_identities table
		if (bot.identity !== undefined){
			callback(bot); // return bot info
		} else if (default_bot.identity !== undefined){
			callback(default_bot);  // return default bot identity info if requested bot couldn't be found in bot_identities table
		} else {
			callback("Error"); // return error if no chatbots could be found
		}
	});
}

module.exports = {setup, chat, create_bot, add_response, delete_bot, delete_response, update_bot};