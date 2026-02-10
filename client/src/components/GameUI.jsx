import React from 'react';
import Hearts from './HUD/Hearts';
import InventoryHUD from './HUD/InventoryHUD';
import Dialogue from '../components/Dialogue/Dialogue';
import InventoryModal from './Modals/InventoryModal';
import ResultModal from './Modals/ResultModal';
import QuizModal from './Modals/QuizModal';
import ActionButton from './HUD/ActionButton';
import OxygenGauge from './HUD/OxygenGauge';
import LobbyView from './Modals/LobbyView';
import useGameStore from '../store/useGameStore';
import { AnimatePresence } from 'framer-motion';

const GameUI = () => {
    const gameStarted = useGameStore((state) => state.gameStarted);
    const { inventoryModal, quiz, gameResult } = useGameStore();

    return (
        <div id="ui-root">
            <LobbyView />

            <AnimatePresence>
                {gameStarted && (
                    <div key="game-hud">
                        <Hearts />
                        <OxygenGauge />
                        <InventoryHUD />
                        <Dialogue />
                        <ActionButton />
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {gameStarted && inventoryModal.isOpen && <InventoryModal key="inventory-modal" />}
            </AnimatePresence>

            <AnimatePresence>
                {gameStarted && quiz.isOpen && <QuizModal key="quiz-modal" />}
            </AnimatePresence>

            <AnimatePresence>
                {gameStarted && gameResult.isOpen && <ResultModal key="result-modal" />}
            </AnimatePresence>
        </div>
    );
};

export default GameUI;
