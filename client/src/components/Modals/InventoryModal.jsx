import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { STAGE_1_ITEMS } from '../../data/Stage1Data';

const InventoryModal = () => {
    const { inventoryModal, closeInventoryModal } = useGameStore();
    const [activeIndex, setActiveIndex] = useState(0);

    // Keyboard navigation
    useEffect(() => {
        if (!inventoryModal.isOpen) return;

        const handleKeyDown = (e) => {
            const columns = 2;
            const itemCount = inventoryModal.items.length;

            if (e.key === 'ArrowRight') {
                setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1));
            } else if (e.key === 'ArrowLeft') {
                setActiveIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'ArrowDown') {
                setActiveIndex((prev) => Math.min(prev + columns, itemCount - 1));
            } else if (e.key === 'ArrowUp') {
                setActiveIndex((prev) => Math.max(prev - columns, 0));
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (itemCount > 0) {
                    handleSelect(inventoryModal.items[activeIndex]);
                } else {
                    closeInventoryModal();
                }
            } else if (e.key === 'Escape') {
                closeInventoryModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inventoryModal.isOpen, inventoryModal.items, activeIndex]);

    if (!inventoryModal.isOpen) return null;

    const handleSelect = (itemId) => {
        const gameScene = window.game?.scene?.getScene('GameScene');
        const uiScene = window.game?.scene?.getScene('UI_Scene');

        if (inventoryModal.callbackEvent && gameScene) {
            // Emitting to local scene event emitter
            gameScene.events.emit(inventoryModal.callbackEvent, itemId);
            gameScene.isUIOpen = false;
        } else if (gameScene) {
            // Viewing mode - usually nothing happens on click except close
            gameScene.isUIOpen = false;
        }

        closeInventoryModal();
    };

    const handleClose = () => {
        const gameScene = window.game?.scene?.getScene('GameScene');
        if (gameScene) gameScene.isUIOpen = false;
        closeInventoryModal();
    };

    return (
        <div className="modal-overlay">
            <h2 className="modal-title">{inventoryModal.title}</h2>

            <div className="item-grid">
                {inventoryModal.items.length === 0 ? (
                    <div className="item-empty">가방이 비어있습니다.</div>
                ) : (
                    inventoryModal.items.map((itemId, index) => {
                        const item = STAGE_1_ITEMS[itemId] || { name: itemId };
                        return (
                            <div
                                key={`${itemId}-${index}`}
                                className={`item-btn ${index === activeIndex ? 'focused' : ''}`}
                                onClick={() => handleSelect(itemId)}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <span style={{ fontSize: '24px' }}>📦</span>
                                <span className="item-name">{item.name}</span>
                            </div>
                        );
                    })
                )}
            </div>

            {inventoryModal.items.length > 0 && inventoryModal.items[activeIndex] && (
                <div className="item-description-box">
                    <p style={{ margin: 0 }}>
                        {STAGE_1_ITEMS[inventoryModal.items[activeIndex]]?.description || '설명이 없습니다.'}
                    </p>
                </div>
            )}

            <button className="close-btn" onClick={handleClose}>닫기 (Esc)</button>
        </div>
    );
};

export default InventoryModal;
