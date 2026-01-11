import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Load all game assets here
        this.load.spritesheet('tiles', 'assets/tilesets/tileset_v2.png', {
            frameWidth: 32,
            frameHeight: 32,
            margin: 32
        });
        this.load.tilemapTiledJSON('map1', 'assets/maps/map1.json');

        // Load map specific tilesets
        this.load.image('Floor2', 'assets/tilesets/Floor2.png');
        this.load.image('Wall', 'assets/tilesets/Wall.png');

        // Load character spritesheet
        this.load.spritesheet('character', 'assets/sprites/character_4_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load NPC spritesheet (LPC Standard: 64x64)
        this.load.spritesheet('princess', 'assets/sprites/princess.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Load Safety Items
        this.load.image('outlet', 'assets/tilesets/멀티콘센트.png');
        this.load.image('extinguisher', 'assets/tilesets/소화기.png');
    }

    create() {
        console.log("Preloader finished. Starting TitleScene.");
        this.scene.start('TitleScene');
    }
}
