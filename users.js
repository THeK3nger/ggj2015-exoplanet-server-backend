"use strict";

var usersList = {prova: 111};

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i = 0; i < 10; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function addUser() {
  var userId = makeid();
  usersList[userId] = Date.now();
  return userId;
}

module.exports.usersList = usersList;
module.exports.addUser = addUser;
