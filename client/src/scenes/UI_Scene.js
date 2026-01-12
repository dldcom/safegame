import Phaser from 'phaser';
import DialogueBox from '../ui/DialogueBox';
import { STAGE_1_ITEMS } from '../data/Stage1Data';

export default class UI_Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'UI_Scene', active: true });
        this.resetState();
    }

    resetState() {
        this.currentFocusIndex = -1;
        this.modalItems = [];
        this.isModalOpen = false;
        this.modalMode = null;
        this.currentInventory = [];
        this.quizData = [];
        this.currentQuizIndex = 0;
        this.canInput = true;
        this.maxHearts = 3;
        this.heartGroup = [];

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

        this.createHearts();
        this.createInventoryButton();
        this.createJoystick();
        this.createActionButton();
        this.dialogueBox = new DialogueBox(this);

        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.events.on('updateHearts', (count) => this.updateHearts(count));
            gameScene.events.on('updateInventory', () => {
                if (this.uiElements.inventoryBtn) {
                    this.tweens.add({ targets: this.uiElements.inventoryBtn, scale: 0.9, duration: 100, yoyo: true });
                }
            });
            gameScene.events.on('showDialogue', (t, n) => {
                this.dialogueBox.show(t, n);
                this.toggleJoystick(false);
            });
            gameScene.events.on('openItemSelector', (data) => this.createItemSelector(data.inventory, data.callbackEvent, "사용할 아이템을 선택하세요"));
            gameScene.events.on('openQuiz', (quizData) => this.startQuiz(quizData));
        }

        this.events.on('dialogueEnded', () => {
            this.toggleJoystick(true);
            const gameScene = this.scene.get('GameScene');
            if (gameScene) gameScene.events.emit('uiDialogueEnded');
        });

        this.scale.on('resize', this.handleResize, this);
        this.handleResize(); // Initial placement

        this.setupKeyboardInput();
    }

    handleResize() {
        const { width, height } = this.scale;

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

        // Action Button
        if (this.uiElements.actionBtn) {
            const aX = width - 100;
            const aY = height - 100;
            this.uiElements.actionBtn.setPosition(aX, aY);
            this.uiElements.actionText.setPosition(aX, aY);
        }

        // Inventory Button (Top Right)
        if (this.uiElements.inventoryBtn) {
            const iX = width - 50;
            this.uiElements.inventoryBtn.setPosition(iX, 40);
            this.uiElements.inventoryText.setPosition(iX, 80);
        }

        // Dialogue Box (Moved to Top Area for Mobile)
        if (this.dialogueBox) {
            this.dialogueBox.setPosition(50, 110);
        }
    }

    toggleJoystick(visible) {
        if (this.uiElements.joystickBase) this.uiElements.joystickBase.setVisible(visible);
        if (this.uiElements.joystickThumb) this.uiElements.joystickThumb.setVisible(visible);
        if (this.uiElements.joystickHit) this.uiElements.joystickHit.setVisible(visible);
    }

    createActionButton() {
        const btn = this.add.circle(0, 0, 50, 0xff0000, 0.6)
            .setScrollFactor(0).setDepth(2000).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(4, 0xffffff, 0.8);

        const text = this.add.text(0, 0, 'A', { fontSize: '34px', fontStyle: 'bold', fill: '#ffffff' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        this.uiElements.actionBtn = btn;
        this.uiElements.actionText = text;

        btn.on('pointerdown', () => {
            btn.setScale(0.9);
            this.handleInteraction();
        });
        btn.on('pointerup', () => btn.setScale(1.0));
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

    createHearts() {
        this.heartGroup = [];
        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.text(20 + (i * 40), 20, '❤️', { fontSize: '30px' }).setScrollFactor(0);
            this.heartGroup.push(heart);
        }
    }

    updateHearts(count) {
        this.heartGroup.forEach((heart, i) => {
            heart.setText(i < count ? '❤️' : '💔');
        });
        if (count < this.maxHearts) this.cameras.main.flash(500, 255, 0, 0);
    }

    handleInteraction() {
        if (document.getElementById('quiz-modal')) {
            const retryBtn = document.querySelector('#quiz-feedback button');
            if (retryBtn) {
                retryBtn.click();
            } else if (this.quizBtns && this.quizBtns.length > 0 && !this.quizBtns[0].disabled) {
                if (this.quizFocusIndex >= 0 && this.quizFocusIndex < this.quizBtns.length) {
                    this.handleAnswer(this.quizFocusIndex, this.quizBtns[this.quizFocusIndex]);
                }
            }
            return;
        }

        if (this.dialogueBox && this.dialogueBox.visible) {
            this.events.emit('advanceDialogue');
            return;
        }

        if (this.isModalOpen) {
            if (this.modalItems.length === 0) {
                this.closeModal(document.getElementById('item-modal'));
            } else {
                this.handleItemSelection();
            }
            return;
        }
    }

    setupKeyboardInput() {
        this.input.keyboard.on('keydown-I', () => {
            const modal = document.getElementById('item-modal');
            if (modal) {
                this.closeModal(modal);
            } else {
                if (document.getElementById('quiz-modal')) return;
                const gameScene = this.scene.get('GameScene');
                if (gameScene) {
                    this.createItemSelector(gameScene.inventory, null, "Inventory");
                }
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            if (!this.canInput) return;

            if (event.code === 'Escape') {
                const itemModal = document.getElementById('item-modal');
                if (itemModal) this.closeModal(itemModal);
                return;
            }

            if (event.code === 'Space' || event.code === 'Enter') {
                this.handleInteraction();
                return;
            }

            if (document.getElementById('quiz-modal')) {
                this.handleQuizInput(event);
                return;
            }

            if (!this.isModalOpen || this.modalItems.length === 0) return;

            let nextIndex = this.currentFocusIndex;
            const columns = 2;

            if (event.code === 'ArrowRight') nextIndex++;
            else if (event.code === 'ArrowLeft') nextIndex--;
            else if (event.code === 'ArrowDown') nextIndex += columns;
            else if (event.code === 'ArrowUp') nextIndex -= columns;

            nextIndex = Phaser.Math.Clamp(nextIndex, 0, this.modalItems.length - 1);
            if (nextIndex !== this.currentFocusIndex) this.updateFocus(nextIndex);
        });
    }

    handleQuizInput(event) {
        const retryBtn = document.querySelector('#quiz-feedback button');
        if (retryBtn) {
            if (event.code === 'Space' || event.code === 'Enter') retryBtn.click();
            return;
        }

        if (!this.quizBtns || this.quizBtns.length === 0 || this.quizBtns[0].disabled) return;
        let nextIndex = this.quizFocusIndex;
        if (event.code === 'ArrowDown' || event.code === 'ArrowRight') nextIndex++;
        else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') nextIndex--;
        else if (event.code === 'Space' || event.code === 'Enter') {
            if (nextIndex >= 0 && nextIndex < this.quizBtns.length) {
                this.handleAnswer(nextIndex, this.quizBtns[nextIndex]);
            }
            return;
        }
        nextIndex = Phaser.Math.Clamp(nextIndex, 0, this.quizBtns.length - 1);
        if (nextIndex !== this.quizFocusIndex) this.updateQuizFocus(nextIndex);
    }

    updateQuizFocus(index) {
        if (this.quizFocusIndex >= 0 && this.quizBtns[this.quizFocusIndex]) {
            this.quizBtns[this.quizFocusIndex].classList.remove('focused');
        }
        this.quizFocusIndex = index;
        if (this.quizFocusIndex >= 0 && this.quizBtns[this.quizFocusIndex]) {
            this.quizBtns[this.quizFocusIndex].classList.add('focused');
        }
    }

    updateFocus(index) {
        if (this.currentFocusIndex >= 0 && this.modalItems[this.currentFocusIndex]) {
            this.modalItems[this.currentFocusIndex].classList.remove('focused');
        }
        this.currentFocusIndex = index;
        if (this.currentFocusIndex >= 0 && this.modalItems[this.currentFocusIndex]) {
            this.modalItems[this.currentFocusIndex].classList.add('focused');
            this.modalItems[this.currentFocusIndex].scrollIntoView({ block: "nearest" });
        }
    }

    handleItemSelection() {
        if (this.currentFocusIndex < 0 || !this.currentInventory[this.currentFocusIndex]) return;
        const itemId = this.currentInventory[this.currentFocusIndex];
        const itemData = STAGE_1_ITEMS[itemId];

        if (this.modalMode === 'use') {
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                gameScene.handleItemUse(itemId);
                gameScene.isUIOpen = false;
            }
            this.closeModal(document.getElementById('item-modal'));
        } else {
            this.showDescription(document.getElementById('item-modal'), itemData.name, itemData.description);
        }
    }

    showDescription(parentModal, title, desc) {
        let descBox = document.getElementById('item-description');
        if (descBox) descBox.remove();
        descBox = document.createElement('div');
        descBox.id = 'item-description';
        Object.assign(descBox.style, {
            marginTop: '15px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '14px', color: '#ddd', textAlign: 'left'
        });
        descBox.innerHTML = `<strong>${title}</strong><br/><br/>${desc}`;
        parentModal.appendChild(descBox);
    }

    startQuiz(quizData) {
        if (!quizData || quizData.length === 0) return;
        this.quizData = quizData;
        this.currentQuizIndex = 0;
        this.createQuizModal();
        this.showQuestion();
    }

    createQuizModal() {
        if (document.getElementById('quiz-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'quiz-modal';
        modal.className = 'modal-overlay quiz-modal';
        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.innerHTML = "안전 퀴즈";
        modal.appendChild(title);
        const content = document.createElement('div');
        content.id = 'quiz-content';
        modal.appendChild(content);
        document.body.appendChild(modal);
        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.isUIOpen = true;
    }

    showQuestion() {
        const modalContent = document.getElementById('quiz-content');
        if (!modalContent) return;
        const data = this.quizData[this.currentQuizIndex];
        modalContent.innerHTML = '';
        const qText = document.createElement('div');
        qText.className = 'quiz-question';
        qText.innerText = `Q${this.currentQuizIndex + 1}. ${data.question}`;
        modalContent.appendChild(qText);
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';
        this.quizBtns = [];
        this.quizFocusIndex = -1;
        data.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.innerText = `(${idx + 1}) ${opt}`;
            btn.onclick = () => this.handleAnswer(idx, btn);
            btn.onmouseenter = () => this.updateQuizFocus(idx);
            optionsDiv.appendChild(btn);
            this.quizBtns.push(btn);
        });
        modalContent.appendChild(optionsDiv);
        const feedback = document.createElement('div');
        feedback.id = 'quiz-feedback';
        feedback.className = 'quiz-feedback';
        modalContent.appendChild(feedback);
        if (this.quizBtns.length > 0) this.updateQuizFocus(0);
    }

    handleAnswer(selectedIndex, btnElement) {
        const data = this.quizData[this.currentQuizIndex];
        const feedbackEl = document.getElementById('quiz-feedback');
        document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
        if (selectedIndex === data.answerIndex) {
            feedbackEl.innerText = "정답입니다! 👏";
            feedbackEl.className = 'quiz-feedback correct';
            btnElement.style.borderColor = '#2ecc71';
            setTimeout(() => {
                this.currentQuizIndex++;
                if (this.currentQuizIndex < this.quizData.length) this.showQuestion();
                else this.finishQuiz(true);
            }, 1500);
        } else {
            const explanation = data.explanation || "틀렸습니다. 다시 생각해보세요.";
            feedbackEl.innerHTML = `오답입니다! 😢<br/><span style="font-weight:normal; font-size:0.9em">${explanation}</span>`;
            feedbackEl.className = 'quiz-feedback wrong';
            btnElement.style.borderColor = '#e74c3c';
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                gameScene.hearts--;
                gameScene.events.emit('updateHearts', gameScene.hearts);
                if (gameScene.hearts <= 0) {
                    setTimeout(() => this.finishQuiz(false), 2000);
                    return;
                }
            }
            const retryBtn = document.createElement('button');
            retryBtn.innerText = "다시 풀기";
            retryBtn.className = 'close-btn';
            retryBtn.style.marginTop = '10px';
            retryBtn.onclick = () => this.showQuestion();
            feedbackEl.appendChild(retryBtn);
        }
    }

    finishQuiz(isSuccess) {
        const modal = document.getElementById('quiz-modal');
        if (modal) modal.remove();
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.isUIOpen = false;
            if (isSuccess) {
                gameScene.events.emit('completeMission');
                gameScene.events.emit('showDialogue', "모든 테스트를 통과했어! 정말 대단해. \n이제 학교는 안전해.", "미션 클리어!");
                this.cameras.main.flash(500, 255, 255, 255);
            } else {
                gameScene.events.emit('showDialogue', "체력이 모두 소진되어 실패했어...\n다시 도전해보자.", "게임 오버");
                this.cameras.main.shake(500, 0.05);
            }
        }
    }

    closeModal(modal) {
        if (modal) modal.remove();
        this.isModalOpen = false;
        this.modalItems = [];
        this.currentFocusIndex = -1;
        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.isUIOpen = false;
    }

    createInventoryButton() {
        const btn = this.add.image(0, 0, 'inventory_icon')
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setScale(0.8);
        const text = this.add.text(0, 0, 'Inventory', { fontSize: '14px', fontFamily: 'Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 2 })
            .setOrigin(0.5).setScrollFactor(0);

        this.uiElements.inventoryBtn = btn;
        this.uiElements.inventoryText = text;

        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 0.9, duration: 100 }));
        btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 0.8, duration: 100 }));
        btn.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            if (gameScene) this.createItemSelector(gameScene.inventory, null, "Inventory");
        });
    }

    createItemSelector(inventory, callbackEvent, titleText) {
        if (document.getElementById('item-modal')) return;
        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.isUIOpen = true;
        this.isModalOpen = true;
        this.modalItems = [];
        this.currentFocusIndex = -1;
        this.currentInventory = inventory;
        this.modalMode = callbackEvent ? 'use' : 'view';
        this.canInput = false;
        this.time.delayedCall(300, () => { this.canInput = true; });
        const modal = document.createElement('div');
        modal.id = 'item-modal';
        modal.className = 'modal-overlay';
        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.innerText = titleText || "Item Select";
        modal.appendChild(title);
        const list = document.createElement('div');
        list.className = 'item-grid';
        if (inventory.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'item-empty';
            emptyMsg.innerText = "(Empty)";
            list.appendChild(emptyMsg);
        } else {
            inventory.forEach((itemId, index) => {
                const itemData = STAGE_1_ITEMS[itemId];
                const btn = document.createElement('div');
                btn.className = `item-btn${this.modalMode === 'view' ? ' view-mode' : ''}`;
                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.innerText = itemData ? itemData.name : itemId;
                btn.appendChild(nameSpan);
                btn.onclick = () => {
                    this.currentFocusIndex = index;
                    this.updateFocus(index);
                    this.handleItemSelection();
                };
                btn.onmouseenter = () => this.updateFocus(index);
                list.appendChild(btn);
                this.modalItems.push(btn);
            });
        }
        modal.appendChild(list);
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'close-btn';
        cancelBtn.innerText = "Close (Esc)";
        cancelBtn.onclick = () => this.closeModal(modal);
        modal.appendChild(cancelBtn);
        document.body.appendChild(modal);
        if (this.modalItems.length > 0) this.updateFocus(0);
    }
}
