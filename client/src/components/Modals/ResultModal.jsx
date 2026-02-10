import React from 'react';
import useGameStore from '../../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ResultModal = () => {
    const { gameResult, setGameResult } = useGameStore();
    const navigate = useNavigate();

    if (!gameResult.isOpen) return null;

    const myResult = gameResult.rankings.find(r => r.username === JSON.parse(localStorage.getItem('user') || '{}').username);
    const timeInSeconds = Math.floor((gameResult.endTime - gameResult.startTime) / 1000);

    const handleBackToLobby = () => {
        // 게임 인스턴스 파괴 및 소켓 해제 등을 위한 지점
        if (window.game) {
            window.game.destroy(true);
            window.game = null;
        }
        setGameResult({ isOpen: false });
        navigate('/student'); // 학생 대시보드(로비)로 이동
    };

    return (
        <AnimatePresence>
            <motion.div
                className="result-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="result-card"
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    <div className="result-header">
                        <motion.h1
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1.2 }}
                            className="mission-clear-text"
                        >
                            MISSION CLEAR!
                        </motion.h1>
                    </div>

                    <div className="result-body">
                        <div className="my-stats">
                            <div className="stat-item">
                                <span className="label">획득 점수</span>
                                <span className="value score">{gameResult.score}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">소요 시간</span>
                                <span className="value">{timeInSeconds}초</span>
                            </div>
                        </div>

                        <div className="leaderboard">
                            <h3>🏆 실시간 랭킹</h3>
                            <div className="rank-list">
                                {gameResult.rankings.map((rank, idx) => (
                                    <div key={idx} className={`rank-item ${rank.username === myResult?.username ? 'is-me' : ''}`}>
                                        <span className="rank-num">{idx + 1}</span>
                                        <span className="rank-name">{rank.username}</span>
                                        <span className="rank-score">{rank.score}점</span>
                                        <span className="rank-time">{rank.time}초</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="result-footer">
                        <button className="back-btn" onClick={handleBackToLobby}>
                            대시보드로 돌아가기
                        </button>
                    </div>
                </motion.div>

                {/* 폭죽 효과를 위한 데코레이션 요소들 */}
                <div className="confetti-container">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="confetti"
                            initial={{
                                x: '50vw', y: '100vh',
                                backgroundColor: ['#ff0', '#f0f', '#0ff', '#0f0'][i % 4]
                            }}
                            animate={{
                                x: `${Math.random() * 100}vw`,
                                y: `${Math.random() * 100}vh`,
                                opacity: [1, 1, 0],
                                rotate: 360
                            }}
                            transition={{ duration: 2, delay: Math.random() * 0.5 }}
                        />
                    ))}
                </div>
            </motion.div>

            <style>{`
                .result-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 5000;
                    font-family: 'Space Grotesk', 'Galmuri11', sans-serif;
                    pointer-events: auto; /* 클릭 가능하도록 명시 */
                }
                .result-card {
                    background: #fff;
                    width: 500px;
                    border: 4px solid #000;
                    box-shadow: 15px 15px 0px #FF5C00;
                    padding: 40px;
                    position: relative;
                    pointer-events: auto;
                }
                .mission-clear-text {
                    color: #FF5C00;
                    font-size: 48px;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 30px;
                    text-shadow: 4px 4px 0px #000;
                }
                .my-stats {
                    display: flex; justify-content: space-around;
                    background: #f0f0f0;
                    padding: 20px;
                    border: 2px solid #000;
                    margin-bottom: 30px;
                }
                .stat-item { display: flex; flex-direction: column; align-items: center; }
                .stat-item .label { font-size: 12px; opacity: 0.6; margin-bottom: 5px; }
                .stat-item .value { font-size: 24px; font-weight: 700; }
                .stat-item .value.score { color: #FF5C00; font-size: 32px; }

                .leaderboard h3 { font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px; }
                .rank-list { max-height: 200px; overflow-y: auto; }
                .rank-item {
                    display: grid; grid-template-columns: 40px 1fr 80px 60px;
                    padding: 10px; border-bottom: 1px solid #eee;
                    font-size: 14px;
                }
                .rank-item.is-me { background: #fff5f0; font-weight: bold; border: 2px solid #FF5C00; }
                .rank-num { font-weight: 900; color: #FF5C00; }

                .result-footer { margin-top: 40px; text-align: center; }
                .back-btn {
                    background: #000; color: #fff; border: none;
                    padding: 15px 30px; font-weight: bold; cursor: pointer;
                    transition: 0.2s;
                }
                .back-btn:hover { background: #FF5C00; transform: translateY(-3px); }

                .confetti-container { position: fixed; inset: 0; pointer-events: none; }
                .confetti { width: 10px; height: 10px; position: absolute; }
            `}</style>
        </AnimatePresence>
    );
};

export default ResultModal;
