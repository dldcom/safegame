import Phaser from 'phaser';
import useGameStore from '../store/useGameStore';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        useGameStore.getState().setGameStarted(false);
        useGameStore.getState().setLobbyOpen(false);
        this.scene.stop('UI_Scene');

        this.render();

        this.scale.on('resize', () => {
            this.scene.restart();
        });
    }

    render() {
        const { width, height } = this.scale;
        const isPortrait = height > width;

        // 1. Background Logic: 꽉 채우되 과하게 확대되지 않도록 조정
        const bg = this.add.image(width / 2, height / 2, 'title_bg');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const bgScale = Math.max(scaleX, scaleY); // Cover
        bg.setScale(bgScale).setTint(0x888888);

        // 2. Responsive Text Scaling (글씨가 모바일에서 너무 작아지지 않게 보정)
        // 세로 화면일 때는 가로 비율을 더 적극적으로 반영하여 글씨를 키웁니다.
        let textScale = isPortrait ? (width / 600) : (width / 1280);
        textScale = Math.max(textScale, 0.6); // 최소 크기 제한

        // 3. Game Title
        const titleText = this.add.text(width / 2, height / 2 - (150 * textScale), 'SAFE GAME', {
            fontFamily: 'Galmuri11',
            fontSize: `${100 * textScale}px`, // 글씨 크기 대폭 상향
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 10 * textScale,
            shadow: { offsetX: 4, offsetY: 4, color: '#000', fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - (40 * textScale), '2024 SAFETY ADVENTURE', {
            fontFamily: 'Galmuri11',
            fontSize: `${32 * textScale}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4 * textScale
        }).setOrigin(0.5);

        // 4. Start Button (더 크게, 더 잘 보이게)
        const startText = this.add.text(width / 2, height / 2 + (120 * textScale), '- TOUCH TO START -', {
            fontFamily: 'Galmuri11',
            fontSize: `${42 * textScale}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5 * textScale
        }).setOrigin(0.5);

        this.tweens.add({ targets: startText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

        // 5. Footer
        this.add.text(width / 2, height - 50, 'PRODUCED BY ANTIGRAVITY TEAM', {
            fontFamily: 'Galmuri11',
            fontSize: `${18 * textScale}px`,
            color: '#aaaaaa'
        }).setOrigin(0.5);

        const startGame = () => {
            this.cameras.main.flash(500);
            this.time.delayedCall(500, () => this.scene.start('LobbyScene'));
        };

        this.input.keyboard.once('keydown-SPACE', startGame);
        this.input.once('pointerdown', startGame);
    }
}
