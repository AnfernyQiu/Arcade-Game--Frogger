function Level(plan) {
    this.width = (plan.background)[0].length;
    this.height = plan.background.length;
    this.grid = [];
    this.actors = [];
    this.resArea = [];
    this.display = document.getElementById("gamePanel");
    this.gems = +$("#gems").text();

    for (var y = 0; y < this.height; y++) {
        var line = plan.background[y],
            gridLine = [];
        for (var x = 0; x < this.width; x++) {
            var ch = line[x],
                bgType = BgChars[ch];
            gridLine.push(bgType);
        }
        this.grid.push(gridLine);
    }

    for (var r = 0; r < this.height; r++) {
        var lineA = plan.actors[r];
        for (var g = 0; g < this.width; g++) {
            var chA = lineA[g],
                Actor = ActorChars[chA];
            if (Actor)
                this.actors.push(new Actor(new Vector(g, r), chA));
        }
    }

    for (var y = 1; y < 4; y++) {
        for (var x = 2; x < 5; x++) {
            this.resArea.push(new Vector(x, y));
        }
    }

    this.player = this.actors.filter(function(actor) {
        return actor.type == "player";
    })[0];

    this.status = this.finishDelay = null;

    this.paused = false;
}
var BgChars = {
    "g": "grass-block",
    "s": "Ramp South",
    "h": "water-block",
    "d": "Dirt Block",
    "n": "Ramp North",
    "r": "stone-block",
    "w": "Wood Block-new",
    "t": "Window Tall",
    "m": "Door Tall Closed",
    "f": "Roof South West",
    "o": "Roof South",
    "e": "Roof South East",
    "a": "Door Tall Open",
    "b": "blank",
    "c": "Tree Tall"
};

var ActorChars = {
    "c": Player,
    "o": Item,
    "b": Item,
    "g": Item,
    "k": Key,
    "e": Enemy,
    "E": Enemy,
    "t": Turtle,
    "T": Turtle
};

Level.prototype.isFinished = function() {
    return this.status != null && this.finishDelay < 0;
};

Level.prototype.obstacleAt = function(pos, size) {
    var playerXcenter = pos.x + 0.5;

    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);

    if (playerXcenter < 0 || playerXcenter > this.width)
        return "boundary";
    for (var y = yStart; y < yEnd; y++) {
        for (var x = xStart; x < xEnd; x++) {
            var fieldType = this.grid[y][x];
            if (fieldType == "water-block") return fieldType;
        }
    }
};

Level.prototype.actorAt = function(actor) {
    for (var i = 0; i < this.actors.length; i++) {
        var other = this.actors[i];
        if (other != actor &&
            actor.pos.x + actor.size.x - 13 / 101 > other.pos.x &&
            actor.pos.x + 13 / 101 < other.pos.x + other.size.x &&
            actor.pos.y == other.pos.y)
            return other;
    }
};

var maxStep = 0.05;

Level.prototype.animate = function(step, display) {
    if (this.status != null) {
        this.finishDelay -= step;
    }

    while (step > 0) {
        var thisStep = Math.min(step, maxStep);
        this.actors.forEach(function(actor) {
            if (actor.type == "player")
                actor.act(this, display);
            else if (actor.type !== "item" && actor.type !== "key")
                actor.act(thisStep, this);
        }, this);
        step -= thisStep;
    }
};

Level.prototype.playerTouched = function(type, actor) {
    if ((type == "boundary" || type == "enemy") && this.status == null) {
        this.status = "lost";
        this.finishDelay = 1;
    } else if (type == "water-block") {
        if (this.player.ride == false && this.status == null) {
            this.status = "lost";
            this.finishDelay = 1;
        }
    } else if (type == "turtle") {
        this.player.pos = actor.pos;
        this.player.ride = true;
    } else if (type == "item") {
        this.actors = this.actors.filter(function(other) {
            return other != actor;
        });
        document.getElementById("gems").innerHTML = ++this.gems;
    } else if (type == "key") {
        this.status = "won";
        this.finishDelay = 1;
    }
};

Level.prototype.notAtResArea = function(pos) {
    var at = true;
    this.resArea.forEach(function(area) {
        if (area.x == pos.x && area.y == pos.y)
            at = false;
    });
    return at;
};

function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
};

function Item(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "o") {
        this.sprite = 'character/Gem Orange.png';
    } else if (ch == "b") {
        this.sprite = 'character/Gem Blue.png';
    } else if (ch == "g") {
        this.sprite = 'character/Gem Green.png';
    }
}
Item.prototype.type = "item";

function Key(pos) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.sprite = 'character/Key.png';
}
Key.prototype.type = "key";

function Turtle(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "T") {
        this.speed = new Vector(1, 0);
        this.sprite = 'character/turtle-r.png';
    } else if (ch == "t") {
        this.speed = new Vector(-1, 0);
        this.sprite = 'character/turtle.png';
    }
}

Turtle.prototype.type = "turtle";

Turtle.prototype.act = function(step, level) {
    this.pos = this.pos.plus(this.speed.times(step));
    if (this.pos.x > level.width && this.speed.x > 0)
        this.pos.x = -1;
    else if (this.pos.x < -1 && this.speed.x < 0)
        this.pos.x = level.width;
};

function Enemy(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "E") {
        this.speed = new Vector(2, 0);
        this.sprite = 'character/bug-r.png';
    } else if (ch == "e") {
        this.speed = new Vector(-2, 0);
        this.sprite = 'character/bug-l.png';
    }
}

Enemy.prototype.type = "enemy";

Enemy.prototype.act = function(step, level) {
    this.pos = this.pos.plus(this.speed.times(step));
    if (this.pos.x > level.width && this.speed.x > 0)
        this.pos.x = -1;
    else if (this.pos.x < -1 && this.speed.x < 0)
        this.pos.x = level.width;
};


function Player(pos) {
    this.pos = pos;
    this.sprite = 'character/princess-girl.png';
    this.size = new Vector(1, 1);
    this.ride = false;
}
Player.prototype.type = "player";

Player.prototype.move = function(level, display) {
    var that = this;
    var viewPort = display.viewport;

    addEventListener("keydown", function(e) {
        e.preventDefault();
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            27: 'pause'
        };
        var key = allowedKeys[e.keyCode];
        if (level.status === null) {
            if (key == 'left' && that.pos.x > 0) {
                var temPos = that.pos.plus(new Vector(-1, 0));
                if (level.notAtResArea(temPos))
                    that.pos = temPos;
            } else if (key == 'right' && that.pos.x < viewPort.width - 1) {
                var temPos = that.pos.plus(new Vector(1, 0));
                if (level.notAtResArea(temPos))
                    that.pos = temPos;
            } else if (key == 'up' && that.pos.y > viewPort.top) {
                var temPos = that.pos.plus(new Vector(0, -1));
                if (level.notAtResArea(temPos))
                    that.pos = temPos;
                that.pos.x = Math.round(that.pos.x);
            } else if (key == 'down' && that.pos.y + 1 < viewPort.top + viewPort.height - viewPort.margin) {
                var temPos = that.pos.plus(new Vector(0, 1));
                if (level.notAtResArea(temPos))
                    that.pos = temPos;
                that.pos.x = Math.round(that.pos.x);
            }
        }

    });


};

Player.prototype.act = function(level, display) {
    var centerY = this.pos.y;
    var buttom = display.viewport.top + display.viewport.height - display.viewport.margin;
    if (level.status === null && centerY > buttom) {
        this.pos.x = Math.round(this.pos.x);
        this.pos.y -= 1;
    }
    var otherActor = level.actorAt(this);
    if (otherActor && level.status === null) {
        level.playerTouched(otherActor.type, otherActor);
    } else {
        this.ride = false;
    }

    var obstacle = level.obstacleAt(this.pos, this.size);
    if (obstacle)
        level.playerTouched(obstacle);

};

function runAnimation(frameFunc) {
    var lastTime = null;

    function frame(time) {
        var stop = false;
        if (lastTime !== null) {
            var timeStep = Math.min(time - lastTime, 100) / 1000;
            stop = frameFunc(timeStep) === false;
        }
        lastTime = time;
        if (!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function runLevel(level, Display, andThen) {
    var display = new Display(level.display, level);
    level.player.move(level, display);
    runAnimation(function(step) {
        level.animate(step, display);
        display.drawFrame(step);
        if (level.isFinished()) {
            display.clear();
            if (andThen)
                andThen(level.status);
            return false;
        }
    });
}

function RunGame(plans, Display) {
    this.plans = plans;
    this.display = Display;
    this.lifes = 3;
}

RunGame.prototype.startLevel = function(n) {
    var that = this;
    runLevel(new Level(this.plans[n]), this.display, function(status) {
        if (status == "lost" && that.lifes > 1) {
            $("#lifes").text(--that.lifes);
            $("#gems").text(0);
            that.startLevel(n);
        } else if (status == "lost" && that.lifes == 1) {
            endGame(status);
        } else if (n < that.plans.length - 1)
            that.startLevel(n + 1);
        else
            endGame(status);
    });
};

var game = new RunGame(GAME_LEVELS, CanvasDisplay);

function introGame() {
    function introOnce(e) {
        e.preventDefault();
        if (e.keyCode == 32) {
            $("div").remove(".intro");
            document.querySelector(".left").classList.remove("hidden");
            document.querySelector(".right").classList.remove("hidden");
            document.querySelector("#title").style.visibility="visible";
            game.startLevel(0);
            removeEventListener("keydown", introOnce);
        }
    }
    addEventListener("keydown", introOnce);
}

function endGame(status) {
    var $gamePanel = $("#gamePanel");
    var $winMes = HTMLwinMes.replace("%data%", $("#gems").text());
    var $loseMes = HTMLloseMes.replace("%data%", $("#gems").text());
    if (status == "lost") {
        $gamePanel.append(HTMLloseHeader)
            .append($loseMes);
    } else {
        $gamePanel.append(HTMLwinHeader)
            .append($winMes);
    }
    $gamePanel.append(HTMLreplay);

    function endOnce(e) {
        e.preventDefault();
        if (e.keyCode == 32) {
            $("#header").remove();
            $(".mes").remove();
            game.lifes = 3;
            $("#lifes").text(game.lifes);
            $("#gems").text(0);
            game.startLevel(0);
            removeEventListener("keydown", endOnce);
        }
    }
    addEventListener("keydown", endOnce);
}