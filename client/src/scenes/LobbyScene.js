import Phaser from 'phaser';
import { io } from 'socket.io-client';
import useGameStore from '../store/useGameStore';

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    create() {
        console.log(">>> [LobbyScene] Create started.");

        try {
            this.scene.stop('UI_Scene');

            const store = useGameStore.getState();
            store.setLobbyOpen(true);
            store.setGameStarted(false);

            // [개선] 연결을 기다리지 않고 로컬 플레이어 정보를 즉시 생성하여 동기화
            this.players = {};
            this.players['local-player'] = {
                playerId: 'local-player',
                username: '학생 (나)',
                isReady: false,
                color: 0x4da6ff
            };
            this.syncWithReact();
            console.log(">>> [LobbyScene] Local player initialized immediately.");

            // 소켓 연결 시도 (최적화된 설정)
            console.log(">>> [LobbyScene] Attempting socket connection...");
            this.socket = io({
                reconnectionAttempts: 3,
                timeout: 5000,
                // transports: ['websocket'] 제거: 프록시 환경에서는 polling 후 upgrade가 더 안정적일 수 있음
            });

            if (this.socket) {
                this.socket.on('connect', () => {
                    console.log(">>> [LobbyScene] Socket connected! ID:", this.socket.id);

                    // 서버에 명시적으로 로비 진입 알림
                    this.socket.emit('joinLobby');

                    // 서버 연결 성공 시 로컬 임시 플레이어 제거
                    if (this.players['local-player']) {
                        delete this.players['local-player'];
                    }
                    if (window.game) window.game.socketId = this.socket.id;
                });

                this.socket.on('connect_error', (err) => {
                    console.warn(">>> [LobbyScene] Socket connection delay/fail. Reason:", err.message);
                    // solo mode fallback은 이미 초기화된 local-player로 유지됨
                });

                // 서버로부터 오는 이벤트만 업데이트
                this.socket.on('currentPlayers', (players) => {
                    this.players = { ...this.players, ...players };
                    this.syncWithReact();
                });

                this.socket.on('newPlayer', (player) => {
                    this.players[player.playerId] = player;
                    this.syncWithReact();
                });

                this.socket.on('playerUpdate', (player) => {
                    this.players[player.playerId] = player;
                    this.syncWithReact();
                });

                this.socket.on('playerDisconnected', (id) => {
                    delete this.players[id];
                    this.syncWithReact();
                });

                this.socket.on('startGame', () => {
                    this.socket.removeAllListeners();
                    useGameStore.getState().setLobbyOpen(false);
                    useGameStore.getState().setGameStarted(true);
                    this.scene.start('GameScene', { socket: this.socket });
                });
            }
        } catch (error) {
            console.error(">>> [LobbyScene] Fatal Error:", error);
            useGameStore.getState().setLobbyOpen(true);
        }
    }

    syncWithReact() {
        const playerList = Object.values(this.players);
        useGameStore.getState().setLobbyPlayers(playerList);
    }
}
