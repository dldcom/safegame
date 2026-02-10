import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useGameStore from '../store/useGameStore';
import { STAGE_1_QUIZ } from '../data/Stage1Data';
import LobbyView from '../components/Modals/LobbyView';
import ShopModal from '../components/Modals/ShopModal';
import StageSelectModal from '../components/Modals/StageSelectModal';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { userStats, setUserStats } = useGameStore();
    const [leaderboard, setLeaderboard] = useState([]);

    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [quizResult, setQuizResult] = useState(null);
    const [showResultOverlay, setShowResultOverlay] = useState(false);
    const [capturedExplanation, setCapturedExplanation] = useState(''); // 해설 고정용
    const [showStages, setShowStages] = useState(false);
    const [isLobbyOpen, setIsLobbyOpen] = useState(false);
    const [selectedStageName, setSelectedStageName] = useState('');
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const [isCharChangeOpen, setIsCharChangeOpen] = useState(false);
    const [allCharacters, setAllCharacters] = useState([]);
    const [selectedCharId, setSelectedCharId] = useState(null);

    // 1. 초기 마운트 시 데이터 복구 (최초 1회)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user.username) {
            navigate('/');
            return;
        }

        // 스토어가 비어있을 때만 로컬 스토리지에서 복구
        if (userStats.level === 1 && user.username) {
            setUserStats(user);
        }
        fetchLeaderboard();
    }, []);

    // 2. 진행도 변경 시 인덱스 동기화 (하지만 모달이 닫혀있을 때만)
    useEffect(() => {
        if (!isQuizOpen) {
            setCurrentQuizIdx(userStats.quizProgress % STAGE_1_QUIZ.length);
        }
    }, [userStats.quizProgress, isQuizOpen]);

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

        const currentQuiz = STAGE_1_QUIZ[currentQuizIdx];
        const isCorrect = selectedIdx === currentQuiz.answerIndex;

        setCapturedExplanation(currentQuiz.explanation);
        setQuizResult(isCorrect ? 'correct' : 'wrong');
        setShowResultOverlay(true);

        if (isCorrect) {
            try {
                const res = await axios.post('/api/student/update-exp', {
                    userId: user.id,
                    expToAdd: 20,
                    pointsToAdd: 50,
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

        // 창을 닫은 직후 다음 인덱스로 갱신
        setCurrentQuizIdx(userStats.quizProgress % STAGE_1_QUIZ.length);
        fetchLeaderboard();
    };

    const getRankTitle = (level) => {
        if (level <= 5) return 'BEGINNER ADVENTURER';
        if (level <= 10) return 'SAFETY KEEPER';
        if (level <= 20) return 'ELITE GUARDIAN';
        return 'MASTER COMMANDER';
    };

    const fetchCharacters = async () => {
        console.log(">>> [Dashboard] Change Character clicked!");
        try {
            const res = await axios.get('/api/character/list');
            console.log(">>> [Dashboard] Characters fetched:", res.data.length);
            setAllCharacters(res.data);
            setIsCharChangeOpen(true);
        } catch (err) {
            console.error(">>> [Dashboard] Fetch error:", err);
            alert('캐릭터 목록을 불러오지 못했습니다.');
        }
    };

    const handleSkinChange = async () => {
        if (!selectedCharId) return alert('변경할 캐릭터를 선택해주세요.');
        if (!window.confirm('1,000 포인트를 사용하여 캐릭터를 변경하시겠습니까?')) return;

        try {
            const res = await axios.post('/api/character/change-skin', {
                userId: user.id || user._id,
                characterId: selectedCharId
            });
            alert(res.data.message);

            // 전역 스토어 및 로컬 스토리지 업데이트
            const updatedUser = { ...user, ...res.data.user };
            setUserStats(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setIsCharChangeOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || '변경에 실패했습니다.');
        }
    };

    const stages = [
        { id: 1, name: '화상 시 대처 방법', difficulty: 'EASY', status: 'READY' },
        { id: 2, name: '화재 대피 훈련', difficulty: 'NORMAL', status: 'READY' },
        { id: 3, name: '재난 생존 훈련', difficulty: 'HARD', status: 'PROTOTYPE' }
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
                                        <div className={`frame-inner ${userStats.equippedSkin}`}>
                                            {userStats.customCharacter ? (
                                                <div
                                                    className="avatar-preview-v"
                                                    style={{
                                                        backgroundImage: `url(${userStats.customCharacter.imagePath})`,
                                                        backgroundSize: '288px 256px',
                                                        backgroundPosition: '0 0',
                                                        width: '48px',
                                                        height: '64px',
                                                        imageRendering: 'pixelated'
                                                    }}
                                                ></div>
                                            ) : (
                                                <div className="avatar-placeholder"></div>
                                            )}
                                        </div>
                                    </div>
                                    <button className="change-char-btn" onClick={fetchCharacters}>
                                        캐릭터 변경 <span className="cost-tag">1,000P</span>
                                    </button>
                                </div>

                                <div className="compact-info-side">
                                    <div className="info-header-row">
                                        <h1 className="username-mini">{user.username}</h1>
                                        <span className="rank-tag-mini">{userStats.equippedTitle || getRankTitle(userStats.level)}</span>
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
                                        <div className="mini-stat points-stat">
                                            <span className="m-label">POINTS</span>
                                            <span className="m-value">{(userStats.points || 0).toLocaleString()} <span className="m-sep">P</span></span>
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
                                whileHover={{ y: -4, x: -4, boxShadow: '10px 10px 0px #1A1A1A' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsStageModalOpen(true)}
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
                                whileHover={{ y: -4, x: -4, boxShadow: '10px 10px 0px #1A1A1A' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    // 열 때 최신 인덱스 다시 확인
                                    setCurrentQuizIdx(userStats.quizProgress % STAGE_1_QUIZ.length);
                                    setIsQuizOpen(true);
                                }}
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

                            <motion.button
                                className="tile-btn tertiary"
                                whileHover={{ y: -4, x: -4, boxShadow: '10px 10px 0px #1A1A1A' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsShopOpen(true)}
                            >
                                <div className="tile-header">
                                    <span className="tile-tag">03</span>
                                    <div className="tile-icon-ui shop"></div>
                                </div>
                                <div className="tile-footer">
                                    <h2>보관함 & 상점</h2>
                                    <p>포인트로 장비 획득</p>
                                </div>
                            </motion.button>
                        </div>
                    </article>

                    {/* RIGHT COLUMN */}
                    <article className="right-section">
                        <section className="leaderboard-block">
                            <div className="block-header">
                                <h2>점수판</h2>
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
                            <AnimatePresence>
                                {showResultOverlay && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="modal-result-overlay"
                                    >
                                        <div className="artistic-result-container">
                                            {/* 추상적인 배경 레이어 */}
                                            <div className="artistic-bg-blobs">
                                                <div className="blob-1"></div>
                                                <div className="blob-2"></div>
                                            </div>

                                            <div className="res-content premium">
                                                <motion.h3
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`res-main-title ${quizResult}`}
                                                >
                                                    {quizResult === 'correct' ? '정 답' : '오 답'}
                                                </motion.h3>

                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="res-explanation-v"
                                                >
                                                    {capturedExplanation}
                                                </motion.p>

                                                <motion.button
                                                    whileHover={{ scale: 1.05, letterSpacing: '4px' }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={closeQuizAndMoveOn}
                                                    className="res-continue-btn-v"
                                                >
                                                    CONTINUE_JOURNEY
                                                </motion.button>
                                            </div>

                                            {/* 예술적인 파티클 연출 (아우라 + 폭죽) */}
                                            {quizResult === 'correct' && (
                                                <>
                                                    <div className="artistic-particles">
                                                        {[...Array(8)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="art-orb"
                                                                animate={{
                                                                    scale: [1, 1.4, 1],
                                                                    opacity: [0.2, 0.4, 0.2],
                                                                    x: [0, Math.random() * 50 - 25, 0],
                                                                    y: [0, Math.random() * 50 - 25, 0]
                                                                }}
                                                                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                                                                style={{
                                                                    top: `${Math.random() * 100}%`,
                                                                    left: `${Math.random() * 100}%`,
                                                                    width: `${100 + Math.random() * 150}px`,
                                                                    height: `${100 + Math.random() * 150}px`,
                                                                    background: `radial-gradient(circle, ${['#FF5C0011', '#00F2FF11', '#FFD70011'][i % 3]} 0%, transparent 70%)`
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="premium-fireworks-border">
                                                        {/* 4개 코너 지점에서 최적화된 동시 폭발! */}
                                                        {[
                                                            { t: '0%', l: '0%' }, { t: '0%', l: '100%' },
                                                            { t: '100%', l: '0%' }, { t: '100%', l: '100%' }
                                                        ].map((pos, burstIdx) => (
                                                            <div key={burstIdx} style={{
                                                                position: 'absolute',
                                                                left: pos.l,
                                                                top: pos.t
                                                            }}>
                                                                {[...Array(10)].map((_, i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        className="premium-spark"
                                                                        initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                                                        animate={{
                                                                            scale: [0, 2, 0],
                                                                            opacity: [1, 1, 0],
                                                                            x: (Math.cos(i * 36 * Math.PI / 180) * (200 + Math.random() * 50)),
                                                                            y: (Math.sin(i * 36 * Math.PI / 180) * (200 + Math.random() * 50))
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.6,
                                                                            delay: 0,
                                                                            ease: "easeOut"
                                                                        }}
                                                                        style={{
                                                                            backgroundColor: ['#FFD700', '#FFFFFF', '#00F2FF', '#FF5C00'][i % 4]
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )
            }

            <LobbyView
                isOpen={isLobbyOpen}
                onClose={() => setIsLobbyOpen(false)}
                stageName={selectedStageName}
            />

            <ShopModal
                isOpen={isShopOpen}
                onClose={() => setIsShopOpen(false)}
                user={{ ...userStats, id: user.id }}
                onUpdateUser={(updated) => {
                    setUserStats(updated);
                    localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
                }}
            />

            <StageSelectModal
                isOpen={isStageModalOpen}
                onClose={() => setIsStageModalOpen(false)}
                stages={stages}
                userClearedStages={userStats.clearedStages}
                onSelectStage={(stageName) => {
                    setSelectedStageName(stageName);
                    setIsStageModalOpen(false);
                    setIsLobbyOpen(true);
                }}
            />

            {/* 캐릭터 변경 모달 [NEW] */}
            <AnimatePresence>
                {isCharChangeOpen && (
                    <div className="designer-modal-root skin-change-overlay" style={{ zIndex: 3000 }}>
                        <motion.div
                            className="modal-box skin-change-box"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <span className="m-tag">SKIN_RECONFIGURATION_SYSTEM</span>
                                <button className="m-close" onClick={() => setIsCharChangeOpen(false)}>CLOSE</button>
                            </div>
                            <div className="modal-body">
                                <h2 className="modal-title-v">CHANGE_IDENTITY</h2>
                                <p className="modal-desc-v">전술 포인트 1,000P가 소모되며 즉시 반영됩니다.</p>

                                <div className="skin-grid-v">
                                    {allCharacters.map(char => (
                                        <div
                                            key={char._id}
                                            className={`skin-card-v ${selectedCharId === char._id ? 'active' : ''}`}
                                            onClick={() => setSelectedCharId(char._id)}
                                        >
                                            <div className="skin-img-wrap">
                                                <div
                                                    className="skin-preview-v"
                                                    style={{
                                                        backgroundImage: `url(${char.imagePath})`,
                                                        backgroundSize: '288px 256px',
                                                        backgroundPosition: '0 0',
                                                        imageRendering: 'pixelated'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="skin-name-v">{char.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    className="confirm-change-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSkinChange}
                                    disabled={!selectedCharId}
                                >
                                    변경 승인 (CONFIRM)
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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

                * { box-sizing: border-box; }

                .designer-dashboard-root {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text);
                    font-family: var(--font-main);
                    position: relative;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1vh 20px;
                }

                .designer-dashboard-root::before {
                    content: "";
                    position: fixed; inset: 0;
                    background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
                    opacity: 0.3; pointer-events: none; z-index: -1;
                }

                .dashboard-content {
                    width: 100%;
                    max-width: 2000px;
                    min-height: 95vh;
                    position: relative;
                    z-index: 10;
                }

                /* Header Styling */
                .main-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 20px; padding: 15px 0; border-bottom: 1.5px solid var(--color-text);
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
                    display: grid; grid-template-columns: 1fr 450px; gap: 50px; align-items: start;
                    position: relative; z-index: 10;
                    min-height: 80vh;
                }

                /* Left Section Components */
                .left-section { display: flex; flex-direction: column; gap: 40px; }

                /* Profile Block - Compact Rebuild */
                .profile-block {
                    background: #fff; border: var(--border-main); padding: 40px 45px; position: relative;
                    z-index: 50; /* z-index 상향 */
                }
                .profile-compact-v { display: flex; gap: 40px; align-items: center; position: relative; pointer-events: auto !important; }
                .compact-avatar-side { display: flex; flex-direction: column; align-items: center; gap: 15px; pointer-events: auto !important; }

                .character-frame-mini { 
                    position: relative; width: 100px; height: 100px; 
                }
                .frame-inner {
                    width: 100%; height: 100%; border: var(--border-main); border-radius: 50%; padding: 8px;
                    display: flex; align-items: center; justify-content: center; background: #fff;
                    overflow: hidden;
                    transition: all 0.4s ease;
                }
                /* Skin Effects */
                .frame-inner.skin_fire { box-shadow: 0 0 20px rgba(255, 92, 0, 0.6); border-color: #FF5C00; background: #fff5f0; }
                .frame-inner.skin_water { box-shadow: 0 0 20px rgba(0, 242, 255, 0.6); border-color: #00F2FF; background: #f0fbff; }
                .frame-inner.skin_gold { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); border-color: #FFD700; background: #fffdf0; }
                .avatar-preview-v { transform: scale(1.2); }
                .change-char-btn {
                    background: var(--color-text); color: #fff; border: none;
                    padding: 8px 16px; font-size: 11px; font-weight: 700; cursor: pointer;
                    display: flex; flex-direction: column; align-items: center; gap: 2px;
                    transition: 0.2s;
                    pointer-events: auto !important; /* 클릭 차단 해제 */
                    position: relative;
                    z-index: 60;
                }
                .change-char-btn:hover { background: var(--color-accent); transform: scale(1.05); }
                .cost-tag { opacity: 0.8; font-size: 9px; color: #FFD700; }

                .compact-info-side { flex: 1; display: flex; flex-direction: column; gap: 12px; }

                .info-header-row { display: flex; align-items: baseline; gap: 15px; }
                .username-mini { font-size: 2.5rem; font-weight: 700; letter-spacing: -1.5px; line-height: 1; }
                .rank-tag-mini {
                    font-family: var(--font-mono); font-size: 9px; font-weight: 700;
                    background: var(--color-accent); color: #fff; padding: 3px 10px; border-radius: 4px;
                }

                .stats-row-mini { display: flex; align-items: baseline; gap: 25px; border-top: 1px solid #F0F0F0; padding-top: 12px; }
                .points-stat { margin-left: auto; }
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
                    box-shadow: 4px 4px 0px #1A1A1A;
                    pointer-events: auto !important;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .tile-btn:hover {
                    box-shadow: 8px 8px 0px var(--color-accent);
                    transform: translate(-4px, -4px);
                }
                .tile-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
                .tile-tag { font-family: var(--font-mono); font-size: 11px; opacity: 0.4; }
                .tile-icon-ui { width: 32px; height: 32px; border: var(--border-main); position: relative; }
                .tile-icon-ui.quiz::after { content: '?'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .tile-icon-ui.mission::after { content: '→'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .tile-footer h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 3px; }
                .tile-footer p { font-size: 11px; opacity: 0.5; font-weight: 500; }

                /* Stages List */
                .stages-list { max-height: 0; overflow: hidden; transition: 0.4s ease; opacity: 0; pointer-events: none; }
                .stages-list.visible { max-height: 800px; opacity: 1; margin-top: 20px; pointer-events: auto; padding-right: 20px; padding-bottom: 20px; }
                .stage-row {
                    display: grid; grid-template-columns: 100px 1fr 100px 30px;
                    padding: 20px; border: var(--border-main); margin-bottom: -1px;
                    align-items: center; cursor: pointer; transition: 0.2s;
                    position: relative; z-index: 40; pointer-events: auto !important;
                    background: #fff;
                }
                .stage-row:hover {
                    background: #F9F9F9;
                    transform: translateX(8px);
                    box-shadow: -4px 0px 0px var(--color-accent);
                }
                .s-id { font-family: var(--font-mono); font-size: 10px; opacity: 0.5; }
                .s-name { font-weight: 700; font-size: 14px; }
                .s-diff { font-family: var(--font-mono); font-size: 10px; text-align: center; }
                .s-arrow {
                    width: 8px; height: 8px; border-top: 2px solid var(--color-text);
                    border-right: 2px solid var(--color-text); transform: rotate(45deg);
                    transition: 0.2s;
                }
                .stage-row:hover .s-arrow { transform: rotate(45deg) translate(2px, -2px); }

                /* Leaderboard Section */
                .leaderboard-block {
                    background: #fff; border: var(--border-main); padding: 30px;
                    min-height: 600px;
                }
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
                    pointer-events: auto;
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
                    position: relative; z-index: 1100; pointer-events: auto !important;
                }
                .opt-card:hover { background: var(--color-text); color: #fff; }
                .opt-idx { font-family: var(--font-mono); font-size: 12px; opacity: 0.5; }
                .opt-txt { font-weight: 600; font-size: 1.1rem; }

                /* Skin Change Modal Custom */
                .skin-grid-v {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;
                    max-height: 400px; overflow-y: auto; padding: 10px; margin: 25px 0;
                    background: #fdfdfd; border: 1px solid #eee;
                }
                .skin-card-v {
                    border: 2px solid transparent; padding: 15px; cursor: pointer;
                    display: flex; flex-direction: column; align-items: center; transition: 0.2s;
                    background: #fff;
                }
                .skin-card-v:hover { background: #f0f0f0; }
                .skin-card-v.active { border-color: var(--color-accent); background: #fff5f0; box-shadow: 4px 4px 0px var(--color-accent); }
                
                .skin-img-wrap { width: 48px; height: 64px; overflow: hidden; margin-bottom: 10px; }
                .skin-preview-v { 
                    width: 48px; height: 64px; 
                    background-size: 288px 256px;
                    background-position: 0 0;
                    image-rendering: pixelated;
                    transition: transform 0.2s;
                }
                .skin-card-v:hover .skin-preview-v {
                    animation: charWalk 0.6s steps(6) infinite;
                    transform: scale(1.15);
                }

                @keyframes charWalk {
                    from { background-position: 0px 0px; }
                    to { background-position: -288px 0px; }
                }

                .skin-name-v { font-size: 10px; font-weight: 700; }

                .confirm-change-btn {
                    width: 100%; background: var(--color-text); color: #fff; border: none;
                    padding: 20px; font-weight: 700; cursor: pointer; font-family: var(--font-mono);
                }
                .confirm-change-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                .modal-title-v { font-size: 2rem; font-weight: 800; margin-bottom: 6px; }
                .modal-desc-v { font-size: 12px; opacity: 0.5; }

                .modal-result-overlay {
                    position: absolute; inset: 0; background: rgba(255,255,255,0.9); 
                    display: flex; align-items: center; justify-content: center;
                    z-index: 2000; pointer-events: auto;
                    backdrop-filter: blur(20px);
                }
                .artistic-result-container {
                    position: relative; width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .artistic-bg-blobs { position: absolute; inset: 0; filter: blur(80px); opacity: 0.4; z-index: -1; }
                .blob-1 { position: absolute; top: -10%; left: -10%; width: 50%; height: 50%; background: #00F2FF; border-radius: 50%; }
                .blob-2 { position: absolute; bottom: -10%; right: -10%; width: 50%; height: 50%; background: #FF5C00; border-radius: 50%; }

                .res-content.premium { 
                    max-width: 600px; text-align: center; z-index: 10;
                    padding: 40px;
                }
                .res-tag-v { font-family: var(--font-mono); font-size: 11px; letter-spacing: 3px; color: var(--color-text); opacity: 0.5; margin-bottom: 20px; }
                .res-main-title { font-size: 3.5rem; font-weight: 800; letter-spacing: -2px; margin-bottom: 24px; line-height: 1; }
                .res-main-title.correct { color: var(--color-text); }
                .res-main-title.wrong { color: var(--color-accent); }
                .res-explanation-v { font-size: 1.15rem; color: #444; line-height: 1.7; margin-bottom: 50px; font-weight: 400; word-break: keep-all; }
                
                .res-continue-btn-v {
                    background: transparent; border: 2px solid var(--color-text); padding: 18px 45px;
                    font-family: var(--font-mono); font-weight: 700; font-size: 12px; letter-spacing: 2px;
                    cursor: pointer; transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative; overflow: hidden;
                }
                .res-continue-btn-v:hover { background: var(--color-text); color: #fff; }

                .art-orb { position: absolute; border-radius: 50%; pointer-events: none; }
                
                .premium-fireworks-border { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
                .premium-spark { 
                    width: 5px; height: 5px; position: absolute; border-radius: 50%;
                    z-index: 5;
                    box-shadow: 0 0 8px rgba(255,255,255,0.8);
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
