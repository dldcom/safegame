export default class DialogueBox extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        this.setVisible(false); // 처음엔 숨김

        // --- Settings ---
        const width = scene.cameras.main.width - 100; // 좌우 여백 50씩
        const height = 150;
        const x = 50;
        const y = scene.cameras.main.height - height - 20; // 하단에서 20px 위
        const padding = 20;

        this.textSpeed = 30; // ms per char

        // 1. Background (Rounded Rectangle)
        this.background = scene.add.graphics();
        this.background.fillStyle(0x000000, 0.8); // Black, 80% opacity
        this.background.fillRoundedRect(0, 0, width, height, 15);
        this.background.lineStyle(3, 0xffffff, 1); // White border
        this.background.strokeRoundedRect(0, 0, width, height, 15);

        // 2. Name Text (Optional)
        this.nameText = scene.add.text(padding, padding, '', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffd700' // Gold color
        });

        // 3. Content Text
        this.messageText = scene.add.text(padding, padding + 40, '', {
            fontSize: '20px',
            fill: '#ffffff',
            wordWrap: { width: width - (padding * 2) },
            lineSpacing: 10
        });

        // 4. Next Icon (Blinking Arrow)
        this.nextIcon = scene.add.text(width - 40, height - 40, '▼', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.nextIcon.setVisible(false);

        // Add elements to container
        this.add(this.background);
        this.add(this.nameText);
        this.add(this.messageText);
        this.add(this.nextIcon);

        // Blink Animation
        scene.tweens.add({
            targets: this.nextIcon,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Position Container
        this.setPosition(x, y);

        // Add to Scene
        scene.add.existing(this);
        this.setScrollFactor(0); // 카메라 움직임 무시 (HUD)
        this.setDepth(100);      // 제일 위에 표시

        // Key Interaction
        this.isTyping = false;
        scene.input.keyboard.on('keydown-SPACE', () => {
            if (!this.visible) return;

            if (this.isTyping) {
                // Skip typing
                if (this.timedEvent) this.timedEvent.remove();
                this.messageText.setText(this.fullText);
                this.isTyping = false;
                this.nextIcon.setVisible(true); // Show icon when skipped
            } else {
                // Close dialogue
                this.hide();
            }
        });
    }

    // Show dialogue
    show(text, name = '') {
        this.nameText.setText(name);
        this.messageText.setText('');
        this.fullText = text;
        this.eventCounter = 0;
        this.visible = true;
        this.isTyping = true;
        this.nextIcon.setVisible(false);

        if (this.timedEvent) this.timedEvent.remove();

        this.timedEvent = this.scene.time.addEvent({
            delay: this.textSpeed,
            callback: this.animateText,
            callbackScope: this,
            loop: true
        });
    }

    animateText() {
        this.eventCounter++;
        this.messageText.setText(this.fullText.substr(0, this.eventCounter));

        if (this.eventCounter >= this.fullText.length) {
            this.timedEvent.remove();
            this.isTyping = false;
            this.nextIcon.setVisible(true);
        }
    }

    hide() {
        this.visible = false;
        this.nextIcon.setVisible(false);
        if (this.timedEvent) this.timedEvent.remove();
    }
}
