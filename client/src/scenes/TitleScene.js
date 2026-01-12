import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        this.scene.stop('UI_Scene'); // Ensure UI is hidden in Lobby

        // Simple Title Screen
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Safety Game', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Press Space to Start', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('LobbyScene'); // Go to Lobby first
        });
    }
}
