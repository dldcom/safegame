import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Load tilemap
        // Load tilemap
        this.load.tilemapTiledJSON('stage_1', 'assets/maps/stage_1.json');

        // Load Tileset Images
        this.load.image('Wall', 'assets/tilesets/Wall.png');
        this.load.image('Floor2', 'assets/tilesets/Floor2.png');
        this.load.image('Exterior_Wall', 'assets/tilesets/Exterior_Wall.png');


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

        // --- Stage 1: Burn First Aid Assets ---
        // Path: assets/tilesets/stage_1/
        const stage1Path = 'assets/tilesets/stage_1/';
        this.load.image('water_bottle', stage1Path + 'water_bottle.png');
        this.load.image('gauze', stage1Path + 'gauze.png');
        this.load.image('sink', stage1Path + 'sink.png');
        this.load.image('ice_pack', stage1Path + 'ice_pack.png');
        this.load.image('toothpaste', stage1Path + 'toothpaste.png');
        this.load.image('doenjang', stage1Path + 'doenjang.png');
        this.load.image('needle', stage1Path + 'needle.png');

        // Stage 1 NPC States
        this.load.image('npc_hurt', stage1Path + 'npc_hurt.png');
        this.load.image('npc_recovered', stage1Path + 'npc_recovered.png');
    }

    create() {
        console.log("Preloader finished. Starting TitleScene.");
        this.scene.start('TitleScene');
    }
}
