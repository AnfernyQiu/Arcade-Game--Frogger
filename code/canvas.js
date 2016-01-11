function CanvasDisplay(parent, level) {
  this.canvas = document.createElement("canvas");
  this.canvas.width = level.width * 101;
  this.canvas.height = 6 * 83+600;
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");
  this.level = level;
  this.flipPlayer = false;
    this.viewport={
        left:0,
        top:0,
        width:this.level.width,
        height:6
    };
}

CanvasDisplay.prototype.clear = function() {
  this.canvas.parentNode.removeChild(this.canvas);
};

CanvasDisplay.prototype.drawFrame = function() {
    this.updateViewport();
  this.drawBackground();
  this.drawActors();
    this.clearDisplay();
};

CanvasDisplay.prototype.updateViewport=function(){
    var view=this.viewport, margin=3;
    var player=this.level.player;
    var centerY=player.pos.y;

    if(centerY<view.top+margin)
        view.top=Math.max(centerY-margin,0);
    else if (centerY>view.top+view.height-margin)
        view.top=Math.min(centerY+margin-view.height,
                          this.level.height-view.height);
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
    var view=this.viewport;
    var yStart=view.top;
    var yEnd=view.top+view.height;
    
  for (var y = yStart; y < yEnd; y++) {
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
      this.cx.drawImage(bgType,x*101,(y-view.top)*83);
    }
  }
};

CanvasDisplay.prototype.drawActors = function() {
    this.level.itemCollect.forEach(function(i){
        this.cx.drawImage(Resources.get('images/Key-new.png'),i*101,0);
    },this);

  this.level.actors.forEach(function(actor) {
      var desX=actor.pos.x*101;
      var desY=(actor.pos.y-this.viewport.top)*83;
    if (actor.type == "player") {
        this.cx.drawImage(Resources.get(actor.sprite),desX,desY);
    }
      else if(actor.type=="enemy"&&actor.pos.y>=this.viewport.top){
          this.cx.drawImage(Resources.get("images/enemy-bug.png"),desX,desY);
      }else if(actor.type=="item"&&actor.pos.y>=this.viewport.top){
          this.cx.drawImage(Resources.get("images/Key-new.png"),desX,desY);
      }
  }, this);
};
