/**
 * Contains data structures for handling the world and its components.
 */
"use strict";

var checkersMatrix = function(width, height) {
  var world_brutto = new Array(width);
  for (var i = 0; i < width; i++) {
    world_brutto[i] = new Array(height);
    for(var j =0;j<height;j++){
      if ((i+j)%2==0) {
        world_brutto[i][j]="1";
      } else {
        world_brutto[i][j]="0";
      }
    }
  }
  return world_brutto;
}

var idCounter = 0;

var AgentType = Object.freeze({
  BUILDING: 0,
  MAN: 1
});

var BuildingType = Object.freeze({
  BASE: 0,
  WOODPILE: 1
});

function CreateMan(position) {
  // Defaults
  position = position || {x: 0, y: 0}
  // --
  idCounter++;
  return {
    id: idCounter,
    type: AgentType.MAN,
    position: position,
    man: {
      energy: 100,
      health: 100,
      state: "ready", // or buisy
      inventory: []
    }
  };
}

function CreateBuilding(buildingType, position) {
  // Defaults
  position = position || {x: 0, y: 0};
  // --
  idCounter++;
  return {
    id: idCounter,
    type: AgentType.BUILDING,
    position: position,
    building: {
      type: buildingType
    }
  };
}

function World(width, height) {
  this.width = width;
  this.height = height;
  this.statics = checkersMatrix(width, height);
  this.dinamics = []
  this.agents = []

  this.agents.push(
    CreateBuilding(BuildingType.BASE,
      {x: width/2, y: 5}
    )
  );

  this.setStatics = function(r, c, value) {
    this.statics[c][r] = value;
  };
}

module.exports.World = World;
module.exports.AgentType = AgentType;
