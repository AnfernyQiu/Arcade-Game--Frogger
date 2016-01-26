/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */




    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        introGame();
    }



    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */


    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'background/grass-block.png',
        'background/Ramp South.png',
        'background/water-block.png',
        'background/Dirt Block.png',
        'background/Ramp North.png',
        'background/stone-block.png',
        'background/Wood Block-new.png',
        'background/Window Tall.png',
        'background/Door Tall Closed.png',
        'background/Roof South West.png',
        'background/Roof South.png',
        'background/Roof South East.png',
        'background/Door Tall Open.png',
        'background/blank.png',
        'background/Tree Tall.png',
        'character/bug-l.png',
        'character/bug-r.png',
        'character/cat-girl.png',
        'character/Gem Blue.png',
        'character/Gem Green.png',
        'character/Gem Orange.png',
        'character/Heart.png',
        'character/horn-girl.png',
        'character/princess-girl.png',
        'character/turtle-r.png',
        'character/turtle.png',
        'character/Key.png',
        'character/pink-girl.png',
        'character/arrow-fire.png',
        'character/arrow-fire-left.png',
        'character/bullet.png',
        'character/bullet-r.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
})(this);