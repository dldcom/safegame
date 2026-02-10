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
            debug: true // Enable debug to see hitboxes
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
        GameScene,
        UI_Scene
    ]
};

let game = null;

export const initGame = (data) => {
    if (!game) {
        game = new Phaser.Game(config);
        window.game = game;
    }

    // 데이터(stageId, roomId 등)를 게임 인스턴스에 저장
    game._initData = data;

    // [중요] 이미 게임이 실행 중이라면, 새로운 데이터를 가지고 Preloader부터 다시 시작하게 함
    if (game.scene.isActive('PreloaderScene') || game.scene.isActive('GameScene')) {
        console.log(">>> [initGame] Game already running. Restarting Preloader with new data...");
        game.scene.scenes.forEach(scene => scene.scene.stop());
        game.scene.start('PreloaderScene');
    }

    return game;
};

export default initGame;
