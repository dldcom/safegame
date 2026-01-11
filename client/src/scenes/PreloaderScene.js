import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Load all game assets here
        // this.load.image('player', 'assets/player.png');
    }

    create() {
        this.scene.start('LobbyScene');
    }
}
