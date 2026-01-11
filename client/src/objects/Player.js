import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    static createAnimations(scene) {
        // Create animations if they don't exist yet
        if (!scene.anims.exists('anim_down')) {
            scene.anims.create({
                key: 'anim_down',
                frames: scene.anims.generateFrameNumbers('character', { frames: [0, 1, 2, 1] }),
                frameRate: 8,
                repeat: -1
            });
            scene.anims.create({
                key: 'anim_left',
                frames: scene.anims.generateFrameNumbers('character', { frames: [3, 4, 5, 4] }),
                frameRate: 8,
                repeat: -1
            });
            scene.anims.create({
                key: 'anim_right',
                frames: scene.anims.generateFrameNumbers('character', { frames: [6, 7, 8, 7] }),
                frameRate: 8,
                repeat: -1
            });
            scene.anims.create({
                key: 'anim_up',
                frames: scene.anims.generateFrameNumbers('character', { frames: [9, 10, 11, 10] }),
                frameRate: 8,
                repeat: -1
            });
            console.log("Player animations created via Player class");
        }
    }

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.setDepth(5);
        this.setCollideWorldBounds(true);

        // Hitbox
        this.body.setSize(16, 20); // 2x scaled visual -> 32x40 body. Adjusted for small hitbox
        this.body.setOffset(8, 6); // To center

        this.isMyPlayer = false;
        this.speed = 300;
        this.oldPosition = { x: x, y: y };
    }

    update(cursors) {
        if (!this.isMyPlayer) return;

        const body = this.body;
        let moved = false;

        body.setVelocity(0);

        if (cursors.left.isDown) {
            body.setVelocityX(-this.speed);
            this.anims.play('anim_left', true);
            moved = true;
        } else if (cursors.right.isDown) {
            body.setVelocityX(this.speed);
            this.anims.play('anim_right', true);
            moved = true;
        }

        if (cursors.up.isDown) {
            body.setVelocityY(-this.speed);
            if (!cursors.left.isDown && !cursors.right.isDown) {
                this.anims.play('anim_up', true);
            }
            moved = true;
        } else if (cursors.down.isDown) {
            body.setVelocityY(this.speed);
            if (!cursors.left.isDown && !cursors.right.isDown) {
                this.anims.play('anim_down', true);
            }
            moved = true;
        }

        body.velocity.normalize().scale(this.speed);

        if (!moved) {
            this.anims.stop();
        }
    }
}
