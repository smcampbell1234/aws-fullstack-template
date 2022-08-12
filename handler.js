'use strict';

module.exports.createGame = async (event) => {
  return {
    statusCode: 201,
    body: JSON.stringify("A game has been created."),
  };
};

module.exports.updateGame = async (event) => {
  let gameId = event.pathParameters.id
  return {
    statusCode: 200,
    body: JSON.stringify(`Game with id ${gameId} has been updated.`),
  };
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
