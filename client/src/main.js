import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import LobbyScene from './scenes/LobbyScene';
import GameScene from './scenes/GameScene';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#3bb78f',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down game, no gravity
            debug: true // Enable debug to see hitboxes
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        PreloaderScene,
        LobbyScene,
        GameScene
    ]
};

const game = new Phaser.Game(config);

export default game;
