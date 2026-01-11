import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets needed for preloader (e.g., loading bar logo)
    }

    create() {
        this.scene.start('PreloaderScene');
    }
}
