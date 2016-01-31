/*canvas.js
 *Define an object type CanvasDisplay to draw the entire game
 *screen over and over, presenting the illusion of animation,
 *kind of like a flipbook.This object type has some methods: 
 *1.update the viewport 2.draw the background and actors(entities)
 *3.draw an ending screen once the game is over.
 */


/*Define an object type that draw the entire game screen,
 *it has an canvas and a viewport object that tracks the part of 
 *level we are currently looking at at grid level. Since the game
 *is a Y-axis one(width is fixed),the starting point of the viewport
 *is at the buttom of the game level.The canvas' width is multiplying
 *the grid width of the level by 101 pixels, it's height is nearly 7 
 *times of 83 pixels. And the viewport's size is correspond to the canvas'
 *size.
 */
function CanvasDisplay(parent, level) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = level.width * 101;
    this.canvas.height = 6 * 83 + 80;
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");
    this.level = level;
    this.viewport = {
        top: this.level.height - 7,
        width: this.level.width,
        height: 7,
        margin: 2
    };
}

//Remove the canvas from the DOM once the game is over.
CanvasDisplay.prototype.clear = function () {
    this.canvas.parentNode.removeChild(this.canvas);
};

/*Update the viewport with very small time step, and call
 *some methods to draw the backgournd and actors each frame.
 */
CanvasDisplay.prototype.drawFrame = function (step) {
    this.updateViewport(step);
    this.drawBackground();
    this.drawActors();
    this.clearDisplay();
};

/*Update the viewport's top position with very small time 
 *step(about 16ms),then the viewport is moving upwards.
 */
CanvasDisplay.prototype.updateViewport = function (step) {
    var view = this.viewport;

    /*viewport's top position should greater than 0.6 grid, 
     *otherwise we will darw the transparent background to 
     *the canvas.and it should not less than 0 once updated.
     */
    if (this.level.status === null && view.top > 0.6) {
        view.top = Math.max(view.top - 0.55 * step, 0);
    }

};

/*Draw some winning or losing words to the screen
 *once the game is over.
 */
CanvasDisplay.prototype.clearDisplay = function () {
    var text;
    if (this.level.status === "won") {
        this.cx.fillStyle = "#fff";
        text = "Level Clear!";
    } else if (this.level.status === "lost") {
        this.cx.fillStyle = "#a09";
        text = "Oh NO...";
    }
    if (this.level.status !== null) {
        this.cx.font = "80px Georgia";
        this.cx.textAlign = "center";
        this.cx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }

};

/*Extract the background tiles that are visible to the current
 *viewport at grid level, then draw them on the canvas one by one in
 *pixel level by multiplying the x coordinate by 101, and the 
 *y coordinate by 83. In y-axis, only 8-9 grids are to be drawn, so
 *before drawing to the canvas, we should decide the starting point and
 *ending point of the y coordinate in grid level. And because the viewport
 *tracks the current visible girds, calculating the starting point and
 *ending point of the girds' y coordinate is easy. In order to cover the
 *full canvas, we extract one more line grid to the top and to the buttom 
 *respectively. When drawn to the canvas, the image's Y coordinate in
 *the destination canvas is calculated by the related position to the 
 *viewport's top position, while X coordinate in the destionation canvas
 *is correspond to the coordinate in the grid level.
 */
CanvasDisplay.prototype.drawBackground = function () {
    var view = this.viewport;

    var yStart = Math.max(Math.floor(view.top - 1.5), 0);
    var yEnd = Math.min(Math.ceil(view.top + view.height + 1.5), (view.top + view.height));

    //draw on canvas
    for (var y = yStart; y < yEnd; y++) {
        for (var x = 0; x < this.level.width; x++) {
            var tile = this.level.background[y][x],
                sprite = "background/" + tile + ".png";
            this.cx.drawImage(Resources.get(sprite), x * 101, (y - view.top) * 83);
        }
    }
};
/*draw the actors(entities) on canvas,
 *if the y coordinate of the actor is 1.5 grids less than the
 *viewport's top position, we should start to draw it on the top 
 *of the canvas.
 */
CanvasDisplay.prototype.drawActors = function () {
    this.level.actors.forEach(function (actor) {
        var desX = actor.pos.x * 101;
        var desY = (actor.pos.y - this.viewport.top) * 83;
        if (actor.type === "player") {
            this.cx.drawImage(Resources.get(actor.sprite), desX, desY);
        } else if (actor.pos.y >= (this.viewport.top - 1.5)) {
            this.cx.drawImage(Resources.get(actor.sprite), desX, desY);
        }
    }, this);
};