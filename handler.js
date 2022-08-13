'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb")
const documentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});
const GAMES_TABLE_NAME = process.env.GAMES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(data)
  }
}

module.exports.createGame = async (event, context, callback) => {
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: GAMES_TABLE_NAME,
      Item: {
        gameId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(gameId)"
    }
    await documentClient.put(params).promise();
    callback(null, send(201, data))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};

module.exports.updateGame = async (event, context,callback) => {
  let gameId = event.pathParameters.id;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: GAMES_TABLE_NAME,
      Key: {gameId},
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body',
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body,
      },
      ConditionExpression: 'attribute_exists(gameId)'
    }
    await documentClient.update(params).promise();
    callback(null, send(200, data))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};

module.exports.deleteGame = async (event, context, callback) => {
  let gameId = event.pathParameters.id
  try {
    const params = {
      TableName: GAMES_TABLE_NAME,
      Key: {
        gameId: gameId
      },
      ConditionExpression: 'attribute_exists(gameId)'
    }
    await documentClient.delete(params).promise();
    callback(null,send(200,gameId))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};

module.exports.getAllGames = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(`All games are returned.`),
  };
};
