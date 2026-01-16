import React from 'react';
import useGameStore, { isUIOpen } from '../../store/useGameStore';

const InventoryHUD = () => {
    const { inventory, openInventoryModal } = useGameStore();
    const state = useGameStore();

    const handleClick = () => {
        // If some other UI is open, don't allow opening inventory (unless it's already open)
        if (isUIOpen(state) && !state.inventoryModal.isOpen) return;

        openInventoryModal(inventory, "가방", null);
    };

    return (
        <div className="hud-inventory-btn" onClick={handleClick}>
            <span style={{ fontSize: '1.2rem' }}>🎒 가방 ({inventory.length})</span>
        </div>
    );
};

export default InventoryHUD;
