import Phaser from 'phaser';
import { io } from 'socket.io-client';
import Player from '../objects/Player';
import NPC from '../objects/NPC';
import Collectible from '../objects/Collectibles';

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

        // --- Map Generation (Tiled) ---
        this.map = this.make.tilemap({ key: 'map1' });
        const floorTiles = this.map.addTilesetImage('Floor2', 'Floor2');
        const wallTiles = this.map.addTilesetImage('Wall', 'Wall');

        const grassLayer = this.map.createLayer('백그라운드/풀', [floorTiles, wallTiles], 0, 0);
        const groundLayer = this.map.createLayer('백그라운드/바닥', [floorTiles, wallTiles], 0, 0);
        const wallLayer = this.map.createLayer('미들그라운드/벽', [floorTiles, wallTiles], 0, 0);
        const wallFGLayer = this.map.createLayer('포어그라운드/벽-FG', [floorTiles, wallTiles], 0, 0);

        if (grassLayer) grassLayer.setDepth(0);
        if (groundLayer) groundLayer.setDepth(1);
        if (wallLayer) wallLayer.setDepth(2);
        if (wallFGLayer) wallFGLayer.setDepth(10);

        if (wallLayer) {
            wallLayer.setCollisionByExclusion([-1]);
            this.wallLayer = wallLayer;
        }

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
        this.cursors = this.input.keyboard.createCursorKeys();

        // --- NPC Setup ---
        this.npc = new NPC(this, 500, 500, 'princess');
        if (this.wallLayer) this.physics.add.collider(this.npc, this.wallLayer);

        // --- Game State Variables ---
        this.outletsFixed = 0;
        this.hasExtinguisher = false;

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
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        });

        this.scene.launch('UI_Scene');
    }

    addPlayer(playerInfo) {
        // Create Player
        this.player = new Player(this, playerInfo.x, playerInfo.y, 'character');
        this.player.isMyPlayer = true;

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Collision: Player vs Wall
        if (this.wallLayer) {
            this.physics.add.collider(this.player, this.wallLayer);
        }

        // Collision: Player vs NPC
        if (this.npc) {
            this.physics.add.collider(this.player, this.npc, () => {
                this.npc.speak();
            });
        }

        // --- Spawn Items (Once player exists) ---
        // 1. Extinguisher
        this.items.add(new Collectible(this, 600, 100, 'extinguisher'));

        // 2. Outlets (Hazards)
        this.items.add(new Collectible(this, 300, 300, 'outlet'));
        this.items.add(new Collectible(this, 700, 200, 'outlet'));
        this.items.add(new Collectible(this, 200, 500, 'outlet'));

        // Collider: Player vs Items (Solid interaction)
        this.physics.add.collider(this.player, this.items, this.collectItem, null, this);
    }

    addOtherPlayer(playerInfo) {
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'character');
        otherPlayer.setScale(2);
        otherPlayer.setDepth(5);
        otherPlayer.playerId = playerInfo.playerId;
        this.otherPlayers.add(otherPlayer);

        otherPlayer.body.setSize(16, 20);
        otherPlayer.body.setOffset(8, 4);
    }

    collectItem(player, item) {
        if (item.type === 'extinguisher') {
            item.collect();
            this.hasExtinguisher = true;
            this.events.emit('showDialogue', "소화기를 획득했다!\n이제 과열된 콘센트를 안전하게 뜰 수 있어.", "아이템 획득");
        } else if (item.type === 'outlet') {
            if (this.hasExtinguisher) {
                item.collect();
                this.outletsFixed++;

                if (this.outletsFixed >= 3) {
                    this.events.emit('showDialogue', "모든 위험 요소를 제거했어!\n정말 훌륭해, 안전 지킴이!", "미션 성공!");
                } else {
                    this.events.emit('showDialogue', `과열된 콘센트 차단 완료!\n남은 위험 요소: ${3 - this.outletsFixed}개`, "진행 중");
                }
            } else {
                // Warning
                const uiScene = this.scene.get('UI_Scene');
                if (uiScene && uiScene.dialogueBox && !uiScene.dialogueBox.visible) {
                    this.events.emit('showDialogue', "앗 뜨거! 너무 위험해.\n먼저 [소화기]를 찾아와야 해!", "경고");
                }
            }
        }
    }

    update(time, delta) {
        if (this.npc) {
            this.npc.update(time, delta);
        }

        if (this.player) {
            this.player.update(this.cursors);

            // Network Emission
            const x = this.player.x;
            const y = this.player.y;
            if (this.player.oldPosition && (Math.abs(x - this.player.oldPosition.x) > 0.1 || Math.abs(y - this.player.oldPosition.y) > 0.1)) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
            }
            this.player.oldPosition = { x: this.player.x, y: this.player.y };
        }
    }
}
