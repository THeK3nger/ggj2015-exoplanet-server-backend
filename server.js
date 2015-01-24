"use strict";

var http = require("http");
var url = require("url");
var users = require("./users.js");
var actions = require("./actions.js");
var game = require("./game.js");

// -----------------------------------------------------------------------------
// Configuration Variables
//------------------------------------------------------------------------------
var Config = {
  port: 8080,
  worldWidth: 200,
  worldHeight: 50,
  updateInterval: 5,
  verbose: true
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

function chLogin() {
  var userid = users.addUser();
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
  } else if (queryData.actionID === actions.ActionsType.COLECT) {
    newAction = actions.Collect(
      queryData.userID,
      queryData.agentID,
      queryData.targetID
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
        res.write(chLogin());
        break;
      case "/userlist":
        res.write(chLogin());
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
      default:
        res.write("Error");
    }
    res.end();

  }).listen(Config.port);

  console.log("Server listening on port " + Config.port);
})();
