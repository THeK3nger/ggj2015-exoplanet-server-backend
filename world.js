/**
 * Contains data structures for handling the world and its components.
 */
"use strict";

var actions = require("./actions.js");
var chalk = require('chalk');

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

var linearWorld = function(width, height) {
  var world_brutto = new Array(width);
  for (var i = 0; i < width; i++) {
    world_brutto[i] = new Array(height);
    for(var j =0;j<height;j++){
      if (i < 98 && j <= 4) {
        world_brutto[i][j]="3";
      } else if (j<4) {
        world_brutto[i][j]="1";
      } else if (j==4) {
        world_brutto[i][j]="2";
      } else {
        world_brutto[i][j]="0";
      }
    }
  }
  return world_brutto;
}

var idCounter = 0;

var AgentType = Object.freeze({
  BASE: 0,
  MAN: 1,
  WOODPILE: 2,
  HOUSE: 3,
  TREE: 4,
  GOAT: 5
});

var StaticType = Object.freeze({
  VOID: 0,
  GROUND: 1,
  LAVA: 3
});

function CreateMan(position) {
  // Defaults
  position = position || {x: 0, y: 0}
  // --
  idCounter++;
  return {
    id: idCounter.toString(),
    type: AgentType.MAN,
    position: position,
    man: {
      energy: 100,
      health: 100,
      state: "ready", // or buisy or dead
      inventory: []
    }
  };
}

function CreateDynamic(position, type) {
  // Defaults
  position = position || {x: 0, y: 0}
  // --
  idCounter++;
  return {
    id: idCounter.toString(),
    type: type,
    position: position
  };
}

function CreateBuilding(buildingType, position) {
  // Defaults
  position = position || {x: 0, y: 0};
  // --
  idCounter++;
  return {
    id: idCounter.toString(),
    type: buildingType,
    position: position,
  };
}

function World(width, height, config) {
  this.width = width;
  this.height = height;
  this.statics = linearWorld(width, height);
  this.dinamics = [];
  this.agents = [];
  this.gamestate = {
    day: 0,
    resources: {
      food: config.initialFood,
      wood: config.initialWood,
      houses: config.initialHouses
    }
  };
  this.alive = true;

  this.randomDynamics = function() {
    for (var i=0;i<config.initialTrees;i++) {
      var randomX = Math.floor(Math.random() * width);
      if (this.statics[randomX][config.floorLevel-1] === StaticType.LAVA.toString()) {
        i--;
      } else{
        this.dinamics.push(
          CreateDynamic({x: randomX, y: config.floorLevel},AgentType.TREE));
      }
    }
    for (var i=0;i<config.initialGoats;i++) {
      var randomX = Math.floor(Math.random() * width);
      if (this.statics[randomX][config.floorLevel-1] === StaticType.LAVA.toString() || !this.isFree({x: randomX, y: config.floorLevel })) {
        i--;
      } else{
        this.dinamics.push(
          CreateDynamic({x: randomX, y: config.floorLevel},AgentType.GOAT));
        }
      }
  }

  this.isFree = function(position) {
    var occupied = this.agents.some(function(item) {
      return item.position.x === position.x && item.position.y === position.y;
    });

    occupied = occupied || this.dinamics.some(function(item) {
      return item.position.x === position.x && item.position.y === position.y;
    });

    return !occupied;
  }

  this.setStatics = function(r, c, value) {
    this.statics[c][r] = value;
  };

  this.handleMoveAction = function(agent, action) {
    // PRECONDITIONS:
    if (agent.type !== AgentType.MAN || agent.man.health <= 0) {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }
    switch (action.direction) {
      case "left":
        agent.position.x -= 1;
        break;
      case "right":
        agent.position.x += 1;
        break;
      default:
        console.log(chalk.red("[ERROR] Bad Move Formatting"));
    }
    //TODO: Check State for collision/hazards/merda varia.
    if (this.statics[agent.position.x][agent.position.y-1] === StaticType.LAVA.toString()) {
      console.log(chalk.red("DEAD"));
      agent.man.health = 0;
    }
  };

  this.handleSpawnAction = function(agent, action) {
    // PRECONDITIONS:
    if (agent.type !== AgentType.BASE) {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }

    if (this.countMenAlive() >= this.gamestate.resources.houses) {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }

    this.gamestate.resources.food -= config.manSpawnCost;

    this.agents.push(
      CreateMan({x: agent.position.x+1, y: agent.position.y})
    );
  };

  this.handleBuildAction = function(agent, action) {
    // PRECONDITIONS:
    if (agent.type !== AgentType.MAN) {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }
    var occupied = this.agents.some(function(item) {
      return item.position.x === agent.position.x && item.position.y === agent.position.y;
    });

    occupied = occupied || this.dinamics.some(function(item) {
      return item.position.x === agent.position.x && item.position.y === agent.position.y;
    });

    if (occupied || this.gamestate.resources.wood < config.houseBuildingCost) {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }

    this.dinamics.push(
      CreateBuilding(AgentType.HOUSE,
        {x: agent.position.x, y: agent.position.y}
      )
    );
    this.gamestate.resources.houses += config.houseRoomsAmount;
    this.gamestate.resources.wood -= config.houseBuildingCost;
  };

  this.handleCollectAction = function(agent, action) {
    // PRECONDITIONS:
    if (agent.type !== AgentType.MAN) {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }

    var agentpos = this.dinamics.filter(function(item) {
      return item.position.x === agent.position.x && item.position.y === agent.position.y;
    }).pop();

    if (typeof agentpos === 'undefined') {
      console.log(chalk.red("[ERROR] Invalid Action"));
      return;
    }

    switch (agentpos.type) {
      case AgentType.TREE:
        agent.man.health -= config.woodCollectionDamage;
        this.gamestate.resources.wood += config.baseWoodCollection;
        var index = this.dinamics.indexOf(agentpos);
        if (index > -1) {
          this.dinamics.splice(index, 1);
        }
        break;
      case AgentType.GOAT:
        this.gamestate.resources.food += config.baseFoodCollection;
        agent.man.health -= config.foodCollectionDamage;
        var index = this.dinamics.indexOf(agentpos);
        if (index > -1) {
          this.dinamics.splice(index, 1);
        }
        break;
      default:
        console.log(chalk.red("[ERROR] Invalid Action"));
    }
  };

  // BIG BIG BAD BOY
  this.applyAction = function(action) {
    var agent = this.agents.filter(function(item) {
      return item.id === action.agentID;
    }).pop();
    var actionType = action.actionID;
    switch (actionType) {
      case actions.ActionsType.MOVE:
        this.handleMoveAction(agent, action);
        break;
      case actions.ActionsType.COLLECT:
        handleCollectAction(agent, action);
        break;
      case actions.ActionsType.SPAWN:
        this.handleSpawnAction(agent, action);
        break;
      case actions.ActionType.BUILD:
        this.handleBuildAction(agent, action);
        break;
      default:
        console.log(chalk.red("[ERROR] Unkown Action Type."));
    }
  };

  // BIG BIG BAD BOY
  this.applyAction = function(action) {
    var agent = this.agents.filter(function(item) {
      return item.id === action.agentID;
    }).pop();
    var actionType = action.actionID;
    switch (actionType) {
      case actions.ActionsType.MOVE:
        this.handleMoveAction(agent, action);
        break;
      case actions.ActionsType.COLLECT:
        this.handleCollectAction(agent, action);
        break;
      case actions.ActionsType.SPAWN:
        this.handleSpawnAction(agent, action);
        break;
      default:
        console.log(chalk.red("[ERROR] Unkown Action Type."));
      }
  };

  var isAlive = function(agent) {
    return agent.type === AgentType.MAN && agent.man.health > 0;
  };

  this.countMenAlive = function() {
    var alive = this.agents.filter(function(agent) {
      return isAlive(agent);
    });
    return alive.length;
  };

  this.isWorldAlive = function() {
    return this.countMenAlive() > 0 || this.gamestate.food >= config.manSpawnCost;
  };

  this.worldEvolution = function() {
    if (this.alive) {
      console.log(JSON.stringify(this.gamestate));
      // TIME IS BLOCKED UNTIL A NEW COLONY BEGINS!
      if (this.gamestate.day === 0 && this.countMenAlive() === 0) {
        console.log(chalk.green("WAITING FOR LIFE"));
        return;
      }
      this.gamestate.day += 1;

      /// ENERGY DROP.
      this.agents.forEach(function(agent) {
        if (agent.type === AgentType.MAN && agent.man.health > 0) {
          agent.man.energy -= config.energyConsumptionPerTurn;
          if (agent.man.energy <= 0) {
            agent.man.health = 0;
            console.log(chalk.red("STARVATION"));
          }
        }
      });

      this.gamestate.resources.food -= 1; // TODO: Boh. Let's see.

      // FOOD TIME!
      var gs = this.gamestate; //<--- HOLY SHIT!
      this.agents.forEach(function(agent) {
        if (agent.type === AgentType.MAN && agent.man.health > 0) {
          if (gs.resources.food > config.foodConsumptionPerTurn) {
            agent.man.energy += config.foodConsumptionPerTurn*config.foodEnergyConversionCoefficient;
            if (agent.man.energy >= 100) agent.man.energy = 100;
            gs.resources.food -= config.foodConsumptionPerTurn;
          } else {
            agent.man.energy += gs.resources.food*config.foodEnergyConversionCoefficient;
            if (agent.man.energy >= 100) agent.man.energy = 100;
            gs.resources.food = 0;
          }
        }
      });

      if (!this.isWorldAlive()) {
        this.alive = false;
        console.log(chalk.red("THE WORLD IS EXTINCT"));
      }
    }
  }

  // INIT
  this.agents.push(
    CreateBuilding(AgentType.BASE,
      {x: width/2, y: 5}
    )
  );

  this.randomDynamics();

}

module.exports.World = World;
module.exports.AgentType = AgentType;
