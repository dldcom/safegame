import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
    static createAnimations(scene) {
        // Base animations for the default 'princess' (guide NPC)
        if (scene.textures.exists('princess') && !scene.anims.exists('npc_down')) {
            const generateFrames = (row) => {
                const startFrame = row * 9;
                return scene.anims.generateFrameNumbers('princess', { start: startFrame + 1, end: startFrame + 8 });
            };

            scene.anims.create({ key: 'npc_up', frames: generateFrames(0), frameRate: 10, repeat: -1 });
            scene.anims.create({ key: 'npc_left', frames: generateFrames(1), frameRate: 10, repeat: -1 });
            scene.anims.create({ key: 'npc_down', frames: generateFrames(2), frameRate: 10, repeat: -1 });
            scene.anims.create({ key: 'npc_right', frames: generateFrames(3), frameRate: 10, repeat: -1 });
        }
    }

    static createDynamicAnimations(scene, textureKey) {
        const texture = scene.textures.get(textureKey);
        // [추가] 텍스처가 정상적으로 로드되지 않았거나 프레임이 없는 경우 건너뜀
        if (!texture || texture.key === '__MISSING' || texture.frameTotal <= 1) {
            console.warn(`>>> [NPC] Texture ${textureKey} is invalid or failed to load. Skipping animation creation.`);
            return;
        }

        const directions = ['down', 'up', 'right', 'left'];
        directions.forEach((dir, index) => {
            const animKey = `${textureKey}_${dir}`;
            if (!scene.anims.exists(animKey)) {
                scene.anims.create({
                    key: animKey,
                    frames: scene.anims.generateFrameNumbers(textureKey, { start: index * 6, end: index * 6 + 5 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        });
    }

    constructor(scene, x, y, texture, options = {}) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = options.type || 'static'; // 'static' or 'moving'
        this.displayName = options.displayName || 'NPC';
        this.atlasData = options.atlasData || null;

        this.setupPhysics();

        this.moveTimer = 0;
        this.moveDirection = 0;
        this.speed = options.speed || 50;
        this.talkCooldown = 0;

        // Custom texture animations
        if (texture.startsWith('db_npc_') || texture.startsWith('custom_')) {
            NPC.createDynamicAnimations(scene, texture);
            this.play(`${texture}_down`);
            this.stop();
        } else if (texture === 'princess') {
            this.play('npc_down');
            this.stop();
        }
    }

    setupPhysics() {
        this.setDepth(5);
        this.setImmovable(true);
        this.setCollideWorldBounds(true);

        // Default hitbox for 64x64 LPC sprites
        this.body.setSize(20, 20);
        this.body.setOffset(22, 44);
    }

    update(time, delta) {
        if (this.talkCooldown > 0) this.talkCooldown -= delta;
        if (this.type !== 'moving') return;

        this.moveTimer -= delta;
        if (this.moveTimer <= 0) {
            this.changeDirection();
            this.moveTimer = Phaser.Math.Between(1000, 3000);
        }

        this.applyMovement();
    }

    applyMovement() {
        const body = this.body;
        body.setVelocity(0);

        const isDbNpc = this.texture.key.startsWith('db_npc_') || this.texture.key.startsWith('custom_');
        const animPrefix = isDbNpc ? `${this.texture.key}_` : (this.texture.key === 'princess' ? 'npc_' : null);

        if (this.moveDirection === 1) { // Up
            body.setVelocityY(-this.speed);
            if (animPrefix) this.anims.play(animPrefix + 'up', true);
        } else if (this.moveDirection === 2) { // Down
            body.setVelocityY(this.speed);
            if (animPrefix) this.anims.play(animPrefix + 'down', true);
        } else if (this.moveDirection === 3) { // Left
            body.setVelocityX(-this.speed);
            if (animPrefix) this.anims.play(animPrefix + 'left', true);
        } else if (this.moveDirection === 4) { // Right
            body.setVelocityX(this.speed);
            if (animPrefix) this.anims.play(animPrefix + 'right', true);
        } else {
            this.anims.stop();
        }
    }

    changeDirection() {
        this.moveDirection = Math.random() < 0.4 ? 0 : Phaser.Math.Between(1, 4);
    }

    speak(message) {
        if (this.talkCooldown <= 0) {
            this.moveDirection = 0;
            this.body.setVelocity(0);
            this.anims.stop();

            this.scene.events.emit('showDialogue', message, this.displayName);
            this.talkCooldown = 3000;
            return true;
        }
        return false;
    }
}
