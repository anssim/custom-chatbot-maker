// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "eu-north-1",
  endpoint: "http://localhost:8000" //remove comment for local
});

var dynamodb = new AWS.DynamoDB();

// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient();

var chatbotSchemaA = [{identity: "happy", description: "I am feeling good!", image_url: "img/face1.png"},
					  {identity: "sad", description: "I am feeling sad!", image_url: "img/face2.png"},
					  {identity: "neutral", description: ". . .", image_url: "img/face3.png"},
					  {identity: "happysad", description: "I don't know what to feel.", image_url: "img/face4.png"}];

chatbotSchemaA.forEach(function(item) {
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
/*
var chatbotSchema0 = [ {keywords: [ 'hello', 'hi', 'morning', 'evening' ], response: 'Hello!'},
					    {keywords: [ 'goodbye', 'bye' ], response: 'Goodbye!'},
					    {keywords: [ 'car' ], response: 'Car is a vehicle!'},
					    {keywords: [ 'lake', 'biggest', 'Finland' ], response: 'Lake Saimaa is Finland\'s biggest lake!'},
					    {keywords: [ 'weather', 'oulu' ], response: 'The weather in Oulu is warm!'},
						{keywords: [ 'link' ], response: 'https://www.google.com'} ];
						
var chatbotSchema1 = [ {keywords: [ 'hello', 'hi', 'morning', 'evening' ], response: 'Hello!'},
					    {keywords: [ 'goodbye', 'bye' ], response: 'Goodbye!'},
					    {keywords: [ 'car' ], response: 'Car is a wonderful vehicle!'},
					    {keywords: [ 'lake', 'biggest', 'Finland' ], response: 'Lake Saimaa is Finland\'s best lake!'},
					    {keywords: [ 'weather', 'oulu' ], response: 'The weather in Oulu is so very warm!'},
						{keywords: [ 'link' ], response: 'https://www.google.com'},
						{keywords: [ 'form' ], response: 'https://googleforms.com?prefilval=<user_id>'}];

var chatbotSchema2 = [ {keywords: [ 'hello', 'hi', 'morning', 'evening' ], response: 'Go away.' },
					    {keywords: [ 'goodbye', 'bye' ], response: 'Bye.' },
					    {keywords: [ 'car' ], response: 'Cars are noisy!' },
					    {keywords: [ 'lake', 'biggest', 'Finland' ], response: 'Finland only has small lakes.' },
					    {keywords: [ 'weather', 'oulu' ], response: 'The weather in Oulu is warm!' },
						{keywords: [ 'link' ], response: 'https://www.google.com'}];

var chatbotSchema3 = [ {keywords: [ 'hello', 'hi', 'morning', 'evening' ], response: 'Hi.' },
					    {keywords: [ 'goodbye', 'bye' ], response: 'Goodbye.' },
					    {keywords: [ 'car' ], response: 'Cars are ok.' },
					    {keywords: [ 'lake', 'biggest', 'Finland' ], response: 'I don\'t much care about lakes' },
					    {keywords: [ 'weather', 'oulu' ], response: 'The weather is all the same.' },
						{keywords: [ 'link' ], response: 'https://www.google.com'}];


var chatbotSchema4 = [ {keywords: [ 'hello', 'hi', 'morning', 'evening' ], response: 'Hello!', alternatives:  ['Go away.']},
					    {keywords: [ 'goodbye', 'bye' ], response: 'Goodbye!', alternatives:  ['Bye.'] },
					    {keywords: [ 'car' ], response: 'Car is a wonderful vehicle!', alternatives:  ['Cars are noisy!'] },
					    {keywords: [ 'lake', 'biggest', 'Finland' ], response: 'Lake Saimaa is Finland\'s best lake!', alternatives:  ['Finland only has small lakes.'] },
					    {keywords: [ 'weather', 'oulu' ], response: 'The weather in Oulu is so very warm!', alternatives:  ['The weather in Oulu is warm!'] },
						{keywords: [ 'link' ], response: 'https://www.google.com'}];
						
chatbotSchema0.forEach(function(item) {
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
chatbotSchema1.forEach(function(item) {
    var params2 = {
        TableName: "happy",
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
chatbotSchema2.forEach(function(item) {
    var params2 = {
        TableName: "sad",
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
chatbotSchema3.forEach(function(item) {
    var params2 = {
        TableName: "neutral",
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
chatbotSchema4.forEach(function(item) {
    var params2 = {
        TableName: "happysad",
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
*/