import Phaser from 'phaser';

export default class Collectible extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.setupPhysics();
    }

    setupPhysics() {
        this.setDepth(4);
        this.setImmovable(true);
        this.setScale(1);

        // Adjust hitbox (can be expanded based on asset dimensions)
        this.body.setSize(this.width, this.height);

        // Special case overrides if needed
        if (this.type === 'outlet' || this.type === 'extinguisher') {
            this.body.setSize(32, 32);
        }
    }

    collect() {
        this.disableBody(true, true);
    }
}
