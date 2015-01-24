/***
 * World Actions
 */
 "use strict";

 var ActionsType = {
   MOVE: 0,
   COLLECT: 1
 };

function ActionBase(userID, agentID, actionID) {
  this.userID = userID;
  this.agentID = agentID;
  this.actionID = agentID;
}

function MoveAction(userID, agentID, direction) {
  var action = new ActionBase(userID, agentID, ActionsType.MOVE);
  action.direction = direction;
  return action;
}

function CollectAction(userID, agentID, targetID) {
  var action = new ActionBase(userID, agentID, ActionsType.COLLECT);
  action.target = targetID;
  return action;
}

module.exports.ActionsType = ActionsType;
module.exports.MoveAction = MoveAction;
module.exports.CollectAction = CollectAction;
