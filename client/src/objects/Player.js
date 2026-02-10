import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    static createAnimations(scene, textureKey = 'character') {
        // 1. 기본 캐릭터 애니메이션 (48x64 규격으로 통일)
        if (textureKey === 'character' && !scene.anims.exists('anim_down')) {
            const configs = [
                { key: 'anim_down', row: 0 },
                { key: 'anim_up', row: 1 },
                { key: 'anim_right', row: 2 },
                { key: 'anim_left', row: 3 }
            ];
            configs.forEach(config => {
                scene.anims.create({
                    key: config.key,
                    frames: scene.anims.generateFrameNumbers('character', {
                        start: config.row * 6,
                        end: config.row * 6 + 5
                    }),
                    frameRate: 10,
                    repeat: -1
                });
            });
            console.log(`>>> [Player] Basic animations created for 'character' (48x64)`);
        }

        // 2. 커스텀 캐릭터 애니메이션 (텍스처 로드 시마다 해당 키 기반으로 생성)
        if (textureKey && textureKey.startsWith('custom_') && !scene.anims.exists(`${textureKey}_down`)) {
            const customConfigs = [
                { key: 'down', row: 0 },
                { key: 'up', row: 1 },
                { key: 'right', row: 2 },
                { key: 'left', row: 3 }
            ];
            customConfigs.forEach(config => {
                scene.anims.create({
                    key: `${textureKey}_${config.key}`,
                    frames: scene.anims.generateFrameNumbers(textureKey, {
                        start: config.row * 6,
                        end: config.row * 6 + 5
                    }),
                    frameRate: 10,
                    repeat: -1
                });
            });
            console.log(`>>> [Player] Animations created for texture: ${textureKey}`);
        }
    }

    constructor(scene, x, y, texture, options = {}) {
        super(scene, x, y, texture);

        const {
            isMyPlayer = false,
            username = '알 수 없음',
            color = 0xffffff,
            skin = 'skin_default',
            titleName = ''
        } = options;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isMyPlayer = isMyPlayer;
        this.username = username;
        this.color = color;
        this.skin = skin;
        this.titleName = titleName;
        this.speed = 300;
        this.textureKey = texture; // 현재 텍스처 키 저장

        // 해당 텍스처에 대한 애니메이션 생성 확인
        Player.createAnimations(scene, texture);

        this.applySkinEffect();
        this.setupPhysics();
        this.addNameTag();
        this.createAura(); // [추가] 오라 효과 생성
    }

    createAura() {
        if (this.skin === 'skin_default') return;

        // 입자용 베이스 텍스처 생성 (이미 존재하지 않을 때만)
        if (!this.scene.textures.exists('aura_particle')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('aura_particle', 8, 8);
            graphics.destroy();
        }

        let auraColor;
        let auraAlpha = { start: 0.8, end: 0 };
        let auraScale = { start: 0.8, end: 0.2 };

        if (this.skin === 'skin_fire') auraColor = 0xff5c00;
        else if (this.skin === 'skin_water') auraColor = 0x00f2ff;
        else if (this.skin === 'skin_gold') auraColor = 0xffd700;

        this.auraEmitter = this.scene.add.particles(0, 0, 'aura_particle', {
            speed: { min: 50, max: 120 }, // 속도를 대폭 높여 빵! 퍼지게 함
            angle: { min: 0, max: 360 }, // 모든 방향으로 발사
            scale: auraScale,
            alpha: auraAlpha,
            lifespan: { min: 800, max: 1200 }, // 넓은 범위로 퍼지도록 수명 조절
            frequency: 40,
            blendMode: 'ADD',
            tint: auraColor,
            follow: this,
            maxAliveParticles: 150 // 입자 수 상향
            // emitZone 제거: 중앙에서 사방으로 확산
        });

        // 캐릭터 뒤로 오라가 보이게 레이어 조정
        this.auraEmitter.setDepth(this.depth - 1);
    }

    applySkinEffect() {
        if (this.skin === 'skin_fire') {
            this.setTint(0xff5c00);
        } else if (this.skin === 'skin_water') {
            this.setTint(0x00f2ff);
        } else if (this.skin === 'skin_gold') {
            this.setTint(0xffd700);
            // 금색은 반짝이는 효과를 위해 약간의 밝기 추가 (Phaser에서 지원하는 다른 방식이 있으면 좋지만 여기선 틴트로)
        } else {
            this.clearTint();
        }
    }

    setupPhysics() {
        // [수정] 모든 플레이어 캐릭터(기본/커스텀)가 48x64 규격이므로 스케일 1.0으로 통일
        this.setScale(1.0);
        this.setDepth(100);
        this.setCollideWorldBounds(true);

        // 히트박스를 캐릭터 발밑으로 내리기 위해 Offset Y를 크게 설정 (48x64 원본 기준)
        this.body.setSize(30, 20);
        this.body.setOffset(9, 44);
    }

    addNameTag() {
        // 색상 형식을 CSS 호환형으로 변환 (숫자 -> #hex)
        const hexColor = '#' + this.color.toString(16).padStart(6, '0');

        this.nameTag = this.scene.add.text(this.x, this.y - 45, this.username, {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: hexColor,
            padding: { x: 6, y: 3 },
            fontFamily: 'Galmuri11, "Noto Sans KR", Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);

        // [추가] 칭호 표시
        if (this.titleName) {
            this.titleTag = this.scene.add.text(this.x, this.y - 70, `[${this.titleName}]`, {
                fontSize: '12px',
                fill: '#ffdb58', // 금색 느낌의 칭호 색상
                fontFamily: 'Galmuri11, "Noto Sans KR", Arial',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(200);
        }
    }

    update(cursors, joystick) {
        // Update name tag position
        if (this.nameTag) {
            this.nameTag.setPosition(this.x, this.y - 45);
        }
        if (this.titleTag) {
            this.titleTag.setPosition(this.x, this.y - 70);
        }

        // [최적화] 원거리 컬링: 카메라 뷰 안에 있을 때만 오라 파티클 작동
        if (this.auraEmitter) {
            const cam = this.scene.cameras.main;
            const inView = cam.worldView.contains(this.x, this.y);

            // 화면 안에 있으면 재생(false), 화면 밖이면 정지(true)
            if (this.auraEmitter.paused === inView) {
                this.auraEmitter.setPaused(!inView);
            }
        }

        if (!this.isMyPlayer) return;

        const body = this.body;
        let moved = false;
        let vx = 0;
        let vy = 0;

        this.isCrouched = cursors && cursors.shift && cursors.shift.isDown;
        const currentSpeed = this.isCrouched ? this.speed * 0.5 : this.speed;

        if (this.isCrouched) {
            this.setScale(1.0, 0.6); // 수직 압축
            this.body.setSize(30, 12);
            this.body.setOffset(9, 52); // 발밑으로 더 내림
        } else {
            this.setScale(1.0);
            this.body.setSize(30, 20);
            this.body.setOffset(9, 44);
        }

        if (cursors) {
            if (cursors.left.isDown) vx = -currentSpeed;
            else if (cursors.right.isDown) vx = currentSpeed;
            if (cursors.up.isDown) vy = -currentSpeed;
            else if (cursors.down.isDown) vy = currentSpeed;
        }

        if (vx === 0 && vy === 0 && joystick && joystick.active) {
            vx = joystick.forceX * currentSpeed;
            vy = joystick.forceY * currentSpeed;
        }

        body.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            moved = true;
            body.velocity.normalize().scale(currentSpeed);

            const isCustom = this.textureKey.startsWith('custom_');
            const prefix = isCustom ? `${this.textureKey}_` : 'anim_';
            if (Math.abs(vx) > Math.abs(vy)) {
                if (vx < 0) this.anims.play(prefix + 'left', true);
                else this.anims.play(prefix + 'right', true);
            } else {
                if (vy < 0) this.anims.play(prefix + 'up', true);
                else this.anims.play(prefix + 'down', true);
            }

            this.anims.timeScale = this.isCrouched ? 0.5 : 1;
        }

        if (!moved) this.anims.stop();
    }

    // 외부에서 다른 플레이어의 애니메이션을 업데이트할 때 사용
    updateRemoteAnimation(vx, vy) {
        if (vx !== 0 || vy !== 0) {
            const isCustom = this.textureKey.startsWith('custom_');
            const prefix = isCustom ? `${this.textureKey}_` : 'anim_';
            if (Math.abs(vx) > Math.abs(vy)) {
                if (vx < 0) this.anims.play(prefix + 'left', true);
                else this.anims.play(prefix + 'right', true);
            } else {
                if (vy < 0) this.anims.play(prefix + 'up', true);
                else this.anims.play(prefix + 'down', true);
            }
        } else {
            this.anims.stop();
        }
    }

    destroy() {
        if (this.nameTag) this.nameTag.destroy();
        if (this.titleTag) this.titleTag.destroy();
        if (this.auraEmitter) this.auraEmitter.destroy();
        super.destroy();
    }
}
