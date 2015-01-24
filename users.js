"use strict";

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

module.exports.userExists = userExists;
module.exports.usersList = usersList;
module.exports.addUser = addUser;
