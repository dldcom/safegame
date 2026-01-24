import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import useGameStore, { isUIOpen } from '../../store/useGameStore';

const InventoryHUD = () => {
    const { inventory, openInventoryModal } = useGameStore();
    const state = useGameStore();
    const controls = useAnimation();

    // Inventory bounce animation when items collected
    useEffect(() => {
        if (inventory.length > 0) {
            controls.start({
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.4 }
            });
        }
    }, [inventory.length, controls]);

    const handleClick = () => {
        if (isUIOpen(state) && !state.inventoryModal.isOpen) return;
        openInventoryModal(inventory, "가방", null);
    };

    return (
        <motion.div
            className="hud-inventory-btn"
            onClick={handleClick}
            animate={controls}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span style={{ fontSize: '1.2rem' }}>🎒 가방 ({inventory.length})</span>
        </motion.div>
    );
};

export default InventoryHUD;
