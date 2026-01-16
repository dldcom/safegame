import Phaser from 'phaser';
import { STAGE_1_ITEMS } from '../data/Stage1Data';
import useGameStore, { isUIOpen } from '../store/useGameStore';

export default class UI_Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'UI_Scene', active: true });
        this.resetState();
    }

    resetState() {
        this.canInput = true;
        this.maxHearts = 3;

        // Joystick State
        this.joystick = {
            active: false,
            forceX: 0,
            forceY: 0
        };
    }

    create() {
        this.input.addPointer(2);
        this.uiElements = {};

        this.createJoystick();
        // createActionButton() was removed - now handled by React

        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.events.on('updateHearts', (count) => {
                useGameStore.getState().setHearts(count);
            });
            gameScene.events.on('updateInventory', (items) => {
                if (items) useGameStore.getState().setInventory(items);
            });
            gameScene.events.on('showDialogue', (t, n) => {
                useGameStore.getState().showDialogue(t, n);
                this.toggleJoystick(false);
            });
            gameScene.events.on('openItemSelector', (data) => this.createItemSelector(data.inventory, data.callbackEvent, "사용할 아이템을 선택하세요"));
            gameScene.events.on('openQuiz', (quizData) => this.startQuiz(quizData));
        }

        this.events.on('dialogueEnded', () => {
            this.toggleJoystick(true);
            useGameStore.getState().hideDialogue();
            const gameScene = this.scene.get('GameScene');
            if (gameScene) gameScene.events.emit('uiDialogueEnded');
        });

        this.scale.on('resize', this.handleResize, this);
        this.handleResize();
        this.setupKeyboardInput();
    }

    handleResize() {
        const { height } = this.scale;

        // Joystick
        if (this.uiElements.joystickBase) {
            const jX = 120;
            const jY = height - 120;
            this.uiElements.joystickBase.setPosition(jX, jY);
            if (!this.joystick.active) {
                this.uiElements.joystickThumb.setPosition(jX, jY);
            }
            this.uiElements.joystickHit.setPosition(jX, jY);
        }
    }

    toggleJoystick(visible) {
        if (this.uiElements.joystickBase) this.uiElements.joystickBase.setVisible(visible);
        if (this.uiElements.joystickThumb) this.uiElements.joystickThumb.setVisible(visible);
        if (this.uiElements.joystickHit) this.uiElements.joystickHit.setVisible(visible);
    }

    createJoystick() {
        const baseRadius = 70;
        const thumbRadius = 35;
        const base = this.add.circle(0, 0, baseRadius, 0xcccccc, 0.4).setScrollFactor(0).setDepth(2000);
        base.setStrokeStyle(4, 0xffffff, 0.8);
        const thumb = this.add.circle(0, 0, thumbRadius, 0xffffff, 0.9).setScrollFactor(0).setDepth(2001);
        const hitArea = this.add.circle(0, 0, 150, 0x000000, 0).setInteractive().setScrollFactor(0).setDepth(2002);

        this.uiElements.joystickBase = base;
        this.uiElements.joystickThumb = thumb;
        this.uiElements.joystickHit = hitArea;

        this.input.on('pointerdown', (pointer) => {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, base.x, base.y);
            if (dist < 150) {
                this.joystick.active = true;
                this.updateJoystick(pointer, base.x, base.y, baseRadius, thumb);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.joystick.active) {
                this.updateJoystick(pointer, base.x, base.y, baseRadius, thumb);
            }
        });

        const resetJoystick = () => {
            this.joystick.active = false;
            this.joystick.forceX = 0;
            this.joystick.forceY = 0;
            thumb.setPosition(base.x, base.y);
        };

        this.input.on('pointerup', resetJoystick);
        this.input.on('pointerout', resetJoystick);
    }

    updateJoystick(pointer, baseX, baseY, maxDist, thumb) {
        let dx = pointer.x - baseX;
        let dy = pointer.y - baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        thumb.setPosition(baseX + dx, baseY + dy);
        this.joystick.forceX = dx / maxDist;
        this.joystick.forceY = dy / maxDist;
    }

    handleInteraction() {
        if (!this.canInput) return;

        const state = useGameStore.getState();

        // 1. If Dialogue is open, we advance it
        if (state.dialogue.isOpen) {
            this.events.emit('advanceDialogue');
            return;
        }

        // 2. If Modal (Quiz/Inventory) is open, they handle their own keys/clicks
        if (state.quiz.isOpen || state.inventoryModal.isOpen) return;

        // 3. Normal interaction with the world (if any)
    }

    setupKeyboardInput() {
        this.input.keyboard.on('keydown-I', () => {
            const state = useGameStore.getState();
            if (state.inventoryModal.isOpen) {
                state.closeInventoryModal();
            } else {
                if (isUIOpen(state)) return;
                const gameScene = this.scene.get('GameScene');
                if (gameScene) {
                    this.createItemSelector(gameScene.inventory, null, "가방");
                }
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            if (!this.canInput) return;
            const state = useGameStore.getState();

            if (state.dialogue.isOpen && (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyA')) {
                this.handleInteraction();
                return;
            }

            if (isUIOpen(state)) return;

            if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyA') {
                this.handleInteraction();
                return;
            }
        });
    }

    startQuiz(quizData) {
        if (!quizData || quizData.length === 0) return;
        useGameStore.getState().openQuiz(quizData);
    }

    createItemSelector(inventory, callbackEvent, titleText) {
        useGameStore.getState().openInventoryModal(
            inventory,
            titleText || "아이템 선택",
            callbackEvent
        );
    }
}
