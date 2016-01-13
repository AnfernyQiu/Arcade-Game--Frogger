function CanvasDisplay(parent, level) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = level.width * 101;
    this.canvas.height = 6 * 83 + 80;
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");
    this.level = level;
    this.flipPlayer = false;
    this.viewport = {
        left: 0,
        top: this.level.height - 7,
        //       top:1,
        width: this.level.width,
        height: 7,
        margin: 2
    };
}

CanvasDisplay.prototype.clear = function() {
    this.canvas.parentNode.removeChild(this.canvas);
};

CanvasDisplay.prototype.drawFrame = function(step) {
    this.updateViewport(step);
    this.drawBackground();
    this.drawActors();
    this.clearDisplay();
};

CanvasDisplay.prototype.updateViewport = function(step) {
    var view = this.viewport;
    var player = this.level.player;

    if (this.level.status == null && view.top > 0) {
        view.top = Math.max(view.top - 0.2 * step, 0);
    }

};

CanvasDisplay.prototype.clearDisplay = function() {
    var text;
    if (this.level.status == "won") {
        this.cx.fillStyle = "rgb(68, 191, 255)";
        text = "You Win!";
    } else if (this.level.status == "lost") {
        this.cx.fillStyle = "rgb(44, 136, 214)";
        text = "Oh NO...";
    }
    if (this.level.status != null) {
        this.cx.font = "28px Georgia";
        this.cx.fillStyle = "fuchsia";
        this.cx.textAlign = "center";
        this.cx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }

};


var grassSprites = document.createElement("img"),
    stoneSprites = document.createElement("img"),
    waterSprites = document.createElement("img"),
    selectorSprites = document.createElement("img"),
    obsRockSprites = document.createElement("img");

grassSprites.src = "images/grass-block.png";
stoneSprites.src = "images/stone-block.png";
waterSprites.src = "images/water-block.png";
obsRockSprites.src = "images/Rock.png";
selectorSprites.src = "images/Selector-new.png";

CanvasDisplay.prototype.drawBackground = function() {
    var view = this.viewport;
    var yStart = Math.max(Math.floor(view.top - 1.5), 0);
    var yEnd = Math.min(Math.ceil(view.top + view.height + 1.5), (view.top + view.height));

    for (var y = yStart; y < yEnd; y++) {
        for (var x = 0; x < this.level.width; x++) {
            var tile = this.level.grid[y][x],
                bgType = null;
            if (tile == "grass")
                bgType = grassSprites;
            else if (tile == "stone")
                bgType = stoneSprites;
            else if (tile == "water")
                bgType = waterSprites;
            else if (tile == "obsRock")
                bgType = obsRockSprites;
            else if (tile == "selector")
                bgType = selectorSprites;
            this.cx.drawImage(bgType, x * 101, (y - view.top) * 83);
        }
    }
};

CanvasDisplay.prototype.drawActors = function() {

    this.level.actors.forEach(function(actor) {
        var desX = actor.pos.x * 101;
        var desY = (actor.pos.y - this.viewport.top) * 83;
        if (actor.type == "player") {
            this.cx.drawImage(Resources.get(actor.sprite), desX, desY);
        } else if (actor.type == "enemy" && actor.pos.y >= (this.viewport.top - 1.5)) {
            this.cx.drawImage(Resources.get("images/enemy-bug.png"), desX, desY);
        } else if (actor.type == "item" && actor.pos.y >= (this.viewport.top - 1.5)) {
            this.cx.drawImage(Resources.get("images/Key-new.png"), desX, desY);
        }
    }, this);
};