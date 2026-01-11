import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
    static createAnimations(scene) {
        if (!scene.anims.exists('npc_up')) {
            // 4 rows, 9 columns (0~8). Frame 40 not found error confirmed max frame is around 35.
            const generateFrames = (row) => {
                const startFrame = row * 9;
                return scene.anims.generateFrameNumbers('princess', { start: startFrame + 1, end: startFrame + 8 });
            };

            // LPC Order: Up(0), Left(1), Down(2), Right(3)
            scene.anims.create({ key: 'npc_up', frames: generateFrames(0), frameRate: 10, repeat: -1 });
            scene.anims.create({ key: 'npc_left', frames: generateFrames(1), frameRate: 10, repeat: -1 });
            scene.anims.create({ key: 'npc_down', frames: generateFrames(2), frameRate: 10, repeat: -1 });
            scene.anims.create({ key: 'npc_right', frames: generateFrames(3), frameRate: 10, repeat: -1 });
        }
    }

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1); // LPC sprites are already big (64x64)
        this.setDepth(5); // Make visible above ground
        this.setCollideWorldBounds(true);
        this.setImmovable(true); // Player cannot push NPC
        this.body.setSize(20, 20); // Small hitbox at feet
        this.body.setOffset(22, 44);

        this.moveTimer = 0;
        this.moveDirection = 0; // 0: stop, 1: up, 2: down, 3: left, 4: right
        this.speed = 50;
        this.talkCooldown = 0;

        // Start idle
        this.play('npc_down');
        this.stop();
    }

    update(time, delta) {
        // Dialogue Cooldown
        if (this.talkCooldown > 0) {
            this.talkCooldown -= delta;
        }

        // Random Movement Logic
        this.moveTimer -= delta;
        if (this.moveTimer <= 0) {
            this.changeDirection();
            this.moveTimer = Phaser.Math.Between(1000, 3000); // Change direction every 1-3 sec
        }

        // Apply Movement
        const body = this.body;
        body.setVelocity(0);

        if (this.moveDirection === 1) { // Up
            body.setVelocityY(-this.speed);
            this.anims.play('npc_up', true);
        } else if (this.moveDirection === 2) { // Down
            body.setVelocityY(this.speed);
            this.anims.play('npc_down', true);
        } else if (this.moveDirection === 3) { // Left
            body.setVelocityX(-this.speed);
            this.anims.play('npc_left', true);
        } else if (this.moveDirection === 4) { // Right
            body.setVelocityX(this.speed);
            this.anims.play('npc_right', true);
        } else {
            this.anims.stop();
        }
    }

    changeDirection() {
        // 40% chance to stop, 60% chance to move
        if (Math.random() < 0.4) {
            this.moveDirection = 0;
        } else {
            this.moveDirection = Phaser.Math.Between(1, 4);
        }
    }

    speak() {
        if (this.talkCooldown <= 0) {
            // Stop moving while talking
            this.moveDirection = 0;
            this.body.setVelocity(0);
            this.anims.stop();

            // Trigger Dialogue
            this.scene.events.emit('showDialogue', "어서 와! 여기는 안전 마을이야.\n과열된 콘센트를 끄려면 소화기가 필요해.\n북동쪽(오른쪽 위) 구석을 한번 찾아볼래?", "안전 지킴이");

            // Set cooldown (e.g., 3 seconds)
            this.talkCooldown = 3000;
        }
    }
}
