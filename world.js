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

function World(width, height) {
  this.width = width;
  this.height = height;
  this.statics = checkersMatrix(width, height);

  this.setStatics = function(r, c, value) {
    this.statics[c][r] = value;
  };
}

module.exports.World = World;
