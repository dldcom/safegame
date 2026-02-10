import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || user.role !== 'teacher') {
            navigate('/');
        }
    }, [navigate, user.role]);

    const [students] = useState([
        { id: 1, name: '김철수', progress: 100, lastActive: '10분 전', status: '완료', score: 980 },
        { id: 2, name: '이영희', progress: 45, lastActive: '2시간 전', status: '학습 중', score: 420 },
        { id: 3, name: '박민준', progress: 10, lastActive: '어제', status: '미수행', score: 0 },
        { id: 4, name: '정다은', progress: 85, lastActive: '3시간 전', status: '학습 중', score: 750 },
        { id: 5, name: '최현석', progress: 100, lastActive: '5시간 전', status: '완료', score: 920 },
    ]);

    return (
        <div className="teacher-editorial-root">
            <div className="editorial-texture"></div>

            <aside className="ed-sidebar">
                <div className="ed-logo-area">
                    <h2 className="ed-logo">Sage.</h2>
                    <span className="ed-logo-sub">교육 관리 콘솔</span>
                </div>

                <nav className="ed-nav">
                    <div className="ed-nav-link active" onClick={() => navigate('/map-maker')}>
                        <span className="nav-num">01</span>
                        <span className="nav-text">맵 제작 도구</span>
                    </div>
                    <div className="ed-nav-link active" onClick={() => navigate('/character-maker')}>
                        <span className="nav-num">02</span>
                        <span className="nav-text">캐릭터 제작 도구</span>
                    </div>
                </nav>

                <div className="ed-user-info">
                    <p className="ed-user-name">{user.username || '관리자'}</p>
                    <button onClick={() => { localStorage.clear(); navigate('/'); }} className="ed-logout">
                        세션 종료 및 로그아웃
                    </button>
                </div>
            </aside>

            <main className="ed-main">
                <section className="ed-vertical-stack">
                    <motion.div
                        className="tool-card-wide map-theme"
                        whileHover={{ y: -10 }}
                        onClick={() => navigate('/map-maker')}
                    >
                        <div className="card-content">
                            <label className="card-label">TOOL 01</label>
                            <h2 className="card-title">맵 만들기</h2>
                            <div className="card-footer">
                                <span className="explore-text">도구 열기</span>
                                <div className="arrow-icon">→</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="tool-card-wide char-theme"
                        whileHover={{ y: -5 }}
                        onClick={() => navigate('/character-maker')}
                    >
                        <div className="card-content">
                            <label className="card-label">TOOL 02</label>
                            <h2 className="card-title">캐릭터 제작</h2>
                            <div className="card-footer">
                                <span className="explore-text">도구 열기</span>
                                <div className="arrow-icon">→</div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <style>{`
                .teacher-editorial-root {
                    display: flex;
                    min-height: 100vh;
                    background: #fbfaf8;
                    color: #1a1a1a;
                    font-family: 'Noto Sans KR', sans-serif;
                    position: relative;
                    pointer-events: auto; /* 클릭 상호작용 활성화 */
                }

                .editorial-texture {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
                    opacity: 0.2;
                    pointer-events: none;
                    z-index: 0;
                }

                .ed-sidebar {
                    width: 320px;
                    border-right: 1px solid #e0e0e0;
                    padding: 60px 40px;
                    display: flex;
                    flex-direction: column;
                    z-index: 10;
                    background: #fff;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                }

                .ed-logo {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.5rem;
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -1px;
                }

                .ed-logo-sub {
                    font-size: 11px;
                    letter-spacing: 1px;
                    color: #888;
                    display: block;
                    margin-top: 5px;
                    font-family: 'Noto Sans KR', sans-serif;
                }

                .ed-nav {
                    margin-top: 80px;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .ed-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    cursor: pointer;
                    opacity: 0.4;
                    transition: opacity 0.3s;
                }

                .ed-nav-link:hover, .ed-nav-link.active {
                    opacity: 1;
                }

                .nav-num {
                    font-size: 13px;
                    font-weight: 700;
                    font-family: 'Playfair Display', serif;
                }

                .nav-text {
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: -0.2px;
                }

                .ed-user-info {
                    margin-top: auto;
                }

                .ed-user-name {
                    font-family: 'Noto Serif KR', serif;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .ed-logout {
                    background: none;
                    border: none;
                    font-size: 11px;
                    letter-spacing: 0;
                    text-decoration: underline;
                    color: #888;
                    cursor: pointer;
                    padding: 0;
                    font-family: inherit;
                }

                .ed-main {
                    flex: 1;
                    padding: 60px 80px;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .ed-vertical-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    width: 100%;
                }

                .tool-card-wide {
                    position: relative;
                    height: 180px;
                    background: #ffffff;
                    border: 1px solid #eeeeee;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .tool-card-wide:hover {
                    background: #ffffff;
                    border-color: #1a1a1a;
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                }

                .card-content {
                    width: 100%;
                    padding: 40px 60px;
                    display: flex;
                    flex-direction: column;
                    z-index: 2;
                }

                .card-label {
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: #999;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                .card-title {
                    font-family: 'Noto Serif KR', serif;
                    font-size: 2rem;
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -1px;
                    color: #1a1a1a;
                    transition: color 0.3s ease;
                }

                .card-footer {
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .explore-text {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: 0.5px;
                }

                .arrow-icon {
                    color: #1a1a1a;
                    font-size: 18px;
                    transition: transform 0.3s ease;
                }

                .tool-card-wide:hover .arrow-icon {
                    transform: translateX(8px);
                }

                /* Accent Styles on Hover */
                .map-theme:hover .card-title { color: #2563eb; }
                .char-theme:hover .card-title { color: #059669; }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
