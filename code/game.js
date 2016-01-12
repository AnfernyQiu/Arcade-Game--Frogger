function Level(plan){
	this.width=(plan.background)[0].length;
	this.height=plan.background.length;
	this.grid=[];
	this.actors=[];

	for (var y=0;y<this.height;y++){
		var line=plan.background[y],gridLine=[];
		for(var x=0;x<this.width;x++){
			var ch=line[x], bgType=null;
			if (ch=="g")
				bgType="grass";
			else if(ch=="r")
				bgType="stone";
			else if(ch=="h")
				bgType="water";
            else if(ch=="o")
                bgType="obsRock";
			gridLine.push(bgType);
		}
		this.grid.push(gridLine);
	}

	for (var r=0;r<this.height;r++){
		var lineA=plan.actors[r];
		for(var g=0;g<this.width;g++){
			var chA=lineA[g],Actor=ActorChars[chA];
			if(Actor)
				this.actors.push(new Actor(new Vector(g,r),chA));
		}
	}

	this.player=this.actors.filter(function(actor){
		return actor.type=="player";
	})[0];

	this.status=this.finishDelay=null;
    
    this.itemNum=this.actors.filter(function(actor){
        return actor.type=="item";
    }).length;
    
    this.itemCollect=[];
}

var ActorChars={
	"c":Player,
	"o":Item,
	"b":Item,
	"g":Item,
	"k":Item,
	"-":Enemy
};

Level.prototype.isFinished=function(){
	return this.status!=null && this.finishDelay<0;
};

Level.prototype.obstacleAt=function(pos,size){
    var xStart=Math.floor(pos.x);
    var xEnd=Math.ceil(pos.x+size.x);
    var yStart=Math.floor(pos.y);
    var yEnd=Math.ceil(pos.y+size.y);

    if(xStart<0||xEnd>this.width||yStart<0||yEnd>this.height)
        return "boundary";
    for(var y=yStart;y<yEnd;y++){
        for(var x=xStart;x<xEnd;x++){
            var fieldType=this.grid[y][x];
            if(fieldType=="water"||fieldType=="obsRock") return fieldType;
        }
    }
};

Level.prototype.actorAt=function(actor){
    for (var i=0;i<this.actors.length;i++){
        var other=this.actors[i];
        if(other!=actor&&
           actor.pos.x+actor.size.x>other.pos.x&&
           actor.pos.x<other.pos.x+other.size.x&&
           actor.pos.y+actor.size.y>other.pos.y&&
           actor.pos.y<other.pos.y+other.size.y)
        return other;
    }
};

var maxStep=0.05;

Level.prototype.animate=function(step){
    if(this.status!=null){
        this.finishDelay-=step;
    }

    while(step>0){
        var thisStep=Math.min(step,maxStep);
        this.actors.forEach(function(actor){
            if(actor.type=="player")
                actor.act(this,thisStep);
            else if(actor.type!=="item")
                actor.act(thisStep,this);
        },this);
        step-=thisStep;
    }
};

Level.prototype.playerTouched=function(type,actor){
    if(type=="enemy"&&this.status==null){
        this.status="lost";
        this.finishDelay=1;
    }else if(type=="item"&&this.player.holdItem==false){
        this.actors=this.actors.filter(function(other){
            return other!=actor;
        });
        this.player.holdItem=true;
        this.player.sprite='images/char-pink-girl-withKey.png';
    }
};

function Vector(x, y) {
  this.x = x; this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

function Item(pos,ch){
    this.pos=pos;
    this.size=new Vector(1,1);
    if(ch=="o"){
        this.sprite='images/Gem Orange-new.png';
    }else if(ch=="b"){
        this.sprite='images/Gem Blue-new.png';
    }else if(ch=="g"){
        this.sprite='images/Gem Green-new.png';
    }else if(ch=="k"){
        this.sprite='images/Key-new.png';
    }
}
Item.prototype.type="item";

function Enemy(pos){
    this.pos=pos;
    this.size=new Vector(1,1);
    this.speed=new Vector(1,0);
    this.sprite='images/enemy-bug.png';
    this.flip=false;
}
Enemy.prototype.type="enemy";

Enemy.prototype.act=function(step,level){
    var newPos=this.pos.plus(this.speed.times(step));
    if(!level.obstacleAt(newPos,this.size))
        this.pos=newPos;
    else{
        this.speed=this.speed.times(-1);
        this.flip=!this.flip;
    }
}

function Player(pos){
	this.pos=pos;
    this.temPos=pos;
	this.sprite='images/char-pink-girl.png';
    this.size=new Vector(1,1);
    this.holdItem=false;
}
Player.prototype.type="player";

Player.prototype.attempMove=function(){
    var that=this;
    addEventListener("keydown",function(e){
        e.preventDefault();
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        var key=allowedKeys[e.keyCode];
        if(key=='left') that.temPos=that.temPos.plus(new Vector(-1,0));
        if(key=='right') that.temPos=that.temPos.plus(new Vector(1,0));
        if(key=='up') that.temPos=that.temPos.plus(new Vector(0,-1));
        if(key=='down') that.temPos=that.temPos.plus(new Vector(0,1));
    });
};
Player.prototype.move=function(level){
    if(this.temPos.y==0&&level.itemCollect.indexOf(this.temPos.x)>-1)
        this.temPos=this.pos;
    else{
    var obstacle=level.obstacleAt(this.temPos,this.size);
    if(obstacle){
        this.temPos=this.pos;
        level.playerTouched(obstacle);
    }

    else
        this.pos=this.temPos;
    }

};

Player.prototype.act=function(level,step){
    this.move(level);

    var otherActor=level.actorAt(this);
    if(otherActor)
        level.playerTouched(otherActor.type, otherActor);

     if(this.pos.y==0&&this.holdItem==true){
        level.itemCollect.push(this.pos.x);
        this.holdItem=false;
         this.sprite='images/char-pink-girl.png';
         if(level.itemCollect.length==level.itemNum){
             level.status="won";
             level.finishDelay = 1;
         }
    }
    if(level.status=="lost"){
  //      level.finishDelay = 1;
    }
};

function runAnimation(frameFunc){
    var lastTime=null;
    function frame(time){
        var stop=false;
        if (lastTime!=null){
            var timeStep=Math.min(time-lastTime,100)/1000;
            stop=frameFunc(timeStep)===false;
        }
        lastTime=time;
        if(!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function runLevel(level,Display,andThen){
    var display=new Display(document.body,level);
    level.player.attempMove();
    runAnimation(function(step){
        level.animate(step);
        display.drawFrame(step);
        if(level.isFinished()){
            display.clear();
            if (andThen)
                andThen(level.status);
            return false;
        }
    });
}

function RunGame(plans,Display){
    this.plans=plans;
    this.display=Display;
    this.lifes=3;
}

RunGame.prototype.startLevel=function(n){
    var that=this;
    runLevel(new Level(this.plans[n]), this.display, function(status) {
      if (status == "lost"&&that.lifes>1){
          that.startLevel(n);
          document.getElementById("lifes").innerHTML=--that.lifes;
      }
        else if(status == "lost"&&that.lifes==1){
            console.log("You lose!");
        }
        else if (n < that.plans.length - 1)
        that.startLevel(n + 1);
      else
        console.log("You win!");
    });
}

var game= new RunGame(GAME_LEVELS, CanvasDisplay);
