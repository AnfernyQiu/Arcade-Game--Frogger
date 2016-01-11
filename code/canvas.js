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
    this.clearDisplay();
};

CanvasDisplay.prototype.clearDisplay = function() {
    var text;
  if (this.level.status == "won"){
       this.cx.fillStyle = "rgb(68, 191, 255)";
        text="You Win!";
  }
  else if (this.level.status == "lost"){
       this.cx.fillStyle = "rgb(44, 136, 214)";
      text="Oh NO...";
  }
    
    if (this.level.status!=null){
    this.cx.font = "28px Georgia";
    this.cx.fillStyle = "fuchsia";
    this.cx.textAlign = "center";
  this.cx.fillText(text, this.canvas.width/2, this.canvas.height/2);
    }
 
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


CanvasDisplay.prototype.drawActors = function() {
    this.level.itemCollect.forEach(function(i){
        this.cx.drawImage(Resources.get('images/Key-new.png'),i*101,0);
    },this);

  this.level.actors.forEach(function(actor) {
    if (actor.type == "player") {
        this.cx.drawImage(Resources.get(actor.sprite),actor.pos.x*101, actor.pos.y*83);
    }
      else if(actor.type=="enemy"){
          this.cx.drawImage(enemySprites,actor.pos.x*101,actor.pos.y*83);
      }else if(actor.type=="item"){
          this.cx.drawImage(itemSprites,actor.pos.x*101,actor.pos.y*83);
      }
  }, this);
};
