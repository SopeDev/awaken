/*
* Asset from: https://kenney.nl/assets/pixel-platformer
*/
import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';
import Player from '../gameObjects/Player.js';

export class Game extends Phaser.Scene
{
    constructor()
    {
        super('Game');
    }

    create ()
    {
        this.initVariables();
        this.initGameUi();
        this.initAnimations();
        this.initInput();
        this.initMap();
        this.initPlayer();
    }

    update (time, delta)
    {
        if (!this.gameStarted) return;

        this.player.update(delta);
        this.checkHouseDoor();
    }

    // House door: tile (5, 6) is the bottom-center of the house — walkable; stepping onto it loads the Room
    checkHouseDoor ()
    {
        const tile = this.levelLayer.getTileAtWorldXY(this.player.x, this.player.y, true);
        if (!tile) return;
        if (tile.x === 5 && tile.y === 6) {
            this.scene.start('Room');
        }
    }

    initVariables ()
    {
        this.gameStarted = false;
        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;

        this.tileIds = {
            player: 96,
            // House door tile (5,6) uses index 79 — excluded so player can walk into the door and trigger Room
            walls: [ 45, 46, 47, 48, 53, 54, 55, 56, 57, 58, 59, 60, 65, 66, 67, 68, 69, 70, 71, 72, 77, 80, 81, 82, 83, 84 ]
        }

        this.playerStart = { x: 0, y: 0 };

        // used to generate random background image
        this.tiles = [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 44 ];
        this.tileSize = 32; // width and height of a tile in pixels
        this.halfTileSize = this.tileSize * 0.5; // width and height of a tile in pixels

        this.mapHeight = 11; // height of the tile map (in tiles)
        this.mapWidth = 11; // width of the tile map (in tiles)
        this.mapX = this.centreX - (this.mapWidth * this.tileSize * 0.5); // x position of the top-left corner of the tile map
        this.mapY = this.centreY - (this.mapHeight * this.tileSize * 0.5); // y position of the top-left corner of the tile map

        this.map; // rference to tile map
        this.groundLayer; // used to create background layer of tile map
        this.levelLayer; // reference to level layer of tile map
    }

    initGameUi ()
    {
        this.tutorialText = this.add.text(this.centreX, this.centreY, 'Arrow keys to move\nPress Spacebar to Start', {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100);
    }

    initAnimations ()
    {
        const playerAnimations = ANIMATION.player;
        for (const key in playerAnimations)
        {
            const animation = playerAnimations[ key ];

            this.anims.create({
                key: animation.key,
                frames: this.anims.generateFrameNumbers(animation.texture, animation.config),
                frameRate: animation.frameRate,
                repeat: animation.repeat
            });
        };

    }


    initPlayer ()
    {
        this.player = new Player(this, this.playerStart.x, this.playerStart.y);
        this.player.setInputController({
            isLocked: () => false,
            getMoveDirection: () =>
            {
                const cursors = this.cursors;
                const moveDirection = { x: 0, y: 0 };

                const leftKey = cursors.left.isDown;
                const rightKey = cursors.right.isDown;
                const upKey = cursors.up.isDown;
                const downKey = cursors.down.isDown;

                if (leftKey) moveDirection.x--;
                else if (rightKey) moveDirection.x++;
                else if (upKey) moveDirection.y--;
                else if (downKey) moveDirection.y++;

                return moveDirection;
            },
            isTileWalkable: (worldX, worldY) => this.getTileAt(worldX, worldY) === -1
        });
    }

    initInput ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();

        // check for spacebar press only once
        this.cursors.space.once('down', (key, event) =>
        {
            this.startGame();
        });
    }

    // create tile map data
    initMap ()
    {
        const mapData = [];

        for (let y = 0; y < this.mapHeight; y++)
        {
            const row = [];

            for (let x = 0; x < this.mapWidth; x++)
            {
                // randomly choose a tile id from this.tiles
                // weightedPick favours items earlier in the array
                const tileIndex = Phaser.Math.RND.weightedPick(this.tiles);

                row.push(tileIndex);
            }

            mapData.push(row);
        }
        this.map = this.make.tilemap({ key: ASSETS.tilemapTiledJSON.map.key });
        this.map.setCollision(this.tileIds.walls);
        const tileset = this.map.addTilesetImage(ASSETS.spritesheet.tiles.key);

        // create background layer
        this.groundLayer = this.map.createBlankLayer('ground', tileset, this.mapX, this.mapY);
        this.groundLayer.fill(0, 0, 0, this.mapWidth, this.mapHeight);
        // loop through map from bottom to top row
        for (let y = 0; y < this.mapHeight; y++)
        {
            // loop through map from left to right column
            for (let x = 0; x < this.mapWidth; x++)
            {
                const tile = this.groundLayer.getTileAt(x, y);
                tile.index = Phaser.Math.RND.weightedPick(this.tiles);
            }
        }

        // create level layer to show game level elements
        this.levelLayer = this.map.createLayer('level', tileset, this.mapX, this.mapY);
        // loop through map from bottom to top row
        for (let y = 0; y < this.mapHeight; y++)
        {
            // loop through map from left to right column
            for (let x = 0; x < this.mapWidth; x++)
            {
                const tile = this.levelLayer.getTileAt(x, y);
                if (!tile) continue

                if (tile.index === this.tileIds.player)
                {
                    tile.index = -1;
                    this.playerStart.x = x;
                    this.playerStart.y = y;
                }
            }
        }
    }

    startGame ()
    {
        this.gameStarted = true;
        this.tutorialText.setVisible(false);
    }

    getMapOffset ()
    {
        return {
            x: this.mapX + this.halfTileSize,
            y: this.mapY + this.halfTileSize,
            width: this.mapWidth,
            height: this.mapHeight,
            tileSize: this.tileSize
        }
    }

    getTileAt (x, y)
    {
        const tile = this.levelLayer.getTileAtWorldXY(x, y, true);
        return tile ? this.tileIds.walls.indexOf(tile.index) : -1;
    }
}
