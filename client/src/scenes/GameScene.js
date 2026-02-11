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
        this.isSpawningLocalPlayer = false; // [추가] 중복 생성 방지용 플래그
        this.spawningRemotePlayers = new Set(); // [추가] 원격 플레이어 중복 생성 방지용
        this.introStarted = false; // [추가] 인트로 중복 재생 방지
        this.hasCreated = false; // [추가] create 로직 중복 실행 방지
    }

    init(data) {
        this.socket = data.socket;
        this.roomId = data.roomId;
        this.stageId = data.stageId; // 로비에서 넘어온 스테이지 ID
        this.startTime = Date.now(); // 미션 시작 시각 기록

        // 스테이지 ID가 있는 경우 스토어 업데이트 및 상태 초기화
        if (this.stageId) {
            // "stage_1" 또는 "BURN_FIRST_AID" 같은 값을 숫자로 변환 필요할 수 있음
            // 여기서는 문자열 키 그대로 맵 키로 사용하도록 설계
            this.resetState();
        }
    }

    create() {
        // [추가] 외부 이미지(uploads) 로딩 시 CORS 보안 차단 방지
        this.load.setCrossOrigin('anonymous');
        this.load.on('loaderror', (file) => {
            console.error(`>>> [Loader Error] Failed to load: ${file.key} from ${file.url}`);
        });

        if (!this.socket) this.socket = io();

        const mapKey = `stage_${this.currentStage}`;
        const store = useGameStore.getState();
        const customMap = store.customMaps[mapKey];

        // [핵심] 맵이 캐시에 없거나 커스텀 맵인 경우 동적으로 로드
        if (!this.cache.tilemap.has(mapKey)) {
            console.log(`>>> [GameScene] Loading map dynamically for ${mapKey}`);

            // 로딩 메시지 표시
            const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, '맵 데이터를 불러오는 중...', {
                fontFamily: 'Noto Serif KR', fontSize: '24px', color: '#ffffff'
            }).setOrigin(0.5);

            const startLoading = (data) => {
                let jsonData = data;
                if (data) {
                    if (typeof data === 'string') {
                        try { jsonData = JSON.parse(data); } catch (e) { console.error("Parse error", e); }
                    }

                    // 1. [핵심] JSON 안에 배경 이미지가 있다면 로더에 먼저 등록
                    const props = jsonData.properties || [];
                    const bgProp = Array.isArray(props) ? props.find(p => p.name === 'bgImage') : null;
                    if (bgProp && bgProp.value) {
                        console.log(`>>> [GameScene] Registering AI background image to loader...`);
                        this.load.image(`${mapKey}_bg`, bgProp.value);
                    }

                    // 2. JSON 데이터 로드
                    this.load.tilemapTiledJSON(mapKey, null, jsonData);
                } else {
                    console.log(`>>> [GameScene] No data, loading fallback: assets/maps/${mapKey}.json`);
                    this.load.tilemapTiledJSON(mapKey, `assets/maps/${mapKey}.json`);
                }

                this.load.once('complete', () => {
                    console.log(`>>> [GameScene] All assets (JSON + AI Image) loaded.`);
                    loadingText.destroy();
                    this.continueCreate();
                });
                this.load.start();
            };

            // [수정] Stage 1, 2, 3 모두 DB에 커스텀 데이터가 있는지 먼저 확인
            if (customMap) {
                startLoading(customMap);
            } else {
                // DB에서 가져오기 시도
                fetch(`/api/map/${mapKey}`)
                    .then(res => {
                        if (res.status === 404) throw new Error('Not Found');
                        return res.json();
                    })
                    .then(data => {
                        if (data && data.content) {
                            console.log(`>>> [GameScene] Success: Custom map "${mapKey}" loaded from DB.`);
                            startLoading(data.content);
                        } else {
                            startLoading(null);
                        }
                    })
                    .catch(() => {
                        console.log(`>>> [GameScene] Fallback: Using local asset for "${mapKey}".`);
                        startLoading(null);
                    });
            }
        } else {
            this.continueCreate();
        }
    }

    continueCreate() {
        if (this.hasCreated) return;
        this.hasCreated = true;

        const map = this.setupMap();
        this.setupPhysicsGroups();
        this.setupEvents();
        this.setupAnimations();
        this.scene.launch('UI_Scene');

        // NPC 데이터를 먼저 받아온 후 오브젝트 스폰
        fetch('/api/npc/list')
            .then(res => res.json())
            .then(npcs => {
                this.dbNpcs = npcs;
                this.spawnObjects(map);
                this.setupNetwork();

                if (this.currentStage === 1 && !this.introStarted) {
                    this.startIntroSequence();
                } else {
                    console.log(`>>> [GameScene] Stage ${this.currentStage} started in free roam.`);
                }
            })
            .catch(err => {
                console.error(">>> [GameScene] Failed to fetch NPC list:", err);
                this.dbNpcs = [];
                this.spawnObjects(map);
                this.setupNetwork();
            });
    }

    setupMap() {
        const mapKey = `stage_${this.currentStage}`;
        const map = this.make.tilemap({ key: mapKey });

        // [NEW] AI 생성 이미지 배경 처리
        const properties = map.properties || [];
        const bgProperty = Array.isArray(properties) ? properties.find(p => p.name === 'bgImage') : null;
        if (bgProperty && bgProperty.value) {
            const bgKey = `${mapKey}_bg`;
            console.log(`>>> [GameScene] Rendering AI Map Background: ${bgKey}`);
            const bg = this.add.image(0, 0, bgKey).setOrigin(0, 0).setDepth(0);

            // [수정] 이미지 크기를 맵 크기(1024x1024)에 딱 맞게 강제 조정
            bg.setDisplaySize(map.widthInPixels, map.heightInPixels);

            // 투명한 충돌 레이어 생성 (시각적 자산으로 'Wall' 재사용)
            const collisionTileset = map.addTilesetImage('CollisionTile', 'Wall');
            this.wallLayer = map.createLayer('collision', collisionTileset, 0, 0);

            if (this.wallLayer) {
                this.wallLayer.setAlpha(0); // 실제 게임에서는 충돌 영역을 숨김
                this.wallLayer.setCollisionByExclusion([-1]);
                this.wallLayer.setDepth(1);
            }
        } else {
            // [OLD] 기존 타일셋 기반 렌더링 로직 (Stage 1, 2, 3 등)
            let tilesets = [];
            if (this.currentStage === 1 || this.currentStage === 3) {
                tilesets = [
                    map.addTilesetImage('Wall', 'Wall'),
                    map.addTilesetImage('Floor2', 'Floor2'),
                    map.addTilesetImage('Exterior_Wall', 'Exterior_Wall')
                ];
                const validTilesets = tilesets.filter(t => t !== null);
                map.createLayer('background', validTilesets, 0, 0);
                this.wallLayer = map.createLayer('middleground', validTilesets, 0, 0);
                const foregroundLayer = map.createLayer('foreground', validTilesets, 0, 0);
                if (this.wallLayer) this.wallLayer.setDepth(1).setCollisionByExclusion([-1]);
                if (foregroundLayer) foregroundLayer.setDepth(10);
            } else if (this.currentStage === 2) {
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
        }

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        return map;
    }

    setupPhysicsGroups() {
        this.otherPlayers = this.physics.add.group();
        this.npcs = this.physics.add.group();
        this.items = this.physics.add.group({ immovable: true, allowGravity: false });

        if (this.wallLayer) {
            this.physics.add.collider(this.npcs, this.wallLayer);
        }
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

            const endTime = Date.now();
            const timeDiff = Math.floor((endTime - this.startTime) / 1000); // 초 단위
            const baseScore = 1000;
            const finalScore = Math.max(100, baseScore - (timeDiff * 2)); // 1초당 2점 감점, 최소 100점

            console.log(`>>> [GameScene] Mission Complete! Time: ${timeDiff}s, Score: ${finalScore}`);

            // 스토어 업데이트 (나만 결과창을 엶)
            useGameStore.getState().setGameResult({
                isOpen: true,
                startTime: this.startTime,
                endTime: endTime,
                score: finalScore
            });

            // 서버에 알림
            if (this.socket) {
                this.socket.emit('gameComplete', {
                    roomId: this.roomId,
                    score: finalScore,
                    time: timeDiff
                });
            }
        });

        this.events.on('uiDialogueEnded', () => {
            if (this.dialogueQueue.length > 0) {
                this.showNextDialogue();
            } else if (this.pendingQuiz) {
                this.pendingQuiz = false;
                this.events.emit('openQuiz', STAGE_1_QUIZ.slice(0, 3));
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
        console.log(`>>> [GameScene] Setting up network for room: ${this.roomId}`);

        const onJoin = () => {
            console.log(`>>> [GameScene] Socket connected/ready. ID: ${this.socket.id}`);
            // 내가 어떤 방에 들어가는지 서버에 알림 (사용자 이름도 함께 전달하여 세션 복구 지원)
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            this.socket.emit('joinGame', {
                roomId: this.roomId,
                username: user.username,
                skin: user.equippedSkin || 'skin_default',
                titleName: user.equippedTitle || '',
                customCharacter: user.customCharacter || null
            });
        };

        // [핵심] 서버로부터 "너는 이 데이터로 시작해"라는 확답을 받았을 때
        this.socket.on('initPlayer', (pData) => {
            if (this.player) return; // 이미 있으면 무시
            console.log(">>> [GameScene] initPlayer received. Spawning ME:", pData.username);
            this.addPlayer(pData);
        });

        this.socket.on('currentPlayers', (players) => {
            const count = Object.keys(players).length;
            console.log(`>>> [GameScene] Received currentPlayers. Count: ${count}`, players);

            const userObj = JSON.parse(localStorage.getItem('user') || '{}');
            const myUsername = (userObj.username || '').trim();

            Object.keys(players).forEach((id) => {
                const pData = players[id];
                const cleanPName = (pData.username || '').trim();

                // 이미 생성된 캐릭터인지 확인 (다른 플레이어 포함)
                const alreadyExists = (this.player && (this.player.playerId === id || this.player.username === cleanPName)) ||
                    this.otherPlayers.getChildren().some(p => p.playerId === id || p.username === cleanPName);
                if (alreadyExists) return;

                // 나 자신인지 확인 (initPlayer로 안 만들어졌을 경우를 대비한 백업)
                const isMe = (id === this.socket.id) || (cleanPName === myUsername);

                if (isMe && !this.player) {
                    console.log(`>>> [GameScene] LOCAL player matched (Backup)! ID: ${id}`);
                    this.addPlayer(pData);
                } else if (!isMe) {
                    console.log(`>>> [GameScene] Adding REMOTE player: ${cleanPName}`);
                    this.addOtherPlayer(pData);
                }
            });
        });

        this.socket.on('newPlayer', (playerInfo) => {
            if (playerInfo.playerId !== this.socket.id) {
                this.addOtherPlayer(playerInfo);
            }
        });

        this.socket.on('playerDisconnected', (id) => {
            this.otherPlayers.getChildren().forEach(p => { if (p.playerId === id) p.destroy(); });
        });

        this.socket.on('playerMoved', (info) => {
            this.otherPlayers.getChildren().forEach(p => {
                if (info.playerId === p.playerId) {
                    p.setPosition(info.x, info.y);
                    if (p.updateRemoteAnimation) p.updateRemoteAnimation(info.vx || 0, info.vy || 0);
                }
            });
        });

        this.socket.on('gameResultsUpdated', (rankings) => {
            console.log(">>> [GameScene] Received Rankings:", rankings);
            // 랭킹 목록만 갱신하고, 창을 띄우지는 않음 (isOpen 제거)
            useGameStore.getState().setGameResult({
                rankings: rankings
            });
        });

        // [방어 코드] 만약 5초 동안 플레이어가 생성되지 않으면 강제로 기본 데이터로 생성 시도
        this.time.delayedCall(5000, () => {
            if (!this.player) {
                console.warn(">>> [GameScene] Player not spawned after 5s. Forcing fallback spawn...");
                this.addPlayer({ username: '임시_플레이어', color: 0xffffff });
            }
        });

        // 소켓이 이미 연결되어 있다면 즉시 실행, 아니면 connect 이벤트 대기
        if (this.socket.connected) {
            onJoin();
        } else {
            this.socket.once('connect', onJoin);
        }
    }

    spawnObjects(map) {
        const spawnLayer = map.getObjectLayer('spawn');
        let hasCustomObjects = false;

        if (spawnLayer && spawnLayer.objects) {
            spawnLayer.objects.forEach(obj => {
                hasCustomObjects = true;
                const name = obj.name;

                if (name === 'playerspawn') {
                    this.initialPlayerPos = { x: obj.x, y: obj.y };
                }
                else if (name.startsWith('npc_')) {
                    let npcType = name.replace('npc_', '');

                    // [추가] 스테이지 1의 기본 역할을 DB 캐릭터로 매핑
                    if (npcType === 'hurt' || npcType === 'injured' || npcType === 'npc_hurt') {
                        npcType = 'lion';
                    } else if (npcType === 'teacher' || npcType === 'teacher_npc' || npcType === 'npcspawn') {
                        npcType = 'doctor';
                    }

                    // DB에서 해당 이름의 NPC가 있는지 확인 (사용자가 입력한 이름 기준)
                    const dbNpc = this.dbNpcs?.find(n => n.name === npcType);

                    if (dbNpc) {
                        const textureKey = `db_npc_${dbNpc.name}`;

                        const spawnDynamicNpc = () => {
                            const npc = new NPC(this, obj.x, obj.y, textureKey, {
                                displayName: dbNpc.name,
                                atlasData: dbNpc.atlasData,
                                type: (dbNpc.name === 'doctor') ? 'moving' : 'static'
                            });

                            // Stage 1 특정 로직: 미션 단계 판별을 위해 변수 할당
                            if (dbNpc.name === 'lion') this.injuredNpc = npc;
                            if (dbNpc.name === 'doctor') this.teacherNpc = npc;
                        };

                        if (!this.textures.exists(textureKey)) {
                            this.load.spritesheet(textureKey, dbNpc.imagePath, { frameWidth: 48, frameHeight: 64 });
                            this.load.once(`filecomplete-spritesheet-${textureKey}`, () => {
                                spawnDynamicNpc();
                                if (this.npcs && this.teacherNpc && dbNpc.name === 'doctor') this.npcs.add(this.teacherNpc);
                                if (this.npcs && this.injuredNpc && dbNpc.name === 'lion') this.npcs.add(this.injuredNpc);
                            });
                            this.load.start();
                        } else {
                            spawnDynamicNpc();
                            if (this.npcs && this.teacherNpc && dbNpc.name === 'doctor') this.npcs.add(this.teacherNpc);
                            if (this.npcs && this.injuredNpc && dbNpc.name === 'lion') this.npcs.add(this.injuredNpc);
                        }
                    }
                    // DB에 없을 때만 기존 하드코딩된 에셋 사용 (하위 호환)
                    else {
                        if (npcType === 'lion' || npcType === 'hurt') {
                            this.injuredNpc = new NPC(this, obj.x, obj.y, 'npc_hurt', { displayName: '다친 친구' });
                            this.npcs.add(this.injuredNpc);
                        } else if (npcType === 'doctor' || npcType === 'teacher') {
                            this.teacherNpc = new NPC(this, obj.x, obj.y, 'npc_teacher', { displayName: '보건 선생님' });
                            this.npcs.add(this.teacherNpc);
                        } else {
                            const newCustomNpc = new NPC(this, obj.x, obj.y, 'character', { displayName: npcType });
                            this.npcs.add(newCustomNpc);
                        }
                    }
                }
                else if (name.startsWith('item_')) {
                    const itemType = name.replace('item_', '');
                    console.log(`>>> [GameScene] Spawning custom item: ${itemType}`);
                    this.items.add(new Collectible(this, obj.x, obj.y, itemType));
                }
                else if (name === 'sinkspawn' || name === 'item_sink') {
                    this.sink = this.physics.add.sprite(obj.x, obj.y, 'sink').setImmovable(true);
                }
                // legacy spawn logic removed to prevent duplicates
            });
        }

        // Floating NPC removed

        // 아이템 스폰 (Stage 1 기본 로직): 커스텀 오브젝트 레이어가 없을 때만 동작
        if (this.currentStage === 1 && !hasCustomObjects) {
            const itemSpawns = [
                { id: 'water_bottle', x: 600, y: 100 },
                { id: 'gauze', x: 300, y: 300 },
                { id: 'ice_pack', x: 700, y: 200 },
                { id: 'toothpaste', x: 200, y: 500 }
            ];
            itemSpawns.forEach(s => this.items.add(new Collectible(this, s.x, s.y, s.id)));
        }

        // Group collider is already set up in setupPhysicsGroups
    }

    addPlayer(playerInfo) {
        if (!playerInfo) {
            console.error(">>> [GameScene] Cannot add player: playerInfo is null");
            return;
        }

        if (this.player || this.isSpawningLocalPlayer) return; // 이미 생성 중이거나 생성됨
        this.isSpawningLocalPlayer = true;

        // 서버에서 준 좌표를 우선적으로 사용 (없으면 기본 스폰 위치)
        // [수정] 서버의 기본 좌표(400, 300)보다 맵의 spawn 포인트(initialPlayerPos)를 우선함
        const spawnX = this.initialPlayerPos.x || playerInfo.x;
        const spawnY = this.initialPlayerPos.y || playerInfo.y;

        console.log(`>>> [GameScene] Spawning local player at (${spawnX}, ${spawnY})`);

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userStats = useGameStore.getState().userStats;
        const customChar = (userStats && userStats.customCharacter) || (savedUser && savedUser.customCharacter) || playerInfo.customCharacter;

        const textureKey = customChar ? `custom_${playerInfo.username}` : 'character';

        const spawnPlayer = () => {
            if (this.player) {
                this.isSpawningLocalPlayer = false;
                return;
            }

            this.player = new Player(this, spawnX, spawnY, textureKey, {
                isMyPlayer: true,
                username: playerInfo.username || '알 수 없음',
                color: playerInfo.color || 0xffffff,
                skin: playerInfo.skin || savedUser.equippedSkin || 'skin_default',
                titleName: playerInfo.titleName || savedUser.equippedTitle || ''
            });
            this.player.playerId = playerInfo.playerId || this.socket.id;
            this.isSpawningLocalPlayer = false; // 생성 완료 후 플래그 해제

            // 카메라 설정 강화
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            this.cameras.main.setZoom(1);
            this.cameras.main.fadeIn(500);

            this.physics.add.collider(this.player, this.wallLayer);
            this.physics.add.collider(this.player, this.items, this.collectItem, null, this);

            // NPC 및 오브젝트 충돌 설정 (플레이어 생성 후로 이동)

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

            console.log(`>>> [GameScene] Local player spawned and colliders set up. ID: ${this.player.playerId}`);
        };

        if (customChar && !this.textures.exists(textureKey)) {
            console.log(`>>> [GameScene] Loading MY custom texture: ${textureKey}`);
            this.load.spritesheet(textureKey, customChar.imagePath, { frameWidth: 48, frameHeight: 64 });
            this.load.once('complete', spawnPlayer);
            this.load.start();
        } else {
            spawnPlayer();
        }

        console.log(">>> [GameScene] Local player add procedure initiated.");
    }

    addOtherPlayer(playerInfo) {
        if (!playerInfo || !playerInfo.playerId) return;

        // 이미 생성되었거나 현재 생성(로딩) 중인지 확인
        const alreadyExists = this.otherPlayers.getChildren().some(p => p.playerId === playerInfo.playerId);
        if (alreadyExists || this.spawningRemotePlayers.has(playerInfo.playerId)) return;

        this.spawningRemotePlayers.add(playerInfo.playerId); // 생성 대기 목록에 추가

        const textureKey = playerInfo.customCharacter ? `custom_${playerInfo.username}` : 'character';

        const spawnOther = () => {
            this.spawningRemotePlayers.delete(playerInfo.playerId); // 로드 완료 시 제거
            if (this.otherPlayers.getChildren().some(p => p.playerId === playerInfo.playerId)) return;

            const otherPlayer = new Player(this, playerInfo.x, playerInfo.y, textureKey, {
                isMyPlayer: false,
                username: playerInfo.username,
                color: playerInfo.color,
                skin: playerInfo.skin || 'skin_default',
                titleName: playerInfo.titleName || ''
            });
            otherPlayer.playerId = playerInfo.playerId;
            this.otherPlayers.add(otherPlayer);
            console.log(`>>> [GameScene] Remote player ${playerInfo.username} spawned with texture: ${textureKey}`);
        };

        if (playerInfo.customCharacter && !this.textures.exists(textureKey)) {
            console.log(`>>> [GameScene] Loading REMOTE custom texture: ${textureKey}`);
            this.load.spritesheet(textureKey, playerInfo.customCharacter.imagePath, { frameWidth: 48, frameHeight: 64 });
            this.load.once('complete', spawnOther);
            this.load.start();
        } else {
            spawnOther();
        }
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
        if (this.introStarted) return;
        this.introStarted = true;

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
        [this.injuredNpc, this.teacherNpc].forEach(n => n?.update(time, delta));

        // 모든 원격 플레이어 업데이트 (이름표 위치 갱신 등)
        if (this.otherPlayers) {
            this.otherPlayers.getChildren().forEach(p => p.update());
        }

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
            const vx = this.player.body.velocity.x;
            const vy = this.player.body.velocity.y;

            if (this.player.oldPosition && (Math.abs(x - this.player.oldPosition.x) > 0.1 || Math.abs(y - this.player.oldPosition.y) > 0.1)) {
                this.socket.emit('playerMovement', { x, y, vx, vy });
            }
            this.player.oldPosition = { x, y };
        }
    }
}
