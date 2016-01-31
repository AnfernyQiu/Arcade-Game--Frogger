/*game.js
 *This file define the driver of the game. It builds some 
 *classes and functions that would be used to run the game.
 */


/*This Vector type is used to groups x-coordinate and y-coordinate
 *(in grid)to an object. It has plus method that return new position,
 *times method that used to multiply a speed vector by a time interval
 *to get the distance traveled during that time.
 */
function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.prototype.plus = function (other) {
    return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function (factor) {
    return new Vector(this.x * factor, this.y * factor);
};

/*This constructor function build a level object:stores the
 *width and height of the current level in grid level, along
 *with 3 arrays: one for background, one for actors, and one
 *for restricted area.
 *The background array stores the background type of each grid
 *of the level;the actors array holds objects(moving elements
 *or collectable elements) that tracks the objects' current position
 *and state;the resArea array stores the restricted area of the 
 *level.
 *When the actors array is built, actor objects are also created.
 */
function Level(plan) {
    this.width = (plan.background)[0].length;
    this.height = plan.background.length;
    this.background = [];
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
        this.background.push(gridLine);
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

    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            if (plan.restArea[y][x] === "r")
                this.resArea.push(new Vector(x, y));
        }
    }
    //use filter method to find the player object.
    this.player = this.actors.filter(function (actor) {
        return actor.type === "player";
    })[0];
    /*status stands for whether the level is over or not, when the level is over, it will be set
     *to "won" or "lost". If level is over, the finishDelay will be set to 1 second to keep the 
     *level active for a short period.
     */
    this.status = this.finishDelay = null;
    //running means the level is running, not paused.
    this.running = true;
}

/*This object is used by Level constructor to associated the 
 *characters in plan[background] with the background type
 */
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

/*This object is used by Level constructor to associated the 
 *characters in plan[actors] with the actor constructor.
 */
var ActorChars = {
    "c": Player,
    "o": Item,
    "b": Item,
    "g": Item,
    "k": Key,
    "e": Bugl,
    "E": Bugr,
    "t": Turtle,
    "T": Turtle,
    "a": Arrowl,
    "A": Arrowr,
    "u": Bulletl,
    "U": Bulletr
};

//This method is used to find out whether a level is finished.
Level.prototype.isFinished = function () {
    return this.status !== null && this.finishDelay < 0;
};

/*This method finds out background that player object
 *is currently in. If the type is "water-block" or the player
 *hit the boundary of the screen, return the background type.
 */
Level.prototype.obstacleAt = function (pos, size) {
    var playerXcenter = pos.x + 0.5;

    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);

    if (playerXcenter < 0 || playerXcenter > this.width)
        return "boundary";
    for (var y = yStart; y < yEnd; y++) {
        for (var x = xStart; x < xEnd; x++) {
            var fieldType = this.background[y][x];
            if (fieldType == "water-block") return fieldType;
        }
    }
};

/*This method check for collision. It scans the arrays of actors,
 *looking for an actor that overlaps the one given as an argument.
 */
Level.prototype.actorAt = function (actor) {
    for (var i = 0; i < this.actors.length; i++) {
        var other = this.actors[i];
        if (other !== actor &&
            actor.pos.x + actor.size.x - 13 / 101 > other.pos.x &&
            actor.pos.x + 13 / 101 < other.pos.x + other.size.x &&
            actor.pos.y === other.pos.y)
            return other;
    }
};

//Define a max Time step(unit:second)
var maxStep = 0.05;

/*This method update the position of moving objects.
 *When the level is over, we must count down the finishDelay
 *property, which tracks the time between the point where 
 *winning or losing happens and the point where we want to
 *stop showing the level.
 */
Level.prototype.animate = function (step, display) {
    if (this.status != null) {
        this.finishDelay -= step;
    }
    /*The while loop cuts the time step into small pieces to ensure
     *that no time step larger than maxStep is taken. For example, a 
     *time step of 0.1 second would be cut into 2 steps of 0.05 second.
     *Each actor has a act method that take time step and level object as 
     *argumemts and compute the new position by adding the product of the 
     *time step and its current speed to its old position.
     */
    while (step > 0) {
        var thisStep = Math.min(step, maxStep);
        this.actors.forEach(function (actor) {
            if (actor.type === "player")
                actor.act(this, display);
            else if (actor.type !== "item" && actor.type !== "key")
                actor.act(thisStep, this);
        }, this);
        step -= thisStep;
    }
};

/*This method handles the collisions.
 *If the player hit the boundary or enemy, or the player enter into
 *water,level is over.If the player hit the turtle, he will ride on
 *it. If collectable item is touched, it is removed from the actors 
 *array and the score is updated. If the key is touched, level is 
 *over.
 */
Level.prototype.playerTouched = function (type, actor) {
    if ((type === "boundary" || type === "enemy") && this.status === null) {
        this.status = "lost";
        this.finishDelay = 1;
    } else if (type === "water-block") {
        if (this.player.ride === false && this.status === null) {
            this.status = "lost";
            this.finishDelay = 1;
        }
    } else if (type === "turtle") {
        this.player.pos = actor.pos;
        this.player.ride = true;
    } else if (type === "item") {
        this.actors = this.actors.filter(function (other) {
            return other !== actor;
        });
        document.getElementById("gems").innerHTML = ++this.gems;
    } else if (type === "key") {
        this.status = "won";
        this.finishDelay = 1;
    }
};

//Find out whether the current area is restricted or not.
Level.prototype.notAtResArea = function (pos) {
    var at = true;
    this.resArea.forEach(function (area) {
        if (area.x === pos.x && area.y === pos.y)
            at = false;
    });
    return at;
};

//Construct collectable items--colorful gems
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

//Construct collectable items--key
function Key(pos) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.sprite = 'character/Key.png';
}
Key.prototype.type = "key";

//Construct two types of turtle object
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

/*Update the position of turtle. If the turtle moves off the screen,
 *we put it to the other side of the screen.
*/
Turtle.prototype.act = function (step, level) {
    this.pos = this.pos.plus(this.speed.times(step));
    if (this.pos.x > level.width && this.speed.x > 0)
        this.pos.x = -1;
    else if (this.pos.x < -1 && this.speed.x < 0)
        this.pos.x = level.width;
};

/*A superclass called Enemy, has an act method that update
 *position.
 */
function Enemy(pos) {
    this.pos = pos;
    this.size = new Vector(1, 1);
}

Enemy.prototype.type = "enemy";

Enemy.prototype.act = function (step, level) {
    this.pos = this.pos.plus(this.speed.times(step));
    if (this.pos.x > level.width && this.speed.x > 0)
        this.pos.x = -1;
    else if (this.pos.x < -1 && this.speed.x < 0)
        this.pos.x = level.width;
};

//subclass of Enemy,moving from right to left
function Bugl(pos) {
    Enemy.call(this, pos);
    this.speed = new Vector(-2, 0);
    this.sprite = 'character/bug-l.png';
}

Bugl.prototype = Object.create(Enemy.prototype);
Bugl.prototype.constructor = Bugl;

//subclass of Enemy,moving from left to right
function Bugr(pos) {
    Enemy.call(this, pos);
    this.speed = new Vector(2, 0);
    this.sprite = 'character/bug-r.png';
}

Bugr.prototype = Object.create(Enemy.prototype);
Bugr.prototype.constructor = Bugr;

//subclass of Enemy,moving from right to left
function Arrowl(pos) {
    Enemy.call(this, pos);
    this.speed = new Vector(-4, 0);
    this.sprite = 'character/arrow-fire-left.png';
}

Arrowl.prototype = Object.create(Enemy.prototype);
Arrowl.prototype.constructor = Arrowl;

//subclass of Enemy,moving from left to right
function Arrowr(pos) {
    Enemy.call(this, pos);
    this.speed = new Vector(4, 0);
    this.sprite = 'character/arrow-fire.png';
}

Arrowr.prototype = Object.create(Enemy.prototype);
Arrowr.prototype.constructor = Arrowr;

//subclass of Enemy,moving from right to left
function Bulletl(pos) {
    Enemy.call(this, pos);
    this.speed = new Vector(-6, 0);
    this.sprite = 'character/bullet.png';
}

Bulletl.prototype = Object.create(Enemy.prototype);
Bulletl.prototype.constructor = Bulletl;

//subclass of Enemy,moving from left to right
function Bulletr(pos) {
    Enemy.call(this, pos);
    this.speed = new Vector(6, 0);
    this.sprite = 'character/bullet-r.png';
}

Bulletr.prototype = Object.create(Enemy.prototype);
Bulletr.prototype.constructor = Bulletr;

//construct player object, pick a random image from sprites array
function Player(pos) {
    this.pos = pos;
    this.sprites = ["cat", "horn", "pink", "princess"];
    this.sprite = "character/" + this.sprites[Math.floor(Math.random() * this.sprites.length)] + "-girl.png";
    this.size = new Vector(1, 1);
    this.ride = false;
}
Player.prototype.type = "player";

/*Update the player position when arrow keys are pressed.
 *We should ensure that the player will not go into the
 *restricted area or wil not move off the screen. And we
 *would not let the player close to the buttom edge of viewport
 *too by using viewport.margin.
*/
Player.prototype.move = function (level, display) {
    var that = this;
    var viewPort = display.viewport;

    addEventListener("keydown", function (e) {
        e.preventDefault();
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            27: 'pause'
        };
        var key = allowedKeys[e.keyCode];
        if ((level.status === null) && level.running) {
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

/*This method has some functionalities:1.move the player upwards if
 *the player is too close to the edge of the viewport, 2.check for 
 *collision between player and other objects and handle it if any.
 *3.check for the background the player is currently in and handle it.
*/
Player.prototype.act = function (level, display) {
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

/*Define a helper function that draw frames and let's call it
 *runAnimation, giving it a function that expects a time difference
 *as an argument and draws a single frame. When the frame function
 *return false,animation stops.
*/
function runAnimation(frameFunc) {
    var lastTime = null;

    function frame(time) {
        var stop = false;
        if (lastTime !== null) {
            var timeStep = Math.min(time - lastTime, 100) / 1000;
            stop = frameFunc(timeStep) === false;
        }
        lastTime = time; //set the lastTime with current time
        if (!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

/*This function takes a level object, a display constructor and
 *optionally,a function(andThen). It displays the level and lets
 *user play through it. Pause/unpause the game by pressing the Esc key.
 *When the level is finished(lost or won),runLevel clears the display,
 *stops the animation, and calls andThen function with level status.
*/
function runLevel(level, Display, andThen) {
    var display = new Display(level.display, level);
    level.player.move(level, display);

    function handleKey(e) {
        if (e.keyCode === 27) {
            if (level.running)
                level.running = false;
            else {
                level.running = true;
                runAnimation(animation);
            }

        }
    }

    addEventListener("keydown", handleKey);

    function animation(step) {
        if (!level.running)
            return false;

        level.animate(step, display);
        display.drawFrame(step);
        if (level.isFinished()) {
            display.clear();
            removeEventListener("keydown", handleKey);
            if (andThen)
                andThen(level.status);
            return false;
        }
    }
    runAnimation(animation);
}

/*This constructor function takes a plans object and a display
 *constructor to build a game object that has a property "lifes"
 *setting to 3.
*/

function RunGame(plans, Display) {
    this.plans = plans;
    this.display = Display;
    this.lifes = 3;
}

/*This method takes a number as argument and calls the runLevel 
 *function to run the nth level. Whenever the play dies, the level
 *is restarted. When a level is completed, we move on to next level.
 *When the game is over, it calls the endGame function that shows some
 *words on the screen and responds to user action.
*/
RunGame.prototype.startLevel = function (n) {
    var that = this;
    runLevel(new Level(this.plans[n]), this.display, function (status) {
        if (status === "lost" && that.lifes > 1) {
            $("#lifes").text(--that.lifes);
            $("#gems").text(0);
            that.startLevel(n);
        } else if (status === "lost" && that.lifes === 1) {
            endGame(status);
        } else if (n < that.plans.length - 1)
            that.startLevel(n + 1);
        else
            endGame(status);
    });
};

//Create a game object by using RunGame constructor.
var game = new RunGame(GAME_LEVELS, CanvasDisplay);

/*This function actually start the level.
 *If user presses spacebar key,this function will remove and display
 *something on the screen, and start level 1. Then remove the event
 *listener to prevent from starting level again when user presses the 
 *spacebar key.
*/
function introGame() {
    function introOnce(e) {
        e.preventDefault();
        if (e.keyCode == 32) {
            $("div").remove(".intro");
            document.querySelector(".left").classList.remove("hidden");
            document.querySelector(".right").classList.remove("hidden");
            document.querySelector("#title").style.visibility = "visible";
            game.startLevel(0);
            removeEventListener("keydown", introOnce);
        }
    }
    addEventListener("keydown", introOnce);
}

/*This function takes level status as argument to display something on
 *the screen when the game is over. when the user presses the spacebar
 *key, this function clears the screen, resets the counter of lifes, and
 *restarts the game.Then remove the event listener to prevent from starting
 *level again when spacebar key is pressed.
*/
function endGame(status) {
    var $gamePanel = $("#gamePanel");
    var $winMes = HTMLwinMes.replace("%data%", $("#gems").text());
    var $loseMes = HTMLloseMes.replace("%data%", $("#gems").text());
    if (status === "lost") {
        $gamePanel.append(HTMLloseHeader)
            .append($loseMes);
    } else {
        $gamePanel.append(HTMLwinHeader)
            .append($winMes);
    }
    $gamePanel.append(HTMLreplay);

    function endOnce(e) {
        e.preventDefault();
        if (e.keyCode === 32) {
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