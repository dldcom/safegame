import Phaser from 'phaser';
import { io } from 'socket.io-client';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Connect to socket
        this.socket = io(); // Connects to the same host/port by default, proxied by Vite

        this.otherPlayers = this.physics.add.group();

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

        this.socket.on('disconnect', (playerId) => {
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

        this.cursors = this.input.keyboard.createCursorKeys();

        this.add.text(20, 20, 'Safety Game - Game Scene', { fontSize: '20px', fill: '#ffffff' });
    }

    addPlayer(playerInfo) {
        // Placeholder rectangle for player
        this.player = this.add.rectangle(playerInfo.x, playerInfo.y, 40, 40, 0xff0000);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
    }

    addOtherPlayer(playerInfo) {
        const otherPlayer = this.add.rectangle(playerInfo.x, playerInfo.y, 40, 40, 0x0000ff);
        otherPlayer.playerId = playerInfo.playerId;
        this.physics.add.existing(otherPlayer);
        this.otherPlayers.add(otherPlayer);
    }

    update() {
        if (this.player) {
            // Player movement logic would go here
            if (this.cursors.left.isDown) {
                this.player.body.setVelocityX(-160);
            } else if (this.cursors.right.isDown) {
                this.player.body.setVelocityX(160);
            } else {
                this.player.body.setVelocityX(0);
            }

            if (this.cursors.up.isDown) {
                this.player.body.setVelocityY(-160);
            } else if (this.cursors.down.isDown) {
                this.player.body.setVelocityY(160);
            } else {
                this.player.body.setVelocityY(0);
            }

            // Emit player movement
            const x = this.player.x;
            const y = this.player.y;
            if (this.player.previousX !== x || this.player.previousY !== y) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
            }
            this.player.previousX = this.player.x;
            this.player.previousY = this.player.y;
        }
    }
}
