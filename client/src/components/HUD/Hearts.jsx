import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const Hearts = () => {
    const hearts = useGameStore((state) => state.hearts);
    const maxHearts = 3;

    return (
        <div className="hud-hearts" style={{ display: 'flex', gap: '5px' }}>
            <AnimatePresence mode="popLayout">
                {Array.from({ length: maxHearts }).map((_, i) => {
                    const isFull = i < hearts;
                    const isLowHealth = hearts === 1 && isFull;

                    return (
                        <motion.span
                            key={i}
                            layout
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{
                                scale: isLowHealth ? [1, 1.2, 1] : 1,
                                opacity: 1,
                                filter: isFull ? 'none' : 'grayscale(100%) opacity(0.3)'
                            }}
                            transition={{
                                scale: isLowHealth ? { duration: 0.6, repeat: Infinity } : { type: 'spring' },
                                opacity: { duration: 0.2 }
                            }}
                            style={{
                                fontSize: '32px',
                                display: 'inline-block',
                                textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                            }}
                        >
                            {isFull ? '❤️' : '🖤'}
                        </motion.span>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Hearts;
