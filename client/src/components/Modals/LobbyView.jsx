import React from 'react';
import useGameStore from '../../store/useGameStore';

const LobbyView = () => {
    const { lobby, gameStarted } = useGameStore();

    // Don't show lobby if game has already started or if it's explicitly closed
    if (gameStarted || !lobby.isOpen) return null;

    const handleReady = () => {
        const lobbyScene = window.game?.scene?.getScene('LobbyScene');
        if (lobbyScene && lobbyScene.socket) {
            lobbyScene.socket.emit('playerReady');
        }
    };

    return (
        <div className="lobby-overlay">
            <div className="lobby-container">
                <h1 className="lobby-title">SAFE GAME LOBBY</h1>
                <p className="lobby-subtitle">용사들이 모두 모이면 모험이 시작됩니다!</p>

                <div className="player-list">
                    {lobby.players.length === 0 ? (
                        <div className="no-players">다른 플레이어를 기다리는 중...</div>
                    ) : (
                        lobby.players.map((player) => (
                            <div key={player.playerId} className={`player-card ${player.isReady ? 'ready' : ''}`}>
                                <div className="player-avatar" style={{ backgroundColor: `#${player.color.toString(16).padStart(6, '0')}` }}></div>
                                <div className="player-info">
                                    <span className="player-id">{player.playerId === window.game?.socketId ? '나 (Me)' : `플레이어 ${player.playerId.substring(0, 4)}`}</span>
                                    <span className={`ready-status ${player.isReady ? 'status-ready' : 'status-waiting'}`}>
                                        {player.isReady ? 'READY ✅' : 'WAITING...'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="lobby-actions">
                    <button className="ready-btn" onClick={handleReady}>
                        준비하기 (READY)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LobbyView;
