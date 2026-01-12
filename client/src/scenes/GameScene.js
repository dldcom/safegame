import Phaser from 'phaser';
import { io } from 'socket.io-client';
import Player from '../objects/Player';
import NPC from '../objects/NPC';
import Collectible from '../objects/Collectibles';
import { STAGE_1_ITEMS, MISSION_STEPS, STAGE_1_QUIZ } from '../data/Stage1Data';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        // Reuse socket passed from Lobby
        this.socket = data.socket;
    }

    create() {
        // Fallback for direct debugging if socket is missing
        if (!this.socket) {
            this.socket = io();
        }

        // --- Map Generation ---
        const map = this.make.tilemap({ key: 'stage_1' });

        // Add Tilesets (Note: The first argument must match the Tiled tileset name)
        const wallTiles = map.addTilesetImage('Wall', 'Wall');
        const floorTiles = map.addTilesetImage('Floor2', 'Floor2');
        const exteriorTiles = map.addTilesetImage('Exterior_Wall', 'Exterior_Wall');

        const allTiles = [wallTiles, floorTiles, exteriorTiles];

        // Create Layers
        const backgroundLayer = map.createLayer('background', allTiles, 0, 0);
        this.wallLayer = map.createLayer('middleground', allTiles, 0, 0); // Assign to this.wallLayer for collision
        const foregroundLayer = map.createLayer('foreground', allTiles, 0, 0);

        // Adjust Depth
        this.wallLayer.setDepth(1);
        foregroundLayer.setDepth(10); // Above player

        // Enable Collision for Wall Layer
        this.wallLayer.setCollisionByExclusion([-1]); // Collide with everything in this layer

        // World Bounds
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // --- Animations ---
        Player.createAnimations(this);
        NPC.createAnimations(this);

        // --- Groups & Inputs ---
        this.otherPlayers = this.physics.add.group();
        // Group Config: Ensure items are immovable and don't slide
        this.items = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        // Listen for mission completion from UI (Quiz Success)
        this.events.on('completeMission', () => {
            this.currentStep = MISSION_STEPS.STEP_3_REPORTED;
        });

        // Story Management
        this.dialogueQueue = [];
        this.isWaitingForInventory = false;

        // Listen for Dialogue End
        // Listen for Dialogue End
        this.events.on('uiDialogueEnded', () => {
            if (this.dialogueQueue.length > 0) {
                this.showNextDialogue();
            } else if (this.isWaitingForInventory) {
                this.isWaitingForInventory = false;
                this.isUIOpen = true; // Ensure UI lock logic persists
                this.events.emit('openItemSelector', {
                    inventory: this.inventory,
                    callbackEvent: 'useItem'
                });
            } else {
                // Defense: If modal is open, don't unlock
                if (document.getElementById('item-modal') || document.getElementById('quiz-modal')) {
                    this.isUIOpen = true;
                } else {
                    this.isUIOpen = false;
                }
            }
        });

        // Intercept 'showDialogue' to pause game (since we emit it from many places)
        // Note: We can't easily intercept 'this.events.emit' unless we wrapper it.
        // Instead, let's just make sure we set isUIOpen = true whenever we CALL showNextDialogue or emit it.
        // Or adding a listener to our own event!
        this.events.on('showDialogue', () => {
            this.isUIOpen = true;
            if (this.player) this.player.setVelocity(0);
        });

        // Initialize Cursor Keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // --- Socket Setup ---
        // Warning: Do not re-initialize 'io()' if passed from Lobby.
        // It is already handled in 'init' and fallback at start of 'create'.

        // --- Game State Variables ---

        // --- Spawn Objects from Map ---
        this.spawnObjects(map);

        // Collision: Player vs Wall (Player is created in spawnObjects -> addPlayer)
        // We set up the collider in addPlayer to ensure 'this.player' exists

        // --- Game State Variables ---
        this.inventory = []; // Stores item IDs
        this.currentStep = MISSION_STEPS.STEP_0_START;
        this.hearts = 3;
        this.isUIOpen = false; // Flag to prevent movement when UI is open

        // --- Socket Listeners ---
        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].playerId === this.socket.id) {
                    this.addPlayer(players[id]);
                } else {
                    this.addOtherPlayer(players[id]);
                }
            });
        });

        this.socket.on('newPlayer', (playerInfo) => {
            this.addOtherPlayer(playerInfo);
        });

        this.socket.on('playerDisconnected', (playerId) => {
            this.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('playerMoved', (playerInfo) => {
            this.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        this.socket.emit('joinGame');

        // Debug Text
        this.add.text(20, 20, 'Safety Game - Mission: Find Fire Hazards', { fontSize: '20px', fill: '#ffffff' }).setScrollFactor(0).setDepth(20);

        // Resize
        this.scale.on('resize', (gameSize) => {
            this.cameras.main.setSize(gameSize.width, gameSize.height);
        });

        this.scene.launch('UI_Scene');

        // Intro Story
        this.time.delayedCall(1000, () => {
            this.playStorySequence([
                { text: "아야!!!", name: "???" },
                { text: "무슨 일이야?! 큰 소리가 났어.", name: "나" },
                { text: "뜨거운 물에 닿았어... 손이... 손이 너무 뜨거워!!", name: "다친 친구" },
                { text: "큰일이다! 화상을 입은 것 같아. 어떡하지?", name: "나" },
                { text: "주변에서 치료할 물건들을 찾아봐야겠어!", name: "나" },
                { text: "맵을 돌아다니며 치료에 필요한 도구를 수집하세요.", name: "System" }
            ]);
        });
    }

    playStorySequence(sequence) {
        this.dialogueQueue = [...this.dialogueQueue, ...sequence];
        // If not currently showing dialogue, start
        // Simple check: if we just added and nothing was running, start.
        // But for simplicity, let's just try showing next if queue was empty before?
        // Better: We assume this is called when idle. 
        if (this.dialogueQueue.length === sequence.length) {
            this.showNextDialogue();
        }
    }

    showNextDialogue() {
        if (this.dialogueQueue.length === 0) return;
        const next = this.dialogueQueue.shift();
        this.events.emit('showDialogue', next.text, next.name);
    }

    spawnObjects(map) {
        // Find Object Layer 'spawn'
        const spawnLayer = map.getObjectLayer('spawn');

        let playerStartX = 100;
        let playerStartY = 450;

        if (spawnLayer && spawnLayer.objects) {
            spawnLayer.objects.forEach(obj => {
                if (obj.name === 'playerspawn') {
                    playerStartX = obj.x;
                    playerStartY = obj.y;
                    // We don't create player here immediately because we wait for socket 'currentPlayers'
                    // But we store these coordinates to use in addPlayer
                    this.initialPlayerPos = { x: obj.x, y: obj.y };
                } else if (obj.name === 'npcspawn') {
                    // Spawn Injured NPC (Static)
                    this.injuredNpc = this.physics.add.sprite(obj.x, obj.y, 'npc_hurt');
                    this.injuredNpc.setImmovable(true);

                    // Add collider for Injured NPC vs Walls (if needed for safety)
                    if (this.wallLayer) {
                        this.physics.add.collider(this.injuredNpc, this.wallLayer);
                    }
                } else if (obj.name === 'sinkspawn') {
                    // Create Sink (if we have a class or just an image for now)
                    this.sink = this.physics.add.sprite(obj.x, obj.y, 'sink');
                    this.sink.setImmovable(true);
                } else if (obj.name === 'door_lock') {
                    // Spawn Teacher NPC
                    this.teacherNpc = this.physics.add.sprite(obj.x, obj.y, 'npc_teacher');
                    this.teacherNpc.setImmovable(true);
                    if (this.wallLayer) {
                        this.physics.add.collider(this.teacherNpc, this.wallLayer);
                    }
                }
            });
        }

        // Spawn Princess NPC at fixed location as requested
        this.npc = new NPC(this, 500, 1000, 'princess');
        if (this.wallLayer) {
            this.physics.add.collider(this.npc, this.wallLayer);
        }

        // If no player spawn found, set default
        if (!this.initialPlayerPos) {
            this.initialPlayerPos = { x: 100, y: 450 };
        }
    }

    addPlayer(playerInfo) {
        // Use coordinates from map if available, otherwise server/default
        // Prioritize map spawn for the local player's initial position if needed,
        // but usually we rely on server status. 
        // However, user specifically asked to use map spawn points.
        // Let's use the playerInfo from server BUT override with map spawn if it is the "first join" logic handled by server.
        // Since we don't have full server logic control here, we will trust the socket passed info
        // BUT if the server just passes default (0,0), we might want to use our map spawn.

        // Let's use the map spawn position we found earlier
        const startX = this.initialPlayerPos ? this.initialPlayerPos.x : playerInfo.x;
        const startY = this.initialPlayerPos ? this.initialPlayerPos.y : playerInfo.y;

        // Create Player
        this.player = new Player(this, startX, startY, 'character');
        this.player.isMyPlayer = true;

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Collision: Player vs Wall
        if (this.wallLayer) {
            this.physics.add.collider(this.player, this.wallLayer);
        }

        // Collision: Player vs Items (Moved from create)
        if (this.items) {
            this.physics.add.collider(this.player, this.items, this.collectItem, null, this);
        }

        // Collision: Player vs Princess NPC (Just talks)
        if (this.npc) {
            this.physics.add.collider(this.player, this.npc, () => {
                this.npc.speak();
            });
        }

        // Collision: Player vs Injured NPC (Quest Logic)
        if (this.injuredNpc) {
            this.physics.add.collider(this.player, this.injuredNpc, () => {
                if (!this.isUIOpen) {
                    if (this.currentStep >= MISSION_STEPS.STEP_2_PROTECTED) {
                        // Case 0: Mission Complete
                        this.events.emit('showDialogue', '와 상처가 다 나았어! 고마워! 보건 선생님께 가봐!', '다친 친구');
                        this.player.setVelocity(0);
                    } else if (this.inventory.length === 0) {
                        // Case 1: No items
                        this.events.emit('showDialogue', '뜨거운 물에 손이 데였어 너무 아파..', '다친 친구');
                        this.player.setVelocity(0);
                    } else {
                        // Case 2: Has items -> Story then Open Selector
                        this.isWaitingForInventory = true;
                        this.events.emit('showDialogue', '나를 치료할 물건을 가져왔어? 그럼 사용해줘.', '다친 친구');
                        this.player.setVelocity(0);
                    }
                }
            });
        }

        // Collision: Player vs Teacher (Quiz Trigger)
        if (this.teacherNpc) {
            this.physics.add.collider(this.player, this.teacherNpc, () => {
                if (!this.isUIOpen) {
                    if (this.currentStep >= MISSION_STEPS.STEP_3_REPORTED) {
                        // Already Cleared
                        this.events.emit('showDialogue', "이제 다음 방으로 넘어가봐!", "보건 선생님");
                        this.player.setVelocity(0);
                    } else if (this.currentStep >= MISSION_STEPS.STEP_2_PROTECTED) {
                        // Ready for Quiz
                        this.events.emit('openQuiz', STAGE_1_QUIZ);
                        this.player.setVelocity(0);
                    } else {
                        // Not Ready
                        this.events.emit('showDialogue', "아직 치료가 끝나지 않았어. 다친 친구를 도와주고 오렴.", "보건 선생님");
                        this.player.setVelocity(0);
                    }
                }
            });
        }

        // Collision: Player vs Sink
        if (this.sink) {
            this.physics.add.collider(this.player, this.sink, () => {
                // Interaction logic for sink later
                this.events.emit('showDialogue', "세면대다. 화상 부위를 식힐 수 있어.", "정보");
            });
        }

        // --- Spawn Items (Solid interaction) ---
        // Warning: Existing 'collectItem' assumes items are in 'this.items'.
        // Let's add them back.

        // 1. Items
        this.items.add(new Collectible(this, 600, 100, 'water_bottle'));
        this.items.add(new Collectible(this, 300, 300, 'gauze'));
        this.items.add(new Collectible(this, 700, 200, 'ice_pack'));
        this.items.add(new Collectible(this, 200, 500, 'toothpaste'));
    }

    addOtherPlayer(playerInfo) {
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'character');
        otherPlayer.setScale(2);
        otherPlayer.setDepth(5);
        otherPlayer.playerId = playerInfo.playerId;
        this.otherPlayers.add(otherPlayer);

        otherPlayer.body = new Phaser.Physics.Arcade.Body(this.physics.world, otherPlayer);
        otherPlayer.body.setSize(16, 20);
        otherPlayer.body.setOffset(8, 4);
        this.physics.add.existing(otherPlayer); // Make sure body is added to physics world

        // Ensure other players also collide with walls if needed (optional for basic sync)
        // this.physics.add.collider(otherPlayer, this.wallLayer);
    }

    collectItem(player, item) {
        // Prevent duplicate collection if necessary, though destroy() handles visual reomval
        if (!this.inventory.includes(item.type)) {
            this.inventory.push(item.type);

            // Get Readable Name
            const itemData = STAGE_1_ITEMS[item.type];
            const itemName = itemData ? itemData.name : item.type;

            this.events.emit('showDialogue', `${itemName}을(를) 획득했다!`, "아이템 획득");

            // Notify UI to update Inventory display (implementation needed in UI_Scene)
            this.events.emit('updateInventory', this.inventory);
        }
        item.collect(); // Destroy object
    }



    handleItemUse(itemId) {
        if (!this.npc) return;

        // Logic for Item Usage on NPC
        const itemInfo = STAGE_1_ITEMS[itemId];
        if (!itemInfo) return;

        // 1. Check Sequence (Cooling First -> Then Protecting)
        if (itemId === 'water_bottle' || itemId === 'sink') {
            if (this.currentStep === MISSION_STEPS.STEP_0_START) {
                this.currentStep = MISSION_STEPS.STEP_1_COOLED;
                this.events.emit('showDialogue', "잘했어! 화상 부위의 열기를 충분히 식혔구나.\n다음엔 어떻게 해야 할까?", "성공!");
                this.hearts = Math.min(this.hearts + 1, 3); // Bonus/Recover chance? Or just keep it.
                this.events.emit('updateHearts', this.hearts);
            } else {
                this.events.emit('showDialogue', "이미 열기를 식혔어. 다음 단계로 넘어가자.", "알림");
            }
        }
        else if (itemId === 'gauze') {
            if (this.currentStep === MISSION_STEPS.STEP_1_COOLED) {
                this.currentStep = MISSION_STEPS.STEP_2_PROTECTED;
                this.events.emit('showDialogue', "완벽해! 깨끗한 거즈로 상처를 잘 감쌌어.\n이제 보건 선생님께 가보자 (도어락 해제).", "미션 완료!");
            } else if (this.currentStep === MISSION_STEPS.STEP_0_START) {
                // Penalty: Wrong Order
                this.hearts--;
                this.events.emit('updateHearts', this.hearts);
                this.events.emit('showDialogue', "앗! 열기가 남은 채로 감싸면 화상이 더 깊어질 수 있어!\n먼저 물로 식혀야 해.", "경고: 순서 틀림");
            }
        }
        else if (itemInfo.isValid === false) {
            // Penalty: Bad Item
            this.hearts--;
            this.events.emit('updateHearts', this.hearts);
            this.events.emit('showDialogue', itemInfo.penaltyMsg, "위험한 행동!");
        }

        // Check Game Over
        if (this.hearts <= 0) {
            this.events.emit('showDialogue', "하트가 모두 소진되었습니다... 다시 학습해보자.", "실패");
            // Trigger Game Over Logic here
        }
    }

    update(time, delta) {
        if (this.npc) {
            this.npc.update(time, delta);
        }

        if (this.player && this.player.body && this.cursors) { // Check if everything exists
            // Stop movement if UI is open
            if (this.isUIOpen) {
                this.player.setVelocity(0); // Force stop
                this.player.anims.stop(); // Optional: Stop animation
                return;
            }

            // Original player update logic
            this.player.update(this.cursors);

            // Network Emission
            const x = this.player.x;
            const y = this.player.y;
            // Emit only on significant movement to reduce traffic
            if (this.player.oldPosition && (Math.abs(x - this.player.oldPosition.x) > 0.1 || Math.abs(y - this.player.oldPosition.y) > 0.1)) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
            }
            this.player.oldPosition = { x: this.player.x, y: this.player.y };
        }
    }
}
