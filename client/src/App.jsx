import Hearts from './components/HUD/Hearts';
import InventoryHUD from './components/HUD/InventoryHUD';
import Dialogue from './components/Dialogue/Dialogue';
import InventoryModal from './components/Modals/InventoryModal';
import QuizModal from './components/Modals/QuizModal';
import ActionButton from './components/HUD/ActionButton';
import useGameStore from './store/useGameStore';

const App = () => {
    return (
        <div className="ui-overlay">
            <Hearts />
            <InventoryHUD />
            <Dialogue />
            <InventoryModal />
            <QuizModal />
            <ActionButton />
        </div>
    );
};

export default App;
