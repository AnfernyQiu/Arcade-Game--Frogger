function CanvasDisplay(parent, level) {
  this.canvas = document.createElement("canvas");
  this.canvas.width = level.width * 101;
  this.canvas.height = level.height * 83 + 60;
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");
  this.level = level;
  this.flipPlayer = false;
}

CanvasDisplay.prototype.clear = function() {
  this.canvas.parentNode.removeChild(this.canvas);
};

CanvasDisplay.prototype.drawFrame = function() {
  this.drawBackground();
  this.drawActors();
};


var grassSprites = document.createElement("img"),
    stoneSprites= document.createElement("img"),
    waterSprites=document.createElement("img"),
    obsRockSprites=document.createElement("img");

    grassSprites.src = "images/grass-block.png";
    stoneSprites.src="images/stone-block.png";
    waterSprites.src="images/water-block.png";
    obsRockSprites.src="images/Rock.png";

CanvasDisplay.prototype.drawBackground = function() {
  for (var y = 0; y < this.level.height; y++) {
    for (var x = 0; x < this.level.width; x++) {
      var tile = this.level.grid[y][x], bgType=null;
			if (tile=="grass")
				bgType=grassSprites;
			else if(tile=="stone")
				bgType=stoneSprites;
			else if(tile=="water")
				bgType=waterSprites;
            else if(tile=="obsRock")
                bgType=obsRockSprites;
      this.cx.drawImage(bgType,x*101,y*83);
    }
  }
};

var playerSprites = document.createElement("img"),
    itemSprites=document.createElement("img"),
    enemySprites=document.createElement("img");
playerSprites.src = "images/char-horn-girl.png";
enemySprites.src="images/enemy-bug.png";
itemSprites.src="images/Key-new.png";

CanvasDisplay.prototype.drawPlayer = function(x, y) {

  this.cx.drawImage(playerSprites,x*101,y*83);

};

CanvasDisplay.prototype.drawActors = function() {
  this.level.actors.forEach(function(actor) {
    if (actor.type == "player") {
      this.drawPlayer(actor.pos.x, actor.pos.y);
    }
      else if(actor.type=="enemy"){
          this.cx.drawImage(enemySprites,actor.pos.x*101,actor.pos.y*83);
      }else if(actor.type=="item"){
          this.cx.drawImage(itemSprites,actor.pos.x*101,actor.pos.y*83);
      }
  }, this);
};
