import Phaser from 'phaser';

export default class Collectible extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this); // Dynamic Body

        this.type = type;
        this.setDepth(4); // Player is 5, Items are 4

        this.setImmovable(true); // Don't move when hit

        // Adjust hitbox based on type
        if (type === 'outlet') {
            this.setScale(1); // Adjust scale if needed
            this.body.setSize(32, 32);
        } else if (type === 'extinguisher') {
            this.setScale(1);
            this.body.setSize(32, 32);
        }
    }

    collect() {
        // disappear visual logic
        this.disableBody(true, true); // Hide and disable physics
    }
}
