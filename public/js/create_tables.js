// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "eu-north-1",
  endpoint: "http://localhost:8000" //remove comment for local
});

var dynamodb = new AWS.DynamoDB();
var paramsA = {
    TableName : "happysad",
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
var paramsB = {
    TableName : "happy",
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
var paramsC = {
    TableName : "sad",
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
var paramsD = {
    TableName : "neutral",
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

var params = {
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

var params2 = {
    TableName : "bot_identities",
    KeySchema: [       
        { AttributeName: "identity", KeyType: "HASH"}     //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "identity", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
};
var params3 = {
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
/*
console.log("creating happysad table");
dynamodb.createTable(paramsA, function(err, data) {
    if (err) {
        console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
console.log("creating happy table");
dynamodb.createTable(paramsB, function(err, data) {
    if (err) {
        console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
console.log("creating sad table");
dynamodb.createTable(paramsC, function(err, data) {
    if (err) {
        console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
console.log("creating neutral table");
dynamodb.createTable(paramsD, function(err, data) {
    if (err) {
        console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
console.log("creating chatbot table");
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table1. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table1. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
*/
console.log("creating bot_identities table");
dynamodb.createTable(params2, function(err, data) {
    if (err) {
        console.error("Unable to create table2. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table2. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
/*
console.log("creating chat_history table");
dynamodb.createTable(params3, function(err, data) {
    if (err) {
        console.error("Unable to create table3. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table3. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
*/