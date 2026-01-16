import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloaderScene from './scenes/PreloaderScene';
import TitleScene from './scenes/TitleScene';
import LobbyScene from './scenes/LobbyScene';
import GameScene from './scenes/GameScene';
import UI_Scene from './scenes/UI_Scene';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    backgroundColor: '#3bb78f',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down game, no gravity
            debug: false // Disable debug to hide hitboxes
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: '100%',
        height: '100%'
    },
    scene: [
        BootScene,
        PreloaderScene,
        TitleScene,
        LobbyScene,
        GameScene,
        UI_Scene
    ]
};

const game = new Phaser.Game(config);
window.game = game;

export default game;
