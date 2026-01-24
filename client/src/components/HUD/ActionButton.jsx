import React from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const ActionButton = () => {
    const handleAction = () => {
        const uiScene = window.game?.scene?.getScene('UI_Scene');
        if (uiScene) {
            uiScene.handleInteraction();
        }
    };

    return (
        <motion.div
            className="hud-action-btn"
            onClick={handleAction}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
        >
            <div className="action-btn-inner">A</div>
        </motion.div>
    );
};

export default ActionButton;
