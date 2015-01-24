"use strict";

var http = require("http");
var url = require("url");
var users = require("./users.js");
//var world = require("./world.js");
var game = require("./game.js");

// -----------------------------------------------------------------------------
// Configuration Variables
//------------------------------------------------------------------------------
var Config = {
  port: 8080,
  worldWidth: 10,
  worldHeight: 10
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var actions={"prova:1":{"entityId":1,"type":"move","x":5,"y":5}};
var entities={1:{"type":"human","x":1,"y":1},2:{"type":"human","x":1,"y":5}};

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

// -----------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

(function main() {
  // Initialize the game
  var theGame = game.CreateGame(Config);

  // Direct Access to TheWorld! [TODO: Remove?]
  var theWorld = theGame.theWorld;

  http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    if( url.parse(req.url).pathname === "/action" ){
      var queryData = url.parse(req.url, true).query;
      theWorld.setStatics(queryData.y, queryData.x, queryData.cose);
      res.write("done");
    }
    else if( url.parse(req.url).pathname === "/login" ){
      res.write(chLogin());
    }
    else if( url.parse(req.url).pathname === "/userlist" ){
      res.write(JSON.stringify({users: users.usersList}));
    }
    else if( url.parse(req.url).pathname === "/state" ){
      res.write(chState(theWorld));
    }
    else if( url.parse(req.url).pathname === "/entities" ){
      res.write(JSON.stringify({entities: entities}));
    }
    else if( url.parse(req.url).pathname === "/actions" ){
      res.write(JSON.stringify({actions: actions}));
    }
    else if( url.parse(req.url).pathname === "/tick" ){
      for(var action in actions){
        res.write(JSON.stringify(entities[actions[action]["entityId"]]));
      }
      actions={};
    }
    else if( url.parse(req.url).pathname === '/request' ){
      var queryData = url.parse(req.url, true).query;
      if(queryData.userId in users.usersList){
        if( !( queryData.userId+":"+queryData.entityId in actions)){
          actions[queryData.userId+":"+queryData.entityId]=queryData.action;
        }
        else{
          res.write("user already inserted an action for such entity");
        }
      }
      else{
        res.write("user not found");
      }
    }
    else{
      res.write("oh");
    }
    res.end();

  }).listen(Config.port);

  setInterval(theGame.computeNextState, 2*1000);

  console.log("Server listening on port " + Config.port);
})();
