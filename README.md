CUSTOM CHATBOT MAKER 2019
==

A simple web based chatbot with customizable dialogue, style, avatar, description, and name of chatbot.

## Features
Creating and customizing chatbots with ready to use online chat.

Modify chatbots and give them unique dialogue.

Select which chatbot talk with using URL parameters. 

## Installation
Download and install Node.js: https://nodejs.org/en/

Download and install npm: https://www.npmjs.com/

Download and install AWS SDK for Javascript in Node.js: https://aws.amazon.com/sdk-for-node-js/ or 'npm install aws-sdk'

Download and install AWS Command Line Interface (CLI) : https://aws.amazon.com/cli/

Install express and other packages with npm.

Required packages:
	express,
	body-parser,
	cookie-parser,
	linkifyjs,
	natural.

## Usage

1. Set up database.

1.1. Setting up DynamoDB access (web or local): https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SettingUp.html

1.2. Create default db tables for DynamoDB by copying below JavaScript code to JS file and run with 'node filename.js'. Depending on AWS access key used, AWS SDK creates tables for either local or web.

	// Load the AWS SDK for Node.js
	var AWS = require("aws-sdk");

	// Set the region
	AWS.config.update({
	  region: "eu-north-1",
	  //endpoint: "http://localhost:8000" //remove comment for local
	});
	var dynamodb = new AWS.DynamoDB();

	// bot_identities table
	var params_identities = {
		TableName : "bot_identities",
		KeySchema: [       
			{ AttributeName: "identity", KeyType: "HASH"}
		],
		AttributeDefinitions: [       
			{ AttributeName: "identity", AttributeType: "S" }
		],
		ProvisionedThroughput: {       
			ReadCapacityUnits: 1, 
			WriteCapacityUnits: 1
		}
	};
	
	// chat_history table
	var params_history = {
		TableName : "chat_history",
		KeySchema: [       
			{ AttributeName: "user_id", KeyType: "HASH"},   //Partition key
			{ AttributeName: "datetime", KeyType: "RANGE" } //Sort key
		],
		AttributeDefinitions: [       
			{ AttributeName: "user_id", AttributeType: "S" },
			{ AttributeName: "datetime", AttributeType: "S" }
		],
		ProvisionedThroughput: {       
			ReadCapacityUnits: 1, 
			WriteCapacityUnits: 1
		}
	};

	// chatbot table, or table named after a chatbot for custom responses.
	var params_chatbot = {
		TableName : "chatbot",
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
	
	// Add each table using command dymanodb.createTable with unique params as input.
	dynamodb.createTable(params_identities, function(err, data) {
		if (err) {
			console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
		}
	});
	dynamodb.createTable(params_history, function(err, data) {
		if (err) {
			console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
		}
	});
	dynamodb.createTable(params_chatbot, function(err, data) {
		if (err) {
			console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
		}
	});

1.3. Populate tables with sample, or custom data.
	
	// Load the AWS SDK for Node.js
	var AWS = require("aws-sdk");

	// Set the region
	AWS.config.update({
	  region: "eu-north-1",
	  //endpoint: "http://localhost:8000" //remove comment for local
	});
	var dynamodb = new AWS.DynamoDB();
	
	// Create DynamoDB document client
	var docClient = new AWS.DynamoDB.DocumentClient();
	
	// Populating bot_identities table:
	var chatbotSchema = [{identity: "happy", description: "I am feeling good!", image_url: "img/face1.png"},
						  {identity: "sad", description: "I am feeling sad!", image_url: "img/face2.png"},
						  {identity: "neutral", description: ". . .", image_url: "img/face3.png"},
						  {identity: "happysad", description: "I don't know what to feel.", image_url: "img/face4.png"}];

	chatbotSchema.forEach(function(item) {
		var params = {
			TableName: "bot_identities",
			Item: {
				"identity":  item.identity,
				"description": item.description,
				"image_url": item.image_url
			}
		};
		docClient.put(params, function(err, data) {
		   if (err) {
			   console.error("Unable to add item", item.identity, ". Error JSON:", JSON.stringify(err, null, 2));
		   } else {
			   console.log("PutItem succeeded:", item.identity);
		   }
		});
	});

	// Populating chatbot table with optional alternative responses:
	var chatbotSchema = [ {keywords: [ 'hello', 'hi', 'morning', 'evening' ], response: 'Hello!', alternatives:  ['Go away.', 'Nice to meet you!'] },
					    {keywords: [ 'goodbye', 'bye' ], response: 'Goodbye!', alternatives:  ['Bye.'] },
					    {keywords: [ 'car' ], response: 'Car is a vehicle!, alternatives:  ['Cars are noisy!'] },
						{keywords: [ 'link' ], response: 'https://www.google.com'} ];
	
	chatbotSchema.forEach(function(item) {
		var params2 = {
			TableName: "chatbot",
			Item: {
				"response": item.response,
				"keywords": item.keywords,
				"alternatives": item.alternatives
			}
		};
		docClient.put(params2, function(err, data) {
		   if (err) {
			   console.error("Unable to add item", item.response, ". Error JSON:", JSON.stringify(err, null, 2));
		   } else {
			   console.log("PutItem succeeded:", item.response);
		   }
		});
	});
	
2. Run server locally with 'node server.js'

3. Create and modify bots by adding bots to database. For quick access, navigate to route /modify.html.

4. Talk to bot by adding 'bot_id' (bot name used) url parameter. Example: 'http://localhost:3000/?user_id=1&bot_id=happy'

	
## License

Copyright 2019 Anssi Meisalmi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

