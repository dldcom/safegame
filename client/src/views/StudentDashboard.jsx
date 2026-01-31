import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import useGameStore from '../store/useGameStore';
import { STAGE_1_QUIZ } from '../data/Stage1Data';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { userStats, setUserStats } = useGameStore();
    const [leaderboard, setLeaderboard] = useState([]);

    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [quizResult, setQuizResult] = useState(null);
    const [showResultOverlay, setShowResultOverlay] = useState(false);
    const [showStages, setShowStages] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user.username) {
            navigate('/');
            return;
        }
        if (userStats.level === 1 && user.level) {
            setUserStats(user);
        }
        setCurrentQuizIdx(userStats.quizProgress % STAGE_1_QUIZ.length);
        fetchLeaderboard();
    }, [userStats.quizProgress]);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get('/api/student/leaderboard');
            setLeaderboard(res.data);
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
        }
    };

    const handleAnswer = async (selectedIdx) => {
        if (showResultOverlay) return;
        const isCorrect = selectedIdx === STAGE_1_QUIZ[currentQuizIdx].answerIndex;
        setQuizResult(isCorrect ? 'correct' : 'wrong');
        setShowResultOverlay(true);

        if (isCorrect) {
            try {
                const res = await axios.post('/api/student/update-exp', {
                    userId: user.id,
                    expToAdd: 20,
                    quizProgress: (currentQuizIdx + 1) % STAGE_1_QUIZ.length
                });
                setUserStats(res.data.user);
                const updatedUser = { ...user, ...res.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (err) {
                console.error('Exp update error:', err);
            }
        }
    };

    const closeQuizAndMoveOn = () => {
        setIsQuizOpen(false);
        setQuizResult(null);
        setShowResultOverlay(false);
        fetchLeaderboard();
    };

    const getRankTitle = (level) => {
        if (level <= 5) return 'BEGINNER ADVENTURER';
        if (level <= 10) return 'SAFETY KEEPER';
        if (level <= 20) return 'ELITE GUARDIAN';
        return 'MASTER COMMANDER';
    };

    const stages = [
        { id: 1, name: 'BURN_FIRST_AID', difficulty: 'EASY', status: 'READY' },
        { id: 2, name: 'FIRE_EVAC_DRILL', difficulty: 'NORMAL', status: 'READY' },
        { id: 3, name: 'DISASTER_SURVIVAL', difficulty: 'HARD', status: 'PROTOTYPE' }
    ];

    const expLimit = userStats.level * 100;
    const expPercentage = Math.min((userStats.exp / expLimit) * 100, 100);

    return (
        <div className="designer-dashboard-root">
            {/* Texture Background as Pseudo-element is handled in CSS */}

            <main className="dashboard-content">
                {/* Header Section */}
                <header className="main-header">
                    <div className="brand-group">
                        <div className="brand-symbol"></div>
                        <span className="brand-text">SAFEGAME_OPS</span>
                    </div>
                    <div className="user-control">
                        <span className="system-time">CONNECTED_STATE // 2026</span>
                        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>LOGOUT</button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* LEFT COLUMN */}
                    <article className="left-section">
                        {/* Profile Block */}
                        <section className="profile-block">
                            <div className="profile-compact-v">
                                <div className="compact-avatar-side">
                                    <div className="character-frame-mini">
                                        <div className="frame-inner">
                                            <div className="avatar-placeholder"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="compact-info-side">
                                    <div className="info-header-row">
                                        <h1 className="username-mini">{user.username}</h1>
                                        <span className="rank-tag-mini">{getRankTitle(userStats.level)}</span>
                                    </div>

                                    <div className="stats-row-mini">
                                        <div className="mini-stat">
                                            <span className="m-label">LV.</span>
                                            <span className="m-value">{userStats.level}</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="m-label">EXP.</span>
                                            <span className="m-value">{userStats.exp} <span className="m-sep">/</span> {expLimit}</span>
                                        </div>
                                    </div>

                                    <div className="compact-progress-area">
                                        <div className="progress-track-mini">
                                            <motion.div
                                                className="progress-fill-mini"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${expPercentage}%` }}
                                                transition={{ duration: 1, ease: [0.3, 1, 0.4, 1] }}
                                            />
                                        </div>
                                        <span className="percent-mono">{expPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Action Tiles */}
                        <div className="action-tiles">
                            <motion.button
                                className="tile-btn primary"
                                whileTap={{ scale: 0.96, y: 4 }}
                                onClick={() => setShowStages(!showStages)}
                            >
                                <div className="tile-header">
                                    <span className="tile-tag">01</span>
                                    <div className="tile-icon-ui mission"></div>
                                </div>
                                <div className="tile-footer">
                                    <h2>방탈출 하기</h2>
                                    <p>실전 대응 전술 훈련</p>
                                </div>
                            </motion.button>

                            <motion.button
                                className="tile-btn active"
                                whileTap={{ scale: 0.96, y: 4 }}
                                onClick={() => setIsQuizOpen(true)}
                            >
                                <div className="tile-header">
                                    <span className="tile-tag">02</span>
                                    <div className="tile-icon-ui quiz"></div>
                                </div>
                                <div className="tile-footer">
                                    <h2>안전 퀴즈왕</h2>
                                    <p>매일 새로운 지식 챌린지</p>
                                </div>
                            </motion.button>
                        </div>

                        {/* Stages Drawer */}
                        <div className={`stages-list ${showStages ? 'visible' : ''}`}>
                            {stages.map((stage) => (
                                <div key={stage.id} className="stage-row" onClick={() => navigate(`/game?stage=${stage.id}`)}>
                                    <span className="s-id">STAGE_{stage.id}</span>
                                    <span className="s-name">{stage.name}</span>
                                    <span className="s-diff">{stage.difficulty}</span>
                                    <div className="s-arrow"></div>
                                </div>
                            ))}
                        </div>
                    </article>

                    {/* RIGHT COLUMN */}
                    <article className="right-section">
                        <section className="leaderboard-block">
                            <div className="block-header">
                                <h2>글로벌 랭킹</h2>
                                <span className="update-tag">LIVE_UPDATE</span>
                            </div>
                            <div className="leader-list">
                                {leaderboard.map((item, idx) => (
                                    <div key={idx} className={`leader-item ${item.username === user.username ? 'is-me' : ''}`}>
                                        <span className="l-rank">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                        <div className="l-info">
                                            <span className="l-name">{item.username}</span>
                                            <span className="l-meta">LEVEL_{item.level || 1}</span>
                                        </div>
                                        <span className="l-score">{item.totalExp || 0} XP</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>
                </div>
            </main>

            {/* Modal & Overlays */}
            {
                isQuizOpen && (
                    <div className="designer-modal-root">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="modal-box"
                        >
                            <div className="modal-header">
                                <span className="m-tag">DAILY_MISSION_LOG</span>
                                <button className="m-close" onClick={() => setIsQuizOpen(false)}>CLOSE</button>
                            </div>
                            <div className="modal-body">
                                <h2 className="q-text">{STAGE_1_QUIZ[currentQuizIdx].question}</h2>
                                <div className="options-grid">
                                    {STAGE_1_QUIZ[currentQuizIdx].options.map((opt, i) => (
                                        <button key={i} className="opt-card" onClick={() => handleAnswer(i)}>
                                            <span className="opt-idx">{i + 1}</span>
                                            <span className="opt-txt">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {showResultOverlay && (
                                <div className="modal-result-overlay">
                                    <div className="res-content">
                                        <h3 className={quizResult}>{quizResult === 'correct' ? 'VERIFIED' : 'FAILED'}</h3>
                                        <p>{STAGE_1_QUIZ[currentQuizIdx].explanation}</p>
                                        <button onClick={closeQuizAndMoveOn}>CONTINUE</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )
            }

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

                :root {
                    --color-bg: #F9F8F6;
                    --color-text: #1A1A1A;
                    --color-accent: #FF5C00;
                    --color-primary: #1A1A1A;
                    --color-secondary: #E5E5E5;
                    --color-green: #00BFA5;
                    --border-main: 1px solid #1A1A1A;
                    --font-main: 'Space Grotesk', sans-serif;
                    --font-mono: 'IBM Plex Mono', monospace;
                }

                .designer-dashboard-root {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text);
                    font-family: var(--font-main);
                    position: relative;
                    overflow-x: hidden;
                    padding: 40px;
                }

                .designer-dashboard-root::before {
                    content: "";
                    position: fixed; inset: 0;
                    background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
                    opacity: 0.3; pointer-events: none; z-index: -1;
                }

                .dashboard-content { max-width: 1400px; margin: 0 auto; position: relative; z-index: 10; }

                /* Header Styling */
                .main-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 60px; padding: 20px 0; border-bottom: 1.5px solid var(--color-text);
                    position: relative; z-index: 100;
                }
                .brand-group { display: flex; align-items: center; gap: 12px; }
                .brand-symbol { width: 24px; height: 24px; background: var(--color-accent); border-radius: 4px; }
                .brand-text { font-family: var(--font-mono); font-weight: 600; font-size: 14px; letter-spacing: 1px; }
                .user-control { display: flex; align-items: center; gap: 40px; }
                .system-time { font-family: var(--font-mono); font-size: 11px; opacity: 0.5; }
                .logout-btn { 
                    background: none; border: var(--border-main); padding: 8px 24px; 
                    font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;
                    position: relative; z-index: 1000;
                    pointer-events: auto !important;
                }
                .logout-btn:hover { background: var(--color-text); color: #fff; }

                /* Grid Structure */
                .dashboard-grid { 
                    display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start; 
                    position: relative; z-index: 10;
                }

                /* Left Section Components */
                .left-section { display: flex; flex-direction: column; gap: 40px; }

                /* Profile Block - Compact Rebuild */
                .profile-block {
                    background: #fff; border: var(--border-main); padding: 40px 45px; position: relative;
                }
                .profile-compact-v { display: flex; gap: 40px; align-items: center; }
                
                .character-frame-mini { position: relative; width: 140px; height: 140px; }
                .frame-inner {
                    width: 100%; height: 100%; border: var(--border-main); border-radius: 50%; padding: 8px;
                    display: flex; align-items: center; justify-content: center; background: #fff;
                }
                .avatar-placeholder { width: 100%; height: 100%; background: #F0F0F0; border-radius: 50%; }
                
                .compact-info-side { flex: 1; display: flex; flex-direction: column; gap: 12px; }
                
                .info-header-row { display: flex; align-items: baseline; gap: 15px; }
                .username-mini { font-size: 2.5rem; font-weight: 700; letter-spacing: -1.5px; line-height: 1; }
                .rank-tag-mini { 
                    font-family: var(--font-mono); font-size: 9px; font-weight: 700; 
                    background: var(--color-accent); color: #fff; padding: 3px 10px; border-radius: 4px; 
                }

                .stats-row-mini { display: flex; gap: 25px; border-top: 1px solid #F0F0F0; padding-top: 12px; }
                .mini-stat { display: flex; align-items: baseline; gap: 6px; }
                .m-label { font-family: var(--font-mono); font-size: 9px; opacity: 0.5; font-weight: 600; }
                .m-value { font-size: 1.2rem; font-weight: 700; }
                .m-sep { opacity: 0.2; margin: 0 2px; }

                .compact-progress-area { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
                .progress-track-mini { flex: 1; height: 6px; background: #F0F0F0; position: relative; overflow: hidden; }
                .progress-fill-mini { height: 100%; background: var(--color-text); }
                .percent-mono { font-family: var(--font-mono); font-size: 10px; font-weight: 600; min-width: 30px; }

                /* Action Tiles - Tactile Design */
                .action-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .tile-btn {
                    background: #fff; border: var(--border-main); padding: 24px 28px; 
                    text-align: left; cursor: pointer; position: relative; z-index: 30;
                    box-shadow: 6px 6px 0px #1A1A1A; transition: transform 0.1s, box-shadow 0.1s;
                    pointer-events: auto !important;
                }
                .tile-btn:active { transform: translate(1px, 1px); box-shadow: 5px 5px 0px #1A1A1A; }
                .tile-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
                .tile-tag { font-family: var(--font-mono); font-size: 11px; opacity: 0.4; }
                .tile-icon-ui { width: 32px; height: 32px; border: var(--border-main); position: relative; }
                .tile-icon-ui.quiz::after { content: '?'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .tile-icon-ui.mission::after { content: '→'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .tile-footer h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 3px; }
                .tile-footer p { font-size: 11px; opacity: 0.5; font-weight: 500; }

                /* Stages List */
                .stages-list { max-height: 0; overflow: hidden; transition: 0.4s ease; opacity: 0; }
                .stages-list.visible { max-height: 400px; opacity: 1; margin-top: 20px; }
                .stage-row {
                    display: grid; grid-template-columns: 100px 1fr 100px 30px; 
                    padding: 20px; border: var(--border-main); margin-bottom: -1px;
                    align-items: center; cursor: pointer; transition: 0.2s;
                }
                .stage-row:hover { background: #fff; transform: translateX(5px); }
                .s-id { font-family: var(--font-mono); font-size: 10px; opacity: 0.5; }
                .s-name { font-weight: 700; font-size: 14px; }
                .s-diff { font-family: var(--font-mono); font-size: 10px; text-align: center; }
                .s-arrow { width: 10px; height: 10px; border-top: 2px solid var(--color-text); border-right: 2px solid var(--color-text); transform: rotate(45deg); }

                /* Leaderboard Section */
                .leaderboard-block { background: #fff; border: var(--border-main); padding: 30px; }
                .block-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .block-header h2 { font-size: 1.2rem; font-weight: 700; }
                .update-tag { font-family: var(--font-mono); font-size: 9px; background: #EEF2F3; padding: 4px 10px; border-radius: 4px; }
                
                .leader-item {
                    display: flex; align-items: center; gap: 20px; padding: 15px 0; border-bottom: 1px solid #F0F0F0;
                    transition: 0.2s;
                }
                .leader-item.is-me { background: #F9F9F9; margin: 0 -10px; padding: 15px 10px; }
                .l-rank { font-family: var(--font-mono); font-size: 11px; color: var(--color-accent); font-weight: 600; width: 30px; }
                .l-info { flex: 1; display: flex; flex-direction: column; }
                .l-name { font-weight: 700; font-size: 14px; }
                .l-meta { font-family: var(--font-mono); font-size: 9px; opacity: 0.4; }
                .l-score { font-family: var(--font-mono); font-size: 12px; font-weight: 600; }

                /* Modal Styling */
                .designer-modal-root {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.4); 
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-box {
                    background: #fff; border: var(--border-main); width: 90%; max-width: 800px;
                    padding: 50px; position: relative; box-shadow: 20px 20px 0px rgba(0,0,0,0.1);
                }
                .m-tag { font-family: var(--font-mono); font-size: 10px; opacity: 0.4; }
                .m-close { 
                    float: right; background: none; border: var(--border-main); 
                    font-size: 10px; font-weight: 700; cursor: pointer; padding: 5px 15px;
                }
                .q-text { font-size: 2.2rem; font-weight: 700; margin: 40px 0 50px; line-height: 1.1; }
                .options-grid { display: grid; gap: 15px; }
                .opt-card {
                    background: #fff; border: var(--border-main); padding: 25px; text-align: left;
                    display: flex; align-items: center; gap: 20px; cursor: pointer; transition: 0.2s;
                }
                .opt-card:hover { background: var(--color-text); color: #fff; }
                .opt-idx { font-family: var(--font-mono); font-size: 12px; opacity: 0.5; }
                .opt-txt { font-weight: 600; font-size: 1.1rem; }

                .modal-result-overlay {
                    position: absolute; inset: 0; background: #fff; display: flex; align-items: center; justify-content: center; padding: 50px;
                }
                .res-content { text-align: center; }
                .res-content h3 { font-size: 4rem; font-weight: 700; margin-bottom: 20px; }
                .res-content h3.correct { color: var(--color-green); }
                .res-content h3.wrong { color: var(--color-accent); }
                .res-content p { font-size: 1.2rem; margin-bottom: 40px; color: #666; }
                .res-content button { 
                    background: var(--color-text); color: #fff; border: none; padding: 15px 60px;
                    font-weight: 700; cursor: pointer;
                }

                @media (max-width: 1000px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .username-mini { font-size: 2rem; }
                    .profile-compact-v { flex-direction: column; text-align: center; }
                }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
