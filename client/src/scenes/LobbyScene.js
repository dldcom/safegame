import Phaser from 'phaser';
import useGameStore from '../store/useGameStore';
import { getSocket } from '../services/socket';

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

            this.players = {};

            // 싱글톤 소켓 사용
            this.socket = getSocket();

            if (this.socket) {
                // 이미 연결되어 있을 수 있으므로 상태 확인
                if (this.socket.connected) {
                    this.onConnect();
                } else {
                    this.socket.on('connect', () => this.onConnect());
                }

                this.socket.on('connect_error', (err) => {
                    console.warn(">>> [LobbyScene] Socket connection delay/fail. Reason:", err.message);
                });

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

                this.socket.on('startGame', (data) => {
                    console.log(">>> [LobbyScene] startGame event received. Transitioning to GameScene...");
                    // 리스너 정리 (씬 전환 시 중복 방지)
                    this.socket.off('currentPlayers');
                    this.socket.off('newPlayer');
                    this.socket.off('playerUpdate');
                    this.socket.off('playerDisconnected');
                    this.socket.off('startGame');

                    useGameStore.getState().setLobbyOpen(false);
                    useGameStore.getState().setGameStarted(true);

                    // 게임 시작 데이터(스테이지 정보 등)와 함께 이동
                    this.scene.start('GameScene', {
                        socket: this.socket,
                        stageId: data.stageId,
                        roomId: data.roomId
                    });
                });
            }
        } catch (error) {
            console.error(">>> [LobbyScene] Fatal Error:", error);
            useGameStore.getState().setLobbyOpen(true);
        }
    }

    onConnect() {
        console.log(">>> [LobbyScene] Socket connected/ready! ID:", this.socket.id);
        this.socket.emit('joinLobby');
        if (window.game) window.game.socketId = this.socket.id;
    }

    syncWithReact() {
        const playerList = Object.values(this.players);
        useGameStore.getState().setLobbyPlayers(playerList);
    }
}
