import Phaser from 'phaser';
import useGameStore from '../store/useGameStore';
import { getSocket } from '../services/socket';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        const store = useGameStore.getState();
        const customMaps = store.customMaps || {};

        // Support Stage 3 dynamic loading & AI Backgrounds
        Object.keys(customMaps).forEach(stageId => {
            const mapData = customMaps[stageId];
            if (mapData) {
                console.log(`>>> [Preloader] Loading custom map: ${stageId}`);
                this.load.tilemapTiledJSON(stageId, mapData);

                // AI 배경 이미지가 있다면 함께 로딩 [핵심]
                const props = mapData.properties || [];
                const bgProp = Array.isArray(props) ? props.find(p => p.name === 'bgImage') : null;
                if (bgProp && bgProp.value) {
                    console.log(`>>> [Preloader] AI background detected for ${stageId}, registering to loader.`);
                    this.load.image(`${stageId}_bg`, bgProp.value);
                }
            }
        });

        // Load default maps if not custom
        if (!customMaps['stage_1']) this.load.tilemapTiledJSON('stage_1', 'assets/maps/stage_1.json');
        if (!customMaps['stage_2']) this.load.tilemapTiledJSON('stage_2', 'assets/maps/stage_2.json');

        // Load Tileset Images
        this.load.image('Wall', '/assets/tilesets/Wall.png');
        this.load.image('Floor2', '/assets/tilesets/Floor2.png');
        this.load.image('Exterior_Wall', '/assets/tilesets/Exterior_Wall.png');
        this.load.image('Exterior_Decoration', '/assets/tilesets/Exterior_Decoration.png');

        // Placeholder items for Stage 2
        this.load.image('handkerchief', '/assets/tilesets/stage_1/gauze.png'); // Reuse gauze for now
        this.load.image('handkerchief_wet', '/assets/tilesets/stage_1/gauze.png'); // Reuse gauze for now


        // [수정] 옛날 캐릭터(character_4_...) 로딩 제거 및 새로운 기본 캐릭터(man_spritesheet) 적용
        this.load.spritesheet('character', '/assets/sprites/man_spritesheet.png', {
            frameWidth: 48,
            frameHeight: 64
        });

        // [안내] 커스텀 캐릭터 로드는 이제 GameScene에서 모든 플레이어에 대해 동적으로 처리됩니다.
        console.log(">>> [Preloader] Character loading integrated to GameScene.");

        // NPC spritesheets

        // Load Safety Items
        this.load.image('outlet', '/assets/tilesets/멀티콘센트.png');
        this.load.image('extinguisher', '/assets/tilesets/소화기.png');

        // --- Stage 1: Burn First First Aid Assets ---
        // Path: assets/tilesets/stage_1/
        const stage1Path = '/assets/tilesets/stage_1/';
        this.load.image('water_bottle', stage1Path + 'water_bottle.png');
        this.load.image('gauze', stage1Path + 'gauze.png');
        this.load.image('sink', stage1Path + 'sink.png');
        this.load.image('ice_pack', stage1Path + 'ice_pack.png');
        this.load.image('toothpaste', stage1Path + 'toothpaste.png');
        this.load.image('doenjang', stage1Path + 'doenjang.png');
        this.load.image('needle', stage1Path + 'needle.png');

        this.load.image('npc_hurt', stage1Path + 'npc_hurt.png');
        this.load.image('npc_recovered', stage1Path + 'npc_recovered.png');
        this.load.image('npc_teacher', stage1Path + 'npc_teacher1.png');

        // UI Assets
        this.load.image('title_bg', 'assets/title_bg.png');
    }

    create() {
        console.log("Preloader finished. Directing to GameScene...");

        const initData = this.game._initData || {};

        this.scene.start('GameScene', {
            socket: getSocket(),
            roomId: initData.roomId,
            stageId: initData.stageId ? `stage_${initData.stageId}` : 'stage_1'
        });
    }
}
