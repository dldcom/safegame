import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const DIRECTION_ICONS = {
    '북': '⬆',
    '남': '⬇',
    '동': '➡',
    '서': '⬅',
    '북동': '↗',
    '북서': '↖',
    '남동': '↘',
    '남서': '↙'
};

const CompassHint = () => {
    const { compassHint } = useGameStore();
    if (!compassHint.active) return null;

    const icon = DIRECTION_ICONS[compassHint.direction] || '🧭';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#fff',
                    padding: '10px 22px',
                    borderRadius: 12,
                    border: '2px solid #FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 20px rgba(255,215,0,0.3)'
                }}
            >
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: 24, color: '#FFD700' }}
                >
                    {icon}
                </motion.span>
                <div>
                    <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>나침반</div>
                    <div>{compassHint.message}</div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CompassHint;
