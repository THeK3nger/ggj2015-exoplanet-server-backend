"use strict";

var sprintf = require("./sprintf.js");


var usersList = {};

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i = 0; i < 10; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function addUser(username) {
  var userId = makeid();
  usersList[userId] = {username: username, time: Date.now()};
  return userId;
}

function userExists(userID) {
  return userID in usersList;
}

function frasariulum() {
  var frasarium = [
    "%1$s told me to burn things!",
    "Why are you doing this to me, %1$s?",
    "Every now and then, %1$s say something cool",
    "My precioussss! Me and %1$s will never let you go!",
    "I can see my master %1$s",
    "Lavalicius"];
  var listOfUsernames = []
  for (var key in usersList) {
    if (usersList.hasOwnProperty(key)) {
      listOfUsernames.push(usersList[key]);
    }
  }
  if (listOfUsernames.length === 0) {
    return "It is silent here, now...";
  }
  var randomPhrase = frasarium[Math.floor(Math.random() * frasarium.length)];
  var randomUser = listOfUsernames[Math.floor(Math.random() * listOfUsernames.length)];
  return sprintf.sprintf(randomPhrase, randomUser.username);
}

module.exports.userExists = userExists;
module.exports.usersList = usersList;
module.exports.addUser = addUser;
module.exports.frasariulum = frasariulum;
