import Phaser from 'phaser';
import { io } from 'socket.io-client';

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 60, 'LOBBY', { fontSize: '64px', fontStyle: 'bold' }).setOrigin(0.5);
        this.statusText = this.add.text(width / 2, 120, 'Waiting for players...', { fontSize: '24px', color: '#aaaaaa' }).setOrigin(0.5);

        // Player List Container
        this.playerListContainer = this.add.container(width / 2, height / 2 - 50);

        // Connect Socket
        this.socket = io();
        this.players = {};

        // Events
        this.socket.on('currentPlayers', (players) => {
            this.players = players;
            this.updateList();
        });

        this.socket.on('newPlayer', (player) => {
            this.players[player.playerId] = player;
            this.updateList();
        });

        this.socket.on('playerUpdate', (player) => {
            this.players[player.playerId] = player;
            this.updateList();
            this.updateMyButton(player);
        });

        this.socket.on('playerDisconnected', (id) => {
            delete this.players[id];
            this.updateList();
        });

        this.socket.on('startGame', () => {
            this.socket.removeAllListeners(); // Accessing socket in next scene requires clean listeners usually, or keep them if they are global
            // Validating: should I remove listeners? Maybe yes for Lobby listeners.
            this.scene.start('GameScene', { socket: this.socket });
        });

        // Ready Button
        this.readyBtn = this.add.rectangle(width / 2, height - 100, 200, 80, 0xff0000)
            .setInteractive({ useHandCursor: true });
        this.readyBtnText = this.add.text(width / 2, height - 100, 'NOT READY', { fontSize: '32px', fontStyle: 'bold' }).setOrigin(0.5);

        this.readyBtn.on('pointerdown', () => {
            this.socket.emit('playerReady');
        });
    }

    updateList() {
        this.playerListContainer.removeAll(true);

        const playerIds = Object.keys(this.players);
        const startY = -100;
        const gapY = 60;

        playerIds.forEach((id, index) => {
            const p = this.players[id];
            const isMe = id === this.socket.id;
            const color = p.isReady ? '#00ff00' : '#ffffff';
            const text = `Player ${index + 1} ${isMe ? '(YOU)' : ''} - ${p.isReady ? 'READY' : 'WAITING'}`;

            const playerText = this.add.text(0, startY + (index * gapY), text, {
                fontSize: '28px',
                color: color
            }).setOrigin(0.5);

            this.playerListContainer.add(playerText);
        });

        this.statusText.setText(`${playerIds.length} / 4 Players`);
    }

    updateMyButton(player) {
        if (player.playerId === this.socket.id) {
            if (player.isReady) {
                this.readyBtn.setFillStyle(0x00ff00);
                this.readyBtnText.setText('READY!');
            } else {
                this.readyBtn.setFillStyle(0xff0000);
                this.readyBtnText.setText('NOT READY');
            }
        }
    }
}
