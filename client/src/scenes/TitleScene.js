import Phaser from 'phaser';
import useGameStore from '../store/useGameStore';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        // Reset React UI State
        useGameStore.getState().setGameStarted(false);
        useGameStore.getState().setLobbyOpen(false);

        this.scene.stop('UI_Scene');
        const { width, height } = this.scale;

        // 1. Background Image with darkening
        const bg = this.add.image(width / 2, height / 2, 'title_bg');

        // Scale background to cover screen
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        bg.setTint(0x999999); // Slightly darken

        // 2. Game Title with RPG Style
        const titleText = this.add.text(width / 2, height / 2 - 80, 'SAFE GAME', {
            fontFamily: 'Galmuri11',
            fontSize: '84px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Subtitle/Edition text
        this.add.text(width / 2, height / 2, '2024 SAFETY ADVENTURE', {
            fontFamily: 'Galmuri11',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 3. Press to Start (Blinking)
        const startText = this.add.text(width / 2, height / 2 + 120, '- PRESS SPACE TO START -', {
            fontFamily: 'Galmuri11',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Blinking animation for start text
        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // 4. Footer info
        this.add.text(width / 2, height - 40, 'PRODUCED BY ANTIGRAVITY TEAM', {
            fontFamily: 'Galmuri11',
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Transition Logic
        const startGame = () => {
            // Flash effect before starting
            this.cameras.main.flash(500);
            this.time.delayedCall(500, () => {
                this.scene.start('LobbyScene');
            });
        };

        this.input.keyboard.once('keydown-SPACE', startGame);
        this.input.once('pointerdown', startGame);
    }
}
