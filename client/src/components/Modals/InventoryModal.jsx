import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { STAGE_1_ITEMS } from '../../data/Stage1Data';
import { motion } from 'framer-motion';

const InventoryModal = () => {
    const { inventoryModal, closeInventoryModal } = useGameStore();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isSubmitting) return; // Lock input during close animation

            const columns = 2;
            const itemCount = inventoryModal.items.length;

            switch (e.key) {
                case 'ArrowRight':
                    setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1));
                    break;
                case 'ArrowLeft':
                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case 'ArrowDown':
                    setActiveIndex((prev) => Math.min(prev + columns, itemCount - 1));
                    break;
                case 'ArrowUp':
                    setActiveIndex((prev) => Math.max(prev - columns, 0));
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(inventoryModal.items[activeIndex]);
                    break;
                case 'Escape':
                    handleClose();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inventoryModal.items, activeIndex, isSubmitting]);

    const handleSelect = (itemId) => {
        if (isSubmitting) return;

        const gameScene = window.game?.scene?.getScene('GameScene');
        if (!gameScene) return;

        if (inventoryModal.callbackEvent) {
            setIsSubmitting(true); // Prevent further signals
            gameScene.events.emit(inventoryModal.callbackEvent, itemId);
            gameScene.isUIOpen = false;
            closeInventoryModal();
        }
    };

    const handleItemClick = (index) => {
        setActiveIndex(index);
    };

    const handleClose = () => {
        const gameScene = window.game?.scene?.getScene('GameScene');
        if (gameScene) gameScene.isUIOpen = false;
        closeInventoryModal();
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-45%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-45%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
            <h2 className="modal-title">{inventoryModal.title}</h2>

            <div className="item-grid">
                {inventoryModal.items.length === 0 ? (
                    <div className="item-empty">가방이 비어있습니다.</div>
                ) : (
                    inventoryModal.items.map((itemId, index) => {
                        const item = STAGE_1_ITEMS[itemId] || { name: itemId };
                        return (
                            <motion.div
                                key={`${itemId}-${index}`}
                                layoutId={itemId}
                                className={`item-btn ${index === activeIndex ? 'focused' : ''}`}
                                onClick={() => handleItemClick(index)}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <span style={{ fontSize: '24px' }}>📦</span>
                                <span className="item-name">{item.name}</span>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {inventoryModal.items.length > 0 && inventoryModal.items[activeIndex] && (
                <motion.div
                    layout
                    className="item-description-box"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#ffd700' }}>
                        [{STAGE_1_ITEMS[inventoryModal.items[activeIndex]]?.name}]
                    </p>
                    <p style={{ margin: 0 }}>
                        {STAGE_1_ITEMS[inventoryModal.items[activeIndex]]?.description || '설명이 없습니다.'}
                    </p>
                    {inventoryModal.callbackEvent && (
                        <button
                            className="ready-btn"
                            style={{ marginTop: '15px', padding: '10px 30px', fontSize: '1.1rem' }}
                            onClick={() => handleSelect(inventoryModal.items[activeIndex])}
                        >
                            사용하기
                        </button>
                    )}
                </motion.div>
            )}

            <button className="close-btn" onClick={handleClose}>닫기 (Esc)</button>
        </motion.div>
    );
};

export default InventoryModal;
