import React from 'react';
import useGameStore from '../../store/useGameStore';

const ActionButton = () => {
    // We only show/enable this if a dialogue is open or we are in a mission state
    // But for a game-pad feel, it's often always there but semi-transparent

    const handleAction = () => {
        const uiScene = window.game?.scene?.getScene('UI_Scene');
        if (uiScene) {
            uiScene.handleInteraction();
        }
    };

    return (
        <div className="hud-action-btn" onClick={handleAction}>
            <div className="action-btn-inner">A</div>
        </div>
    );
};

export default ActionButton;
