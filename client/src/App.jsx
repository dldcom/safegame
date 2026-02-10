import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './views/LoginPage';
import StudentDashboard from './views/StudentDashboard';
import TeacherDashboard from './views/TeacherDashboard';
import GamePage from './views/GamePage';
import MapMaker from './views/MapMaker';

import CharacterMaker from './views/CharacterMaker';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* 1. 첫 페이지: 로그인 */}
                <Route path="/" element={<LoginPage />} />

                {/* 2. 학생용 스테이지 선택 대시보드 */}
                <Route path="/student" element={<StudentDashboard />} />

                {/* 3. 교사용 학생 관리 대시보드 */}
                <Route path="/teacher" element={<TeacherDashboard />} />

                {/* 4. 실제 게임 화면 */}
                <Route path="/game" element={<GamePage />} />

                {/* 5. 맵 제작 도구 (교사용) */}
                <Route path="/map-maker" element={<MapMaker />} />

                {/* 6. 캐릭터 제작 도구 */}
                <Route path="/character-maker" element={<CharacterMaker />} />
            </Routes>
        </Router>
    );
};

export default App;
