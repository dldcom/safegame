import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const OxygenGauge = () => {
    const oxygen = useGameStore((state) => state.oxygen);
    const stage = useGameStore((state) => state.stage);

    if (stage !== 2) return null;

    const getColor = () => {
        if (oxygen > 60) return '#4ade80'; // Green
        if (oxygen > 30) return '#fbbf24'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="fixed top-20 left-6 z-50 flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="text-white text-sm font-bold drop-shadow-md">공기 오염도</span>
                <span className="text-white text-xs opacity-80">{Math.ceil(oxygen)}%</span>
            </div>

            <div className="w-48 h-3 bg-black/40 rounded-full border border-white/20 overflow-hidden backdrop-blur-sm">
                <motion.div
                    className="h-full"
                    initial={{ width: '100%' }}
                    animate={{
                        width: `${oxygen}%`,
                        backgroundColor: getColor(),
                        boxShadow: oxygen < 30 ? ['0 0 0px #ef4444', '0 0 10px #ef4444', '0 0 0px #ef4444'] : 'none'
                    }}
                    transition={{
                        backgroundColor: { duration: 0.5 },
                        boxShadow: { repeat: Infinity, duration: 1.5 }
                    }}
                />
            </div>

            <AnimatePresence>
                {oxygen < 30 && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-red-400 text-[10px] font-bold animate-pulse"
                    >
                        ⚠️ 숨쉬기가 힘들어! 숙여야 해!
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OxygenGauge;
