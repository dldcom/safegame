import Phaser from 'phaser';
import { io } from 'socket.io-client';
import Player from '../objects/Player';
import NPC from '../objects/NPC';
import Collectible from '../objects/Collectibles';
import { STAGE_1_ITEMS, MISSION_STEPS, STAGE_1_QUIZ } from '../data/Stage1Data';
import { STAGE_2_ITEMS, STAGE_2_MISSION_STEPS, STAGE_2_QUIZ } from '../data/Stage2Data';
import useGameStore, { isUIOpen } from '../store/useGameStore';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.resetState();
    }

    resetState() {
        const store = useGameStore.getState();
        this.currentStage = store.stage || 1;
        this.inventory = [];

        // Stage-specific initial step
        if (this.currentStage === 1) {
            this.currentStep = MISSION_STEPS.STEP_0_START;
        } else if (this.currentStage === 2) {
            this.currentStep = STAGE_2_MISSION_STEPS.STEP_0_START;
        } else {
            // Stage 3 or others: Default to 0
            this.currentStep = 0;
        }

        this.hearts = 3;
        this.dialogueQueue = [];
        this.isWaitingForInventory = false;
        this.initialPlayerPos = { x: 100, y: 450 };
    }

    init(data) {
        this.socket = data.socket;
        // If coming from another scene and data.stage is provided, use it
        if (data.stage) {
            useGameStore.getState().setStage(data.stage);
            this.resetState();
        }
    }

    create() {
        if (!this.socket) this.socket = io();

        const mapKey = `stage_${this.currentStage}`;
        const store = useGameStore.getState();
        const customMap = store.customMaps[mapKey];

        // [핵심] 맵이 캐시에 없거나 커스텀 맵인 경우 동적으로 로드
        if (!this.cache.tilemap.has(mapKey) || customMap) {
            console.log(`>>> [GameScene] Loading map dynamically for ${mapKey}`);

            // 로딩 메시지 표시
            const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, '맵 데이터를 불러오는 중...', {
                fontFamily: 'Noto Serif KR', fontSize: '24px', color: '#ffffff'
            }).setOrigin(0.5);

            // 캐시에 이미 있으면 제거하고 다시 로드 (커스텀 맵 최신화 대응)
            if (this.cache.tilemap.has(mapKey)) {
                this.cache.tilemap.remove(mapKey);
            }

            if (customMap) {
                // Store에 있는 JSON 데이터로 로드
                this.load.tilemapTiledJSON(mapKey, customMap);
            } else {
                // 기본 파일 경로로 로드
                this.load.tilemapTiledJSON(mapKey, `assets/maps/${mapKey}.json`);
            }

            this.load.once('complete', () => {
                loadingText.destroy();
                this.continueCreate();
            });
            this.load.start();
        } else {
            this.continueCreate();
        }
    }

    continueCreate() {
        const map = this.setupMap();
        this.setupPhysicsGroups();
        this.setupEvents();
        this.setupAnimations();
        this.spawnObjects(map);
        this.setupNetwork();

        this.scene.launch('UI_Scene');
        if (this.currentStage === 1) {
            this.startIntroSequence();
        } else {
            console.log(`>>> [GameScene] Stage ${this.currentStage} started in free roam.`);
        }
    }

    setupMap() {
        const mapKey = `stage_${this.currentStage}`;
        const map = this.make.tilemap({ key: mapKey });

        let tilesets = [];
        if (this.currentStage === 1 || this.currentStage === 3) {
            // Stage 1 and Stage 3 (MapMaker Standard)
            tilesets = [
                map.addTilesetImage('Wall', 'Wall'),
                map.addTilesetImage('Floor2', 'Floor2'),
                map.addTilesetImage('Exterior_Wall', 'Exterior_Wall')
            ];

            // Filter out null tilesets in case some are not used in a custom map
            const validTilesets = tilesets.filter(t => t !== null);

            map.createLayer('background', validTilesets, 0, 0);
            this.wallLayer = map.createLayer('middleground', validTilesets, 0, 0);
            const foregroundLayer = map.createLayer('foreground', validTilesets, 0, 0);

            if (this.wallLayer) {
                this.wallLayer.setDepth(1).setCollisionByExclusion([-1]);
            }
            if (foregroundLayer) {
                foregroundLayer.setDepth(10);
            }
        } else if (this.currentStage === 2) {
            // Stage 2 Tilesets (Based on stage_2.json names)
            tilesets = [
                map.addTilesetImage('Floor', 'Floor2'),
                map.addTilesetImage('Wall', 'Wall'),
                map.addTilesetImage('Decor', 'Exterior_Decoration')
            ];
            map.createLayer('Background', tilesets, 0, 0);
            this.wallLayer = map.createLayer('Middleground', tilesets, 0, 0);
            const foregroundLayer = map.createLayer('Foreground', tilesets, 0, 0);
            this.wallLayer.setDepth(1).setCollisionByExclusion([-1]);
            foregroundLayer.setDepth(10);
        }

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        return map;
    }

    setupPhysicsGroups() {
        this.otherPlayers = this.physics.add.group();
        this.items = this.physics.add.group({ immovable: true, allowGravity: false });
    }

    setupAnimations() {
        Player.createAnimations(this);
        NPC.createAnimations(this);
    }

    setupEvents() {
        // Clear previous listeners to prevent double triggers on scene restart
        this.events.off('completeMission');
        this.events.off('uiDialogueEnded');
        this.events.off('showDialogue');
        this.events.off('useItem');

        this.events.on('completeMission', () => {
            this.currentStep = MISSION_STEPS.STEP_3_REPORTED;
        });

        this.events.on('uiDialogueEnded', () => {
            if (this.dialogueQueue.length > 0) {
                this.showNextDialogue();
            } else if (this.pendingQuiz) {
                this.pendingQuiz = false;
                this.events.emit('openQuiz', STAGE_1_QUIZ);
            } else if (this.isWaitingForInventory) {
                this.isWaitingForInventory = false;
                this.events.emit('openItemSelector', {
                    inventory: this.inventory,
                    callbackEvent: 'useItem'
                });
            }
        });

        this.events.on('showDialogue', () => {
            if (this.player) this.player.setVelocity(0);
        });

        this.events.on('useItem', (itemId) => {
            this.handleItemUse(itemId);
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    setupNetwork() {
        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].playerId === this.socket.id) this.addPlayer(players[id]);
                else this.addOtherPlayer(players[id]);
            });
        });

        this.socket.on('newPlayer', (playerInfo) => this.addOtherPlayer(playerInfo));
        this.socket.on('playerDisconnected', (id) => {
            this.otherPlayers.getChildren().forEach(p => { if (p.playerId === id) p.destroy(); });
        });
        this.socket.on('playerMoved', (info) => {
            this.otherPlayers.getChildren().forEach(p => {
                if (info.playerId === p.playerId) p.setPosition(info.x, info.y);
            });
        });

        this.socket.emit('joinGame');
    }

    spawnObjects(map) {
        const spawnLayer = map.getObjectLayer('spawn');
        if (spawnLayer && spawnLayer.objects) {
            spawnLayer.objects.forEach(obj => {
                switch (obj.name) {
                    case 'playerspawn':
                        this.initialPlayerPos = { x: obj.x, y: obj.y };
                        break;
                    case 'npcspawn':
                        this.injuredNpc = new NPC(this, obj.x, obj.y, 'npc_hurt', { displayName: '다친 친구' });
                        break;
                    case 'sinkspawn':
                        this.sink = this.physics.add.sprite(obj.x, obj.y, 'sink').setImmovable(true);
                        break;
                    case 'door_lock':
                        // Shift UP (-80px) to move out of the bottom wall tile
                        this.teacherNpc = new NPC(this, obj.x, obj.y - 80, 'npc_teacher', { displayName: '보건 선생님' });
                        break;
                }
            });
        }

        // Floating NPC
        this.npc = new NPC(this, 500, 1000, 'princess', { type: 'moving', displayName: '안전 지킴이' });
        // NPC Collisions
        const activeNPCs = [this.injuredNpc, this.teacherNpc, this.npc].filter(n => n != null);
        this.physics.add.collider(activeNPCs, this.wallLayer);
    }

    addPlayer(playerInfo) {
        const { x, y } = this.initialPlayerPos;
        this.player = new Player(this, x, y, 'character', true);

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.physics.add.collider(this.player, this.wallLayer);
        this.physics.add.collider(this.player, this.items, this.collectItem, null, this);

        // NPC Collisions
        if (this.npc) {
            this.physics.add.collider(this.player, this.npc, () => {
                if (isUIOpen(useGameStore.getState())) return;
                this.npc.speak("반가워! 복도 끝 교실에 다친 친구가 있어.\n얼른 가서 친구를 도와주고, 올바른 응급처치를 해줘!");
            });
        }

        if (this.injuredNpc) {
            this.physics.add.collider(this.player, this.injuredNpc, () => {
                if (isUIOpen(useGameStore.getState())) return;
                if (this.currentStep >= MISSION_STEPS.STEP_2_PROTECTED) {
                    this.injuredNpc.speak('와 상처가 다 나았어! 고마워! 보건 선생님께 가봐!');
                } else if (this.inventory.length === 0) {
                    this.injuredNpc.speak('뜨거운 물에 손이 데였어 너무 아파..');
                } else {
                    if (this.injuredNpc.speak('나를 치료할 물건을 가져왔어? 그럼 사용해줘.')) {
                        this.isWaitingForInventory = true;
                    }
                }
            });
        }

        if (this.teacherNpc) {
            this.physics.add.collider(this.player, this.teacherNpc, () => {
                if (isUIOpen(useGameStore.getState())) return;
                if (this.currentStep >= MISSION_STEPS.STEP_3_REPORTED) {
                    this.teacherNpc.speak("이제 다음 방으로 넘어가봐!");
                } else if (this.currentStep >= MISSION_STEPS.STEP_2_PROTECTED) {
                    this.teacherNpc.speak("다친 친구를 잘 도와주었구나! \n정말 잘했어. 마지막으로 간단한 안전 퀴즈를 풀어볼까?");
                    this.pendingQuiz = true;
                } else {
                    this.teacherNpc.speak("아직 치료가 끝나지 않았어. 다친 친구를 도와주고 오렴.");
                }
            });
        }

        if (this.sink) {
            this.physics.add.collider(this.player, this.sink, () => {
                this.events.emit('showDialogue', "세면대다. 화상 부위를 식힐 수 있어.", "정보");
            });
        }

        // Spawn Items (Stage 1 only for now)
        if (this.currentStage === 1) {
            const itemSpawns = [
                { id: 'water_bottle', x: 600, y: 100 },
                { id: 'gauze', x: 300, y: 300 },
                { id: 'ice_pack', x: 700, y: 200 },
                { id: 'toothpaste', x: 200, y: 500 }
            ];
            itemSpawns.forEach(s => this.items.add(new Collectible(this, s.x, s.y, s.id)));
        }
    }

    addOtherPlayer(playerInfo) {
        const otherPlayer = new Player(this, playerInfo.x, playerInfo.y, 'character', false);
        otherPlayer.playerId = playerInfo.playerId;
        this.otherPlayers.add(otherPlayer);
    }

    collectItem(player, item) {
        if (!this.inventory.includes(item.type)) {
            this.inventory.push(item.type);
            const itemName = STAGE_1_ITEMS[item.type]?.name || item.type;
            this.events.emit('showDialogue', `${itemName}을(를) 획득했다!`, "아이템 획득");
            this.events.emit('updateInventory', this.inventory);
        }
        item.collect();
    }

    handleItemUse(itemId) {
        const itemInfo = STAGE_1_ITEMS[itemId];
        if (!itemInfo) return;

        if (itemId === 'water_bottle' || itemId === 'sink') {
            if (this.currentStep === MISSION_STEPS.STEP_0_START) {
                this.currentStep = MISSION_STEPS.STEP_1_COOLED;
                this.events.emit('showDialogue', "잘했어! 화상 부위의 열기를 충분히 식혔구나.\n다음엔 어떻게 해야 할까?", "성공!");
                this.hearts = Math.min(this.hearts + 1, 3);
                this.events.emit('updateHearts', this.hearts);
            } else {
                this.events.emit('showDialogue', "이미 열기를 식혔어. 다음 단계로 넘어가자.", "알림");
            }
        } else if (itemId === 'gauze') {
            if (this.currentStep === MISSION_STEPS.STEP_1_COOLED) {
                this.currentStep = MISSION_STEPS.STEP_2_PROTECTED;
                this.events.emit('showDialogue', "완벽해! 깨끗한 거즈로 상처를 잘 감쌌어.\n이제 보건 선생님께 가보자.", "미션 완료!");

                // Change NPC appearance to recovered
                if (this.injuredNpc) {
                    this.injuredNpc.setTexture('npc_recovered');
                }
            } else if (this.currentStep === MISSION_STEPS.STEP_0_START) {
                this.hearts--;
                this.events.emit('updateHearts', this.hearts);
                this.events.emit('showDialogue', "앗! 열기가 남은 채로 감싸면 화상이 더 깊어질 수 있어!\n먼저 물로 식혀야 해.", "경고");
            }
        } else if (itemInfo.isValid === false) {
            this.hearts--;
            this.events.emit('updateHearts', this.hearts);
            this.events.emit('showDialogue', itemInfo.penaltyMsg, "위험한 행동!");
        }

        if (this.hearts <= 0) this.events.emit('showDialogue', "하트가 모두 소진되었습니다...", "실패");
    }

    playStorySequence(sequence) {
        this.dialogueQueue = [...this.dialogueQueue, ...sequence];
        if (this.dialogueQueue.length === sequence.length) this.showNextDialogue();
    }

    showNextDialogue() {
        if (this.dialogueQueue.length === 0) return;
        const next = this.dialogueQueue.shift();
        this.events.emit('showDialogue', next.text, next.name);
    }

    startIntroSequence() {
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

    update(time, delta) {
        [this.npc, this.injuredNpc, this.teacherNpc].forEach(n => n?.update(time, delta));

        if (this.player && this.player.body && this.cursors) {
            if (isUIOpen(useGameStore.getState())) {
                this.player.setVelocity(0).anims.stop();
                return;
            }

            // Get joystick state from UI_Scene
            const uiScene = this.scene.get('UI_Scene');
            const joystick = uiScene ? uiScene.joystick : null;

            this.player.update(this.cursors, joystick);

            const { x, y } = this.player;
            if (this.player.oldPosition && (Math.abs(x - this.player.oldPosition.x) > 0.1 || Math.abs(y - this.player.oldPosition.y) > 0.1)) {
                this.socket.emit('playerMovement', { x, y });
            }
            this.player.oldPosition = { x, y };
        }
    }
}
