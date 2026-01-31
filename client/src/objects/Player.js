import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    static createAnimations(scene) {
        if (!scene.anims.exists('anim_down')) {
            const configs = [
                { key: 'anim_down', frames: [0, 1, 2, 1] },
                { key: 'anim_left', frames: [3, 4, 5, 4] },
                { key: 'anim_right', frames: [6, 7, 8, 7] },
                { key: 'anim_up', frames: [9, 10, 11, 10] }
            ];

            configs.forEach(config => {
                scene.anims.create({
                    key: config.key,
                    frames: scene.anims.generateFrameNumbers('character', { frames: config.frames }),
                    frameRate: 8,
                    repeat: -1
                });
            });
            console.log("Player animations created");
        }
    }

    constructor(scene, x, y, texture, isMyPlayer = false) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isMyPlayer = isMyPlayer;
        this.speed = 300;
        this.oldPosition = { x: x, y: y };

        this.setupPhysics();
    }

    setupPhysics() {
        this.setScale(2);
        this.setDepth(5);
        this.setCollideWorldBounds(true);

        // Centralized Hitbox Configuration
        this.body.setSize(16, 20);
        this.body.setOffset(8, 6);
    }

    update(cursors, joystick) {
        if (!this.isMyPlayer) return;

        const body = this.body;
        let moved = false;
        let vx = 0;
        let vy = 0;

        // Crouch Logic (Shift Key)
        this.isCrouched = cursors && cursors.shift && cursors.shift.isDown;
        const currentSpeed = this.isCrouched ? this.speed * 0.5 : this.speed;

        // Visual feedback for crouch
        if (this.isCrouched) {
            this.setScale(2, 1.2);
            this.body.setSize(16, 12);
            this.body.setOffset(8, 14);
        } else {
            this.setScale(2, 2);
            this.body.setSize(16, 20);
            this.body.setOffset(8, 6);
        }

        // 1. Check Keyboard
        if (cursors) {
            if (cursors.left.isDown) vx = -currentSpeed;
            else if (cursors.right.isDown) vx = currentSpeed;

            if (cursors.up.isDown) vy = -currentSpeed;
            else if (cursors.down.isDown) vy = currentSpeed;
        }

        // 2. Check Joystick (if no keyboard input)
        if (vx === 0 && vy === 0 && joystick && joystick.active) {
            vx = joystick.forceX * currentSpeed;
            vy = joystick.forceY * currentSpeed;
        }

        body.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            moved = true;
            // Normalize for diagonal movement
            body.velocity.normalize().scale(currentSpeed);

            // Set Animations based on dominant direction
            if (Math.abs(vx) > Math.abs(vy)) {
                if (vx < 0) this.anims.play('anim_left', true);
                else this.anims.play('anim_right', true);
            } else {
                if (vy < 0) this.anims.play('anim_up', true);
                else this.anims.play('anim_down', true);
            }

            // Slower animation when crouching
            if (this.isCrouched) {
                this.anims.timeScale = 0.5;
            } else {
                this.anims.timeScale = 1;
            }
        }

        if (!moved) {
            this.anims.stop();
        }
    }
}
