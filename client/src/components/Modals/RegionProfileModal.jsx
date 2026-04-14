import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const RegionProfileModal = () => {
    const { regionProfile, closeRegionProfile } = useGameStore();
    const [answers, setAnswers] = useState({});
    const [feedback, setFeedback] = useState(null);

    if (!regionProfile.data) return null;
    const { intro, fields, successMessage, failMessage } = regionProfile.data;

    const allAnswered = fields.every(f => answers[f.id] !== undefined);
    const allCorrect = fields.every(f => answers[f.id] === f.correctIndex);

    const handleSubmit = () => {
        if (!allAnswered) return;
        if (allCorrect) {
            setFeedback({ isCorrect: true, message: successMessage });
            setTimeout(() => {
                if (regionProfile.onSolve) regionProfile.onSolve();
                closeRegionProfile();
            }, 2500);
        } else {
            setFeedback({ isCorrect: false, message: failMessage });
            setTimeout(() => {
                setFeedback(null);
                setAnswers({});
            }, 3000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Noto Sans KR', sans-serif", pointerEvents: 'auto',
                overflow: 'auto', padding: 20
            }}
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                style={{
                    background: '#fff', border: '3px solid #000', borderRadius: 12,
                    padding: 30, maxWidth: 680, width: '100%',
                    boxShadow: '12px 12px 0 #000'
                }}
            >
                <div style={{ fontSize: 11, letterSpacing: 2, color: '#FF5C00', fontWeight: 800 }}>
                    FINAL · 지리 정보 프로필
                </div>
                <h2 style={{ fontSize: 24, margin: '6px 0 8px', fontWeight: 800 }}>
                    🗺️ 호곡 프로필 카드 완성
                </h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>{intro}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {fields.map(field => (
                        <div key={field.id} style={{
                            border: '2px solid #000', borderRadius: 8, padding: 14,
                            background: answers[field.id] !== undefined ? '#fffbeb' : '#fafafa'
                        }}>
                            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{field.label}</div>
                            <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{field.question}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {field.options.map((opt, idx) => {
                                    const isSelected = answers[field.id] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => !feedback && setAnswers(prev => ({ ...prev, [field.id]: idx }))}
                                            disabled={!!feedback}
                                            style={{
                                                background: isSelected ? '#000' : '#fff',
                                                color: isSelected ? '#fff' : '#333',
                                                border: `2px solid ${isSelected ? '#000' : '#ddd'}`,
                                                borderRadius: 6,
                                                padding: '8px 12px',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                fontFamily: 'inherit',
                                                textAlign: 'left',
                                                cursor: feedback ? 'default' : 'pointer',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || !!feedback}
                    style={{
                        width: '100%', padding: 14, marginTop: 22,
                        background: allAnswered && !feedback ? '#FF5C00' : '#ccc',
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontSize: 14, fontWeight: 800, letterSpacing: 1,
                        cursor: allAnswered && !feedback ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit'
                    }}
                >
                    {allAnswered ? '프로필 제출' : '모든 항목을 선택해 주세요'}
                </button>

                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 16, padding: 14, borderRadius: 8,
                            background: feedback.isCorrect ? '#dcfce7' : '#fee2e2',
                            color: feedback.isCorrect ? '#166534' : '#991b1b',
                            fontWeight: 700, textAlign: 'center'
                        }}
                    >
                        {feedback.isCorrect ? '✓ ' : '✗ '}{feedback.message}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default RegionProfileModal;
