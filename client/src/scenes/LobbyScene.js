import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    create() {
        // Simple UI to start game
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2, 'Lobby Scene\nClick to Start', {
            fontSize: '32px',
            color: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
