import Phaser from 'phaser';
import { io } from 'socket.io-client';
import useGameStore from '../store/useGameStore';

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    create() {
        // Ensure UI_Scene is hidden during lobby
        this.scene.stop('UI_Scene');

        // Show the React Lobby UI
        useGameStore.getState().setLobbyOpen(true);
        useGameStore.getState().setGameStarted(false);

        // Connect Socket
        this.socket = io();
        this.players = {};

        // Events
        this.socket.on('connect', () => {
            // Store socket ID globally for React to know who "Me" is
            window.game.socketId = this.socket.id;
        });

        this.socket.on('currentPlayers', (players) => {
            this.players = players;
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

    syncWithReact() {
        // Push the player list to Zustand
        const playerList = Object.values(this.players);
        useGameStore.getState().setLobbyPlayers(playerList);
    }
}
