"use strict";

var http = require("http");
var url = require("url");
var users = require("./users.js");
var world = require("./world.js");

var Config = {
  port: 8080
};

var actions={"prova:1":{"entityId":1,"type":"move","x":5,"y":5}};
var entities={1:{"type":"human","x":1,"y":1},2:{"type":"human","x":1,"y":5}};

var theWorld = new world.World(10,10);

http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
  if( url.parse(req.url).pathname === "/action" ){
    var queryData = url.parse(req.url, true).query;
    theWorld.setStatics(queryData.y, queryData.x, queryData.cose);
    res.write("done");
  }
  else if( url.parse(req.url).pathname === "/login" ){
    var userid = users.addUser();
    res.write(JSON.stringify({userid: userid}));
  }
  else if( url.parse(req.url).pathname === "/userlist" ){
    res.write(JSON.stringify({users: users.usersList}));
  }
  else if( url.parse(req.url).pathname === "/state" ){
    res.write(JSON.stringify({world: theWorld}));
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
console.log("Server listening on port " + Config.port);
