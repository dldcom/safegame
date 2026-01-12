import Phaser from 'phaser';
import DialogueBox from '../ui/DialogueBox';
import { STAGE_1_ITEMS } from '../data/Stage1Data';

export default class UI_Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'UI_Scene', active: true });
        this.currentFocusIndex = -1;
        this.modalItems = [];
        this.isModalOpen = false;
        this.modalMode = null;
        this.currentInventory = [];

        // Quiz State
        this.quizData = [];
        this.currentQuizIndex = 0;

        this.canInput = true; // Input throttle flag
    }

    create() {
        // --- 1. HUD & Hearts ---
        this.hearts = [];
        this.maxHearts = 3;
        this.createHearts(3);

        // --- 2. Inventory Button ---
        this.createInventoryButton();

        // --- 3. Dialogue Box ---
        this.dialogueBox = new DialogueBox(this);

        // --- 4. Event Listeners ---
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.events.on('updateHearts', (count) => this.updateHearts(count));
            gameScene.events.on('updateInventory', () => {
                if (this.inventoryBtn) {
                    this.tweens.add({ targets: this.inventoryBtn, scale: 0.9, duration: 100, yoyo: true });
                }
            });
            gameScene.events.on('showDialogue', (t, n) => this.dialogueBox.show(t, n));
            gameScene.events.on('hideDialogue', () => this.dialogueBox.hide());

            // Item Selector (Use Mode)
            gameScene.events.on('openItemSelector', (data) => {
                this.createItemSelector(data.inventory, data.callbackEvent, "사용할 아이템을 선택하세요");
            });

            // Quiz Event
            gameScene.events.on('openQuiz', (quizData) => {
                this.startQuiz(quizData);
            });
        }

        // Listen for internal dialogue end and forward to GameScene
        this.events.on('dialogueEnded', () => {
            const gameScene = this.scene.get('GameScene');
            if (gameScene) gameScene.events.emit('uiDialogueEnded');
        });

        // --- 5. Keyboard Input ---
        this.setupKeyboardInput();
    }

    setupKeyboardInput() {
        // 1. Toggle Intentory (I Key)
        this.input.keyboard.on('keydown-I', () => {
            const modal = document.getElementById('item-modal');
            if (modal) {
                this.closeModal(modal);
            } else {
                // Only open if NO other modal (like quiz) is open
                if (document.getElementById('quiz-modal')) return;

                const gameScene = this.scene.get('GameScene');
                if (gameScene) {
                    this.createItemSelector(gameScene.inventory, null, "Inventory");
                }
            }
        });

        // 2. Navigation & Close
        this.input.keyboard.on('keydown', (event) => {
            if (!this.canInput) return;

            // Check for Quiz Mode First
            if (document.getElementById('quiz-modal')) {
                this.handleQuizInput(event);
                return;
            }

            // General Close Logic for Inventory
            if (event.code === 'Escape') {
                const itemModal = document.getElementById('item-modal');
                if (itemModal) this.closeModal(itemModal);
                return;
            }

            // --- Inventory Navigation Logic ---
            if (!this.isModalOpen) return;

            // Handle Space for Inventory (Close if empty, or Select)
            if (event.code === 'Space') {
                if (this.modalItems.length === 0) {
                    const modal = document.getElementById('item-modal');
                    this.closeModal(modal);
                    return;
                }
                this.handleItemSelection();
                return;
            }

            if (this.modalItems.length === 0) return;

            let nextIndex = this.currentFocusIndex;
            const columns = 2;

            if (event.code === 'ArrowRight') nextIndex++;
            else if (event.code === 'ArrowLeft') nextIndex--;
            else if (event.code === 'ArrowDown') nextIndex += columns;
            else if (event.code === 'ArrowUp') nextIndex -= columns;

            // Clamp index
            if (nextIndex < 0) nextIndex = 0;
            if (nextIndex >= this.modalItems.length) nextIndex = this.modalItems.length - 1;

            if (nextIndex !== this.currentFocusIndex) {
                this.updateFocus(nextIndex);
            }
        });
    }

    // New: Quiz Input Handler
    handleQuizInput(event) {
        // Check for Retry Button first (Answer Feedback State)
        const retryBtn = document.querySelector('#quiz-feedback button');
        if (retryBtn) {
            if (event.code === 'Space' || event.code === 'Enter') {
                retryBtn.click();
            }
            return;
        }

        if (!this.quizBtns || this.quizBtns.length === 0) return;

        // Block input if buttons are disabled (e.g. feedback showing but no retry button yet)
        if (this.quizBtns[0].disabled) return;

        let nextIndex = this.quizFocusIndex;

        if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
            nextIndex++;
        } else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
            nextIndex--;
        } else if (event.code === 'Space' || event.code === 'Enter') {
            if (nextIndex >= 0 && nextIndex < this.quizBtns.length) {
                this.handleAnswer(nextIndex, this.quizBtns[nextIndex]);
            }
            return;
        }

        // Clamp
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= this.quizBtns.length) nextIndex = this.quizBtns.length - 1;

        if (nextIndex !== this.quizFocusIndex) {
            this.updateQuizFocus(nextIndex);
        }
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
            const modal = document.getElementById('item-modal');
            this.closeModal(modal);
        } else {
            const modal = document.getElementById('item-modal');
            this.showDescription(modal, itemData.name, itemData.description);
        }
    }

    showDescription(parentModal, title, desc) {
        let descBox = document.getElementById('item-description');
        if (descBox) descBox.parentNode.removeChild(descBox);

        descBox = document.createElement('div');
        descBox.id = 'item-description';
        Object.assign(descBox.style, {
            marginTop: '15px',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '14px',
            color: '#ddd',
            textAlign: 'left'
        });
        descBox.innerHTML = `<strong>${title}</strong><br/><br/>${desc}`;
        parentModal.appendChild(descBox);
    }

    // --- Quiz Logic ---
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

        this.quizBtns = []; // Reset buttons array
        this.quizFocusIndex = -1;

        data.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.innerText = `(${idx + 1}) ${opt}`;

            // Mouse click overrides keyboard focus
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

        // Auto-focus first option
        if (this.quizBtns.length > 0) {
            this.updateQuizFocus(0);
        }
    }

    handleAnswer(selectedIndex, btnElement) {
        const data = this.quizData[this.currentQuizIndex];
        const feedbackEl = document.getElementById('quiz-feedback');

        const allBtns = document.querySelectorAll('.quiz-btn');
        allBtns.forEach(b => b.disabled = true);

        if (selectedIndex === data.answerIndex) {
            feedbackEl.innerText = "정답입니다! 👏";
            feedbackEl.className = 'quiz-feedback correct';
            btnElement.style.borderColor = '#2ecc71';

            setTimeout(() => {
                this.currentQuizIndex++;
                if (this.currentQuizIndex < this.quizData.length) {
                    this.showQuestion();
                } else {
                    this.finishQuiz(true);
                }
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
                    setTimeout(() => this.finishQuiz(false), 2000); // Game Over
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
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);

        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.isUIOpen = false;
            if (isSuccess) {
                gameScene.events.emit('completeMission'); // Notify GameScene
                gameScene.events.emit('showDialogue', "모든 테스트를 통과했어! 정말 대단해. \n이제 학교는 안전해.", "미션 클리어!");
                // Simple Celebration
                this.cameras.main.flash(500, 255, 255, 255);
            } else {
                gameScene.events.emit('showDialogue', "체력이 모두 소진되어 실패했어...\n다시 도전해보자.", "게임 오버");
                // Simple loose feedback
                this.cameras.main.shake(500, 0.05);
            }
        }
    }

    // --- Helper for Modal Closing ---
    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        this.isModalOpen = false;
        this.ctxModalItems = []; // Typo fix safe reset
        this.modalItems = [];
        this.currentFocusIndex = -1;

        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.isUIOpen = false;
    }

    // --- Heart Logic ---
    createHearts(count) {
        this.hearts.forEach(h => h.destroy());
        this.hearts = [];
        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.text(20 + (i * 40), 20, i < count ? '❤️' : '💔', { fontSize: '30px' }).setScrollFactor(0);
            this.hearts.push(heart);
        }
    }
    updateHearts(count) {
        this.createHearts(count);
        if (count < this.maxHearts) this.cameras.main.flash(500, 255, 0, 0);
    }

    // --- Inventory Button ---
    createInventoryButton() {
        const { width } = this.scale;
        this.inventoryBtn = this.add.image(width - 50, 40, 'inventory_icon')
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setScale(0.8);

        this.inventoryBtn.on('pointerover', () => this.tweens.add({ targets: this.inventoryBtn, scale: 0.9, duration: 100 }));
        this.inventoryBtn.on('pointerout', () => this.tweens.add({ targets: this.inventoryBtn, scale: 0.8, duration: 100 }));
        this.inventoryBtn.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            if (gameScene) {
                this.createItemSelector(gameScene.inventory, null, "Inventory");
            }
        });

        this.add.text(width - 50, 80, 'Inventory', { fontSize: '14px', fontFamily: 'Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 2 })
            .setOrigin(0.5).setScrollFactor(0);
    }

    // --- Item Selector Modal ---
    createItemSelector(inventory, callbackEvent, titleText) {
        if (document.getElementById('item-modal')) return;

        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.isUIOpen = true;

        this.isModalOpen = true;
        this.modalItems = [];
        this.currentFocusIndex = -1;
        this.currentInventory = inventory;
        this.modalMode = callbackEvent ? 'use' : 'view';

        // Prevent immediate input trigger (e.g. from dialogue skip)
        this.canInput = false;
        this.time.delayedCall(300, () => {
            this.canInput = true;
        });

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

                btn.className = `item-btn`;
                if (this.modalMode === 'view') btn.className += ' view-mode';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'item-name';
                nameSpan.innerText = itemData ? itemData.name : itemId;
                btn.appendChild(nameSpan);

                btn.onclick = () => {
                    this.currentFocusIndex = index;
                    this.updateFocus(index);
                    this.handleItemSelection();
                };
                btn.onmouseenter = () => {
                    this.updateFocus(index);
                };

                list.appendChild(btn);
                this.modalItems.push(btn);
            });
        }
        modal.appendChild(list);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'close-btn';
        cancelBtn.innerText = "Close (Esc)";
        cancelBtn.onclick = () => {
            this.closeModal(modal);
        };
        modal.appendChild(cancelBtn);

        document.body.appendChild(modal);


        if (this.modalItems.length > 0) {
            this.updateFocus(0);
        }
    }
}
