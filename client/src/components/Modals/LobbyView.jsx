import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const LobbyView = () => {
    const { lobby, gameStarted } = useGameStore();

    if (gameStarted || !lobby.isOpen) return null;

    const handleReady = () => {
        const lobbyScene = window.game?.scene?.getScene('LobbyScene');
        if (lobbyScene && lobbyScene.socket) {
            lobbyScene.socket.emit('playerReady');
        }
    };

    return (
        <motion.div
            className="lobby-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="lobby-container"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
            >
                <h1 className="lobby-title">SAFE GAME LOBBY</h1>
                <p className="lobby-subtitle">용사들이 모두 모이면 모험이 시작됩니다!</p>

                <div className="player-list">
                    <AnimatePresence mode="popLayout">
                        {lobby.players.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="no-players"
                            >
                                다른 플레이어를 기다리는 중...
                            </motion.div>
                        ) : (
                            lobby.players.map((player) => (
                                <motion.div
                                    key={player.playerId}
                                    layout
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className={`player-card ${player.isReady ? 'ready' : ''}`}
                                >
                                    <div className="player-avatar" style={{ backgroundColor: `#${player.color.toString(16).padStart(6, '0')}` }}></div>
                                    <div className="player-info">
                                        <span className="player-id">
                                            {player.playerId === window.game?.socketId ? '나 (Me)' : `용사 ${player.playerId.substring(0, 4)}`}
                                        </span>
                                        <motion.span
                                            key={player.isReady ? 'ready' : 'not-ready'}
                                            initial={{ scale: 1.2, color: '#fff' }}
                                            animate={{ scale: 1, color: player.isReady ? '#2ecc71' : '#888' }}
                                            className={`ready-status ${player.isReady ? 'status-ready' : 'status-waiting'}`}
                                        >
                                            {player.isReady ? 'READY ✅' : 'WAITING...'}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="lobby-actions">
                    <motion.button
                        className="ready-btn"
                        onClick={handleReady}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        준비하기 (READY)
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LobbyView;
