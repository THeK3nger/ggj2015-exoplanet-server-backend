"use strict";

var http = require("http");
var url = require("url");
var users = require("./users.js");
var actions = require("./actions.js");
var game = require("./game.js");

var chalk = require('chalk');

// -----------------------------------------------------------------------------
// Configuration Variables
//------------------------------------------------------------------------------
var Config = {
  port: 8080,
  worldWidth: 150,
  worldHeight: 50,
  updateInterval: 5,
  verbose: true,
  floorLevel: 5,
  initialFood: 150,
  initialWood: 150,
  initialHouses: 2,
  foodConsumptionPerTurn: 2,
  energyConsumptionPerTurn: 0.3,
  initialGoats: 20,
  initialTrees: 20,
  houseBuildingCost: 50,
  houseRoomsAmount: 1,
  baseWoodCollection: 25,
  baseFoodCollection: 50,
  woodCollectionDamage: 1,
  foodCollectionDamage: 10,
  manSpawnCost: 25,
  foodEnergyConversionCoefficient: 1.5,
  asteroidProbability: 0.05
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Handlers
//------------------------------------------------------------------------------
// As a convention, command handlers starts with the *ch* prefix.
//------------------------------------------------------------------------------

function chState(theWorld) {
  return JSON.stringify({world: theWorld});
}

function chLogin(req) {
  var queryData = url.parse(req.url, true).query;
  var userid = users.addUser(queryData.username);
  console.log(chalk.green("Hello new user " + queryData.username));
  return JSON.stringify({userid: userid});
}

function chAction(req, theGame) {
  var queryData = url.parse(req.url, true).query;
  var newAction;
  if (parseInt(queryData.actionID) === actions.ActionsType.MOVE) {
    newAction = actions.MoveAction(
      queryData.userID,
      queryData.agentID,
      queryData.direction
    );
  } else if (parseInt(queryData.actionID) === actions.ActionsType.COLLECT) {
    newAction = actions.CollectAction(
      queryData.userID,
      queryData.agentID,
      queryData.targetID
    );
  } else if (parseInt(queryData.actionID) === actions.ActionsType.SPAWN) {
    newAction = actions.SpawnAction(
      queryData.userID,
      queryData.agentID
    );
  } else if (parseInt(queryData.actionID) === actions.ActionsType.BUILD) {
    newAction = actions.BuildAction(
      queryData.userID,
      queryData.agentID
    );
  }
  if (Config.verbose)
    console.log("Received action: " + JSON.stringify(newAction));
  theGame.proposeAction(newAction);
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

function timeLeft(timeout) {
  return (timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000;
}

// -----------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

(function main() {
  // Initialize the game
  var theGame = game.CreateGame(Config);

  // Direct Access to TheWorld! [TODO: Remove?]
  var theWorld = theGame.theWorld;

  // Start the game Main Loop.
  var timeout = setInterval(theGame.computeNextState, Config.updateInterval*1000);

  http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    switch (url.parse(req.url).pathname) {
      case "/action":
        chAction(req, theGame);
        res.write("done");
        break;
      case "/login":
        res.write(chLogin(req));
        break;
      case "/userlist":
        res.write(JSON.stringify({users: users.usersList}));
        break;
      case "/state":
        res.write(chState(theWorld));
        break;
      case "/actions":
        res.write(JSON.stringify({actions: actions}));
        break;
      case "/timeout":
        res.write(JSON.stringify({actions: timeLeft(timeout)}));
        break;
      case "/lastactions":
        res.write(JSON.stringify({lastactions: timeLeft(timeout)}));
        break;
      case "/frasariulum":
        res.write(users.frasariulum());
        break;
      case "/history":
        res.write(JSON.stringify(theGame.ancientWorlds));
        break;
      case "/howmanylives":
        var totalAlive = theGame.ancientWorlds.worlds.reduce(function(prev, current) {
          return prev + parseInt(current.maxpopulation);
        },0);
        res.write(totalAlive.toString());
        break;
      case "/crossdomain.xml":
        res.write('<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>');
        break;
      default:
        res.write("Error");
    }
    res.end();

  }).listen(Config.port);

  console.log("Server listening on port " + Config.port);
})();
