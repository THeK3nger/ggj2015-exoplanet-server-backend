"use strict";

var world = require("./world.js");
var users = require("./users.js");

var CreateGame = function(config) {

  var theWorld = new world.World(config.worldWidth, config.worldHeight);

  var computeNextState = function() {
    console.log("New State! DING!");
  };


  return {
    theWorld: theWorld,
    computeNextState: computeNextState
  };

}

module.exports.CreateGame = CreateGame;
