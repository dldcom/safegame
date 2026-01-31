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
                    <div className="ed-nav-link active">
                        <span className="nav-num">01</span>
                        <span className="nav-text">학습 현황 모니터링</span>
                    </div>
                    <div className="ed-nav-link">
                        <span className="nav-num">02</span>
                        <span className="nav-text">성취도 분석</span>
                    </div>
                    <div className="ed-nav-link">
                        <span className="nav-num">03</span>
                        <span className="nav-text">플랫폼 설정</span>
                    </div>
                    <div className="ed-nav-link" onClick={() => navigate('/map-maker')}>
                        <span className="nav-num">04</span>
                        <span className="nav-text">맵 제작 도구</span>
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
                <header className="ed-header">
                    <div className="ed-header-title">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="serif-title"
                        >
                            학습 진척도 관리.
                        </motion.h1>
                        <p className="ed-subtitle">우리 반 학생들의 안전 의식 및 응급처치 역량 지표를 실시간으로 확인합니다.</p>
                    </div>
                    <div className="ed-header-status">
                        <span className="status-dot"></span> 서버 연결됨
                    </div>
                </header>

                <section className="ed-stats-grid">
                    <div className="ed-stat-box">
                        <label>전체 수강생</label>
                        <h3>24 <small>명</small></h3>
                    </div>
                    <div className="ed-stat-box">
                        <label>교육 이수율</label>
                        <h3>52.4 <small>%</small></h3>
                    </div>
                    <div className="ed-stat-box accent">
                        <label>평균 마스터리 포인트</label>
                        <h3>842 <small>pts</small></h3>
                    </div>
                </section>

                <section className="ed-table-section">
                    <div className="table-header-row">
                        <h2 className="section-small-title">학생 명단 및 성과 기록</h2>
                        <div className="table-actions">
                            <button className="minimal-btn">데이터 내보내기 (CSV)</button>
                        </div>
                    </div>

                    <table className="ed-table">
                        <thead>
                            <tr>
                                <th>학생 성명</th>
                                <th>현재 상태</th>
                                <th>학습 진도</th>
                                <th>성취 점수</th>
                                <th>최근 활동</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, idx) => (
                                <motion.tr
                                    key={s.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <td className="td-name">{s.name}</td>
                                    <td>
                                        <span className={`ed-status-pill ${s.status === '완료' ? 'complete' : 'pending'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ed-progress-container">
                                            <div className="ed-progress-bar" style={{ width: `${s.progress}%` }}></div>
                                            <span className="ed-progress-text">{s.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="td-score">{s.score.toLocaleString()}</td>
                                    <td className="td-time">{s.lastActive}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
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
                    padding: 80px 100px 150px 100px;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    gap: 60px;
                }

                .ed-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .serif-title {
                    font-family: 'Noto Serif KR', serif;
                    font-size: 3.5rem;
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -1.5px;
                }

                .ed-subtitle {
                    font-family: 'Noto Serif KR', serif;
                    font-size: 1.2rem;
                    color: #666;
                    font-style: italic;
                    margin-top: 15px;
                    line-height: 1.6;
                }

                .ed-header-status {
                    font-size: 12px;
                    font-weight: 700;
                    padding: 10px 20px;
                    border: 1px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #2ecc71;
                    border-radius: 50%;
                }

                .ed-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1px;
                    background: #e0e0e0;
                    border: 1px solid #e0e0e0;
                }

                .ed-stat-box {
                    background: #fff;
                    padding: 40px;
                }

                .ed-stat-box label {
                    display: block;
                    font-size: 12px;
                    font-weight: 700;
                    color: #888;
                    margin-bottom: 15px;
                }

                .ed-stat-box h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 3rem;
                    margin: 0;
                }

                .ed-stat-box h3 small {
                    font-family: 'Noto Sans KR', sans-serif;
                    font-size: 1rem;
                    color: #888;
                    margin-left: 5px;
                    font-weight: 400;
                }

                .ed-table-section {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .table-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #1a1a1a;
                    padding-bottom: 15px;
                }

                .section-small-title {
                    font-family: 'Noto Serif KR', serif;
                    font-size: 1.5rem;
                    margin: 0;
                    font-weight: 700;
                }

                .minimal-btn {
                    background: none;
                    border: 1px solid #ccc;
                    padding: 8px 15px;
                    font-size: 11px;
                    cursor: pointer;
                    font-family: inherit;
                }

                .ed-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .ed-table th {
                    text-align: left;
                    font-size: 12px;
                    font-weight: 700;
                    color: #888;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }

                .ed-table td {
                    padding: 30px 0;
                    border-bottom: 1px solid #eee;
                    font-size: 15px;
                }

                .td-name {
                    font-family: 'Noto Serif KR', serif;
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .ed-status-pill {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border: 1px solid #1a1a1a;
                }

                .ed-status-pill.pending {
                    border-color: #ccc;
                    color: #888;
                }

                .ed-progress-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .ed-progress-bar {
                    height: 2px;
                    background: #1a1a1a;
                }

                .ed-progress-text {
                    font-size: 12px;
                    font-weight: 700;
                    color: #888;
                }

                .td-score {
                    font-family: 'Playfair Display', serif;
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .td-time {
                    color: #888;
                    font-size: 13px;
                }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
