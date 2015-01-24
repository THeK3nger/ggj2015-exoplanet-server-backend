"use strict";

var world = require("./world.js");
var users = require("./users.js");

var CreateGame = function(config) {

  var theWorld = new world.World(config.worldWidth, config.worldHeight);

  var actionBuffer = [];

  var computeNextState = function() {
    console.log("New State! DING!");
  };

  var proposeAction = function(action) {
    
  };

  return {
    theWorld: theWorld,
    computeNextState: computeNextState,
    proposeAction: proposeAction
  };

}

module.exports.CreateGame = CreateGame;
