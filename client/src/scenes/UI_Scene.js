import Phaser from 'phaser';
import DialogueBox from '../ui/DialogueBox';

export default class UI_Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'UI_Scene', active: true }); // Always active once started
    }

    create() {
        // Create HUD container
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#ffffff' });

        // Create Dialogue Box
        this.dialogueBox = new DialogueBox(this);

        // Listen for game events
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.events.on('updateScore', this.updateScore, this);

            // Dialogue Events
            gameScene.events.on('showDialogue', (text, name) => {
                this.dialogueBox.show(text, name);
            });
            gameScene.events.on('hideDialogue', () => {
                this.dialogueBox.hide();
            });
        }
    }

    updateScore(score) {
        this.scoreText.setText(`Score: ${score}`);
    }
}
