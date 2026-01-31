import React, { useEffect } from 'react';
import GameUI from '../components/GameUI';
import { useSearchParams } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { initGame } from '../main';

const GamePage = () => {
    const [searchParams] = useSearchParams();
    const stage = searchParams.get('stage') || '1';

    useEffect(() => {
        const fetchMapAndInit = async () => {
            const store = useGameStore.getState();
            store.setStage(parseInt(stage));
            store.setGameStarted(false);

            // 1. Fetch Custom Map from Server
            try {
                const stageId = `stage_${stage}`;
                const response = await fetch(`/api/map/${stageId}`);
                if (response.ok) {
                    const mapData = await response.json();
                    if (mapData && mapData.content) {
                        console.log(`>>> [GamePage] Custom map found for ${stageId}`);
                        store.setCustomMap(stageId, mapData.content);
                    }
                }
            } catch (err) {
                console.warn(">>> [GamePage] Failed to fetch custom map, using default.", err);
            }

            // 2. Phaser 게임 시작
            initGame();

            // 3. Focus on game for key inputs
            const container = document.getElementById('game-container');
            if (container) {
                container.focus();
            }
        };

        fetchMapAndInit();
    }, [stage]);

    return (
        <div id="game-page">
            <div id="game-container" tabIndex="0" style={{ outline: 'none' }}></div>
            <GameUI />
        </div>
    );
};

export default GamePage;
