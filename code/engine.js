/* Engine.js
 * This file has been modified slightly, the game loop functionality(update 
 * entities and render) is replaced by other functions--runAnimation and 
 * canvasDisplay.
 * This file is only used to load images and game. When all of the
 * images are loaded,introGame function is called to load the game.
 */

var Engine = (function(global) {
    /* This function does some initial setup that should only occur once,
     * when images are loaded, the init function is kicked off to run the 
     * introGame function to load the game.
     */
    function init() {
        introGame();
    }
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
        'character/bullet-r.png',
        'character/esc.png'
    ]);
    Resources.onReady(init);
})(this);