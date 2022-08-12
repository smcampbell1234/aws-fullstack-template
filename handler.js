'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb")
const documentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});
const GAMES_TABLE_NAME = process.env.GAMES_TABLE_NAME;

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
    callback(null,{
      statusCode: 201,
      body: JSON.stringify(data),
    })
  } catch(err) {
    callback(null,{
      statusCode: 500,
      body: JSON.stringify(err.message),
    })
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
    callback(null,{
      statusCode: 200,
      body: JSON.stringify(data),
    })
  } catch(err) {
    callback(null,{
      statusCode: 500,
      body: JSON.stringify(err.message),
    })
  }
};

module.exports.deleteGame = async (event) => {
  let gameId = event.pathParameters.id
  return {
    statusCode: 200,
    body: JSON.stringify(`Game with id ${gameId} has been deleted.`),
  };
};

module.exports.getAllGames = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(`All games are returned.`),
  };
};
