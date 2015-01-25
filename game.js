"use strict";

var world = require("./world.js");
var users = require("./users.js");

var chalk = require('chalk');
var fs = require("fs");

var CreateGame = function(config) {

  var theWorld = new world.World(config.worldWidth, config.worldHeight, config);

  var actionBuffer = [];

  var lastActions = {};

  var ancientWorlds = JSON.parse(fs.readFileSync('./ancientworlds.json', 'utf8'));

  var logged = false;

  var usersActions = function(userID) {
    return actionBuffer.filter(
      function(action) {
        return action.userID === userID;
      }
    );
  };

  var agentActions = function(agentID) {
    return actionBuffer.filter(
      function(action) {
        return action.agentID === agentID;
      }
    );
  };

  var duplicateActionForAgent = function(action) {
    return usersActions(action.userID).some(
      function(elem) {
        return elem.agentID === action.agentID;
      });
  };

  var groupAgentActions = function() {
    var result = {};
    theWorld.agents.forEach(
      function(agent) {
        var theAgentAction = agentActions(agent.id);
        result[agent.id] = theAgentAction;
      }
    );
    return result;
  };

  var pickActionForAgents = function() {
    var packet = groupAgentActions();
    var result = {};
    theWorld.agents.forEach(
      function(agent) {
        var theChosenOne = packet[agent.id][Math.floor(Math.random() * packet[agent.id].length)];
        if (theChosenOne) {
          result[agent.id] = theChosenOne;
        }
      }
    );
    return result;
  };

  var proposeAction = function(action) {
    if (users.userExists(action.userID)) {
      if (!duplicateActionForAgent(action)) {
        actionBuffer.push(action);
      } else {
        console.log(chalk.yellow("[WAR] Duplicated Action for the User/Agent pair."));
      }
    } else {
      console.log(chalk.yellow("[WAR] Action received by an invalid user."));
    }
  };

  var computeNextState = function() {
    console.log(chalk.green("Computing New State!"));
    var choosenActions = pickActionForAgents();
    theWorld.agents.forEach(
      function(agent) {
        if (agent.id in choosenActions) {
          theWorld.applyAction(choosenActions[agent.id]);
        }
      }
    );
    lastActions = choosenActions;
    theWorld.worldEvolution();
    console.log(JSON.stringify(choosenActions));
    // Empty Buffer
    actionBuffer = [];
    if (!theWorld.alive && !logged) {
      ancientWorlds.worlds.push(theWorld.statistics);
      var strJson = JSON.stringify(ancientWorlds);
      fs.writeFileSync("ancientworlds.json", strJson);
      logged = true;
      setTimeout(function() {
        process.exit();
      }, 5*1000);
    }
  };

  return {
    theWorld: theWorld,
    computeNextState: computeNextState,
    proposeAction: proposeAction,
    lastActions: lastActions,
    ancientWorlds: ancientWorlds
  };

}

module.exports.CreateGame = CreateGame;
