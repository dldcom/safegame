import Hearts from './components/HUD/Hearts';
import InventoryHUD from './components/HUD/InventoryHUD';
import Dialogue from './components/Dialogue/Dialogue';
import InventoryModal from './components/Modals/InventoryModal';
import QuizModal from './components/Modals/QuizModal';
import ActionButton from './components/HUD/ActionButton';
import OxygenGauge from './components/HUD/OxygenGauge';
import LobbyView from './components/Modals/LobbyView';
import useGameStore from './store/useGameStore';
import { AnimatePresence } from 'framer-motion';

const App = () => {
    const gameStarted = useGameStore((state) => state.gameStarted);
    const { inventoryModal, quiz } = useGameStore();

    return (
        <div className="ui-overlay">
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
        </div>
    );
};

export default App;
