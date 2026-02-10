import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useGameStore from '../store/useGameStore';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const navigate = useNavigate();
    const [characters, setCharacters] = useState([]);
    const [selectedChar, setSelectedChar] = useState(null);
    const setUserStats = useGameStore(state => state.setUserStats);

    // 캐릭터 목록 불러오기
    React.useEffect(() => {
        if (!isLogin) {
            axios.get('/api/character/list')
                .then(res => setCharacters(res.data))
                .catch(err => console.error('Char list error:', err));
        }
    }, [isLogin]);

    // 자동 로그인 체크: 토큰이 있으면 대시보드로 즉시 이동
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

        if (token && savedUser) {
            setUserStats(savedUser); // 스토어 데이터 동기화
            savedUser.role === 'teacher' ? navigate('/teacher') : navigate('/student');
        }
    }, [navigate, setUserStats]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin
                ? { username, password }
                : { username, password, role, customCharacterId: selectedChar?._id };
            const res = await axios.post(endpoint, payload);

            if (isLogin) {
                const userData = res.data.user;
                console.log(">>> [Login Success] User Data:", userData);

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUserStats(userData);

                userData.role === 'teacher' ? navigate('/teacher') : navigate('/student');
            } else {
                alert('회원가입이 완료되었습니다! 로그인해 주세요.');
                setIsLogin(true);
                setSelectedChar(null);
            }
        } catch (err) {
            alert(`오류: ${err.response?.data?.message || '인증에 실패했습니다.'}`);
        }
    };

    return (
        <div className="auth-page-root">
            <main className="auth-main">
                <div className="auth-side-brand">
                    <div className="brand-badge">PROTOCOL_SAFE_V2</div>
                    <h1 className="brand-glitch">SAFEGAME</h1>
                    <p className="brand-description">
                        실시간 안전 대응 전략 시뮬레이션 및 데이터 기반 교육 시스템.
                        전술적 판단력과 생존 지식을 배양하십시오.
                    </p>
                    <div className="brand-footer-tags">
                        <span>#CRITICAL_LEARNING</span>
                        <span>#SURVIVAL_TACTICS</span>
                    </div>
                </div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="auth-card"
                >
                    <div className="card-header">
                        <div className="header-deco"></div>
                        <span className="header-text">{isLogin ? 'ACCESS_REQUIRED' : 'NEW_ENROLLMENT'}</span>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label>IDENTIFIER_ID</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="입력하세요..."
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>SECURITY_KEY</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div className="input-group">
                                    <label>ASSIGN_ROLE</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="student">STUDENT_CADET</option>
                                        <option value="teacher">INSTRUCTOR_OPS</option>
                                    </select>
                                </div>
                            )}

                            {!isLogin && role === 'student' && (
                                <div className="input-group">
                                    <label>SELECT_CHARACTER ({characters.length})</label>
                                    <div className="char-selection-grid">
                                        {characters.map(char => (
                                            <div
                                                key={char._id}
                                                className={`char-item ${selectedChar?._id === char._id ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log('Character selected:', char.name);
                                                    setSelectedChar(char);
                                                }}
                                                style={{ zIndex: 30, position: 'relative' }}
                                            >
                                                <div
                                                    className="char-preview-v2"
                                                    style={{
                                                        backgroundImage: `url(${char.imagePath})`,
                                                        pointerEvents: 'none'
                                                    }}
                                                ></div>
                                                <span className="char-name" style={{ pointerEvents: 'none' }}>{char.name}</span>
                                            </div>
                                        ))}
                                        {characters.length === 0 && <p className="no-chars">등록된 캐릭터가 없습니다.</p>}
                                    </div>
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                className="auth-submit-btn"
                                whileTap={{ scale: 0.98, y: 2 }}
                                disabled={!isLogin && role === 'student' && !selectedChar}
                            >
                                {isLogin ? 'SYSTEM_ENTER' : 'CREATE_ACCOUNT'}
                            </motion.button>
                        </form>

                        <div className="auth-footer">
                            <button onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                                {isLogin ? "신규 사용자 등록 →" : "← 기존 계정으로 로그인"}
                            </button>
                        </div>
                    </div>

                    <div className="card-scanline"></div>
                </motion.div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

                :root {
                    --color-bg: #F9F8F6;
                    --color-text: #1A1A1A;
                    --color-accent: #FF5C00;
                    --color-box: #FFFFFF;
                    --border-main: 2px solid #1A1A1A;
                    --font-main: 'Space Grotesk', sans-serif;
                    --font-mono: 'IBM Plex Mono', monospace;
                }

                .auth-page-root {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text);
                    font-family: var(--font-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    padding: 40px;
                }

                .auth-page-root::before {
                    content: "";
                    position: fixed; inset: 0;
                    background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
                    opacity: 0.3; pointer-events: none; z-index: -1;
                }

                .auth-main {
                    display: grid;
                    grid-template-columns: 1fr 450px;
                    gap: 80px;
                    max-width: 1200px;
                    width: 100%;
                    position: relative;
                    z-index: 10;
                }

                /* Brand Section */
                .auth-side-brand {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .brand-badge {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                    background: var(--color-accent);
                    color: #fff;
                    padding: 4px 12px;
                    display: inline-block;
                    width: fit-content;
                    margin-bottom: 20px;
                }

                .brand-glitch {
                    font-size: 8rem;
                    font-weight: 800;
                    line-height: 0.9;
                    letter-spacing: -6px;
                    margin-bottom: 30px;
                    position: relative;
                }

                .brand-description {
                    font-size: 1.25rem;
                    line-height: 1.6;
                    max-width: 500px;
                    opacity: 0.8;
                    margin-bottom: 40px;
                    word-break: keep-all;
                }

                .brand-footer-tags {
                    display: flex;
                    gap: 20px;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    opacity: 0.4;
                }

                /* Auth Card */
                .auth-card {
                    background: var(--color-box);
                    border: var(--border-main);
                    box-shadow: 16px 16px 0px var(--color-text);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .card-header {
                    padding: 24px 30px;
                    border-bottom: var(--border-main);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f0f0f0;
                }

                .header-deco { width: 12px; height: 12px; background: var(--color-accent); }
                .header-text { font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 1px; }

                .card-body {
                    padding: 40px;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .input-group label {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    font-weight: 600;
                    opacity: 0.5;
                }

                .input-group input, .input-group select {
                    background: #fff;
                    border: var(--border-main);
                    padding: 15px 20px;
                    font-family: var(--font-main);
                    font-size: 1rem;
                    font-weight: 600;
                    outline: none;
                    transition: 0.2s;
                    position: relative;
                    z-index: 20;
                    pointer-events: auto !important;
                }

                .input-group input:focus {
                    background: #F9F8F6;
                    box-shadow: 4px 4px 0px rgba(0,0,0,0.05);
                }

                .auth-submit-btn {
                    background: var(--color-text);
                    color: #fff;
                    border: none;
                    padding: 20px;
                    font-family: var(--font-mono);
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 1.5px;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: 0.1s;
                    position: relative;
                    z-index: 20;
                    pointer-events: auto !important;
                }

                .auth-submit-btn:hover {
                    background: var(--color-accent);
                }

                .auth-footer {
                    margin-top: 30px;
                    text-align: center;
                }

                .toggle-link {
                    background: none;
                    border: none;
                    font-family: var(--font-main);
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: 0.2s;
                    position: relative;
                    z-index: 20;
                    pointer-events: auto !important;
                }

                .toggle-link:hover { opacity: 1; color: var(--color-accent); }

                .card-scanline {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 2px;
                    background: rgba(255, 92, 0, 0.1);
                    animation: scanline 8s linear infinite;
                    pointer-events: none;
                }

                @keyframes scanline {
                    0% { top: -2%; }
                    100% { top: 102%; }
                }

                .char-selection-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    max-height: 200px;
                    overflow-y: auto;
                    padding: 4px;
                    border: 1px solid #eee;
                    background: #fdfdfd;
                    pointer-events: auto !important; /* 클릭 차단 해제 */
                    position: relative;
                    z-index: 50;
                }

                .char-item {
                    border: 2px solid transparent;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    transition: 0.2s;
                    background: white;
                    pointer-events: auto !important; /* 확실하게 추가 */
                }

                .char-item:hover { background: #f0f0f0; }

                .char-item.active {
                    border-color: var(--color-accent);
                    background: #fff5f0;
                }

                .char-preview-v2 {
                    width: 48px;
                    height: 64px;
                    background-size: 288px 256px; /* 48*6, 64*4 */
                    background-position: 0px 0px; /* 정면 보고 서있기 */
                    background-repeat: no-repeat;
                    image-rendering: pixelated;
                    margin-bottom: 6px;
                    transition: transform 0.2s;
                }

                .char-item:hover .char-preview-v2 {
                    animation: charWalk 0.6s steps(6) infinite;
                    transform: scale(1.15);
                }

                @keyframes charWalk {
                    from { background-position: 0px 0px; }
                    to { background-position: -288px 0px; } /* 전체 너비만큼 이동 */
                }

                .char-name {
                    font-size: 10px;
                    font-weight: 700;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                .no-chars { font-size: 11px; opacity: 0.5; grid-column: span 3; padding: 20px; text-align: center; }

                @media (max-width: 1100px) {
                    .auth-main { grid-template-columns: 1fr; gap: 40px; padding-top: 60px; }
                    .brand-glitch { font-size: 5rem; letter-spacing: -3px; }
                    .auth-page-root { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
