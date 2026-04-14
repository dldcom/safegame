import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

// 등고선 시각화 — 촘촘한 절벽 / 완만한 언덕 / 바다
const ContourSvg = ({ type }) => {
    if (type === 'steep') {
        // 촘촘한 등고선
        return (
            <svg viewBox="0 0 120 80" style={{ width: '100%', height: 90 }}>
                {[10, 18, 26, 34, 42, 50, 58, 66].map(y => (
                    <path key={y} d={`M10,${y} Q60,${y - 4} 110,${y}`} fill="none" stroke="#a855f7" strokeWidth="1.5" />
                ))}
                <text x="60" y="76" textAnchor="middle" fontSize="9" fill="#666">간격 매우 좁음 (급경사)</text>
            </svg>
        );
    }
    if (type === 'gentle') {
        // 간격 넓은 등고선
        return (
            <svg viewBox="0 0 120 80" style={{ width: '100%', height: 90 }}>
                {[14, 30, 46, 62].map(y => (
                    <path key={y} d={`M10,${y} Q60,${y - 3} 110,${y}`} fill="none" stroke="#22c55e" strokeWidth="2" />
                ))}
                <text x="60" y="76" textAnchor="middle" fontSize="9" fill="#666">간격 넓음 (완만)</text>
            </svg>
        );
    }
    // 바다 (등고선 없음)
    return (
        <svg viewBox="0 0 120 80" style={{ width: '100%', height: 90 }}>
            {[25, 40, 55].map(y => (
                <path key={y} d={`M0,${y} Q30,${y - 2} 60,${y} T120,${y}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
            ))}
            <text x="60" y="76" textAnchor="middle" fontSize="9" fill="#666">등고선 없음 (바다)</text>
        </svg>
    );
};

const TYPE_MAP = { A: 'steep', B: 'gentle', C: 'sea' };

const ContourPuzzleModal = () => {
    const { contourPuzzle, closeContourPuzzle } = useGameStore();
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);

    if (!contourPuzzle.data) return null;
    const { intro, question, options } = contourPuzzle.data;

    const handleSelect = (idx) => {
        if (feedback) return;
        const opt = options[idx];
        setSelected(idx);
        setFeedback({ isCorrect: opt.isCorrect, message: opt.feedback });

        if (opt.isCorrect) {
            setTimeout(() => {
                if (contourPuzzle.onSolve) contourPuzzle.onSolve();
                closeContourPuzzle();
            }, 2000);
        } else {
            setTimeout(() => {
                setSelected(null);
                setFeedback(null);
            }, 2500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Noto Sans KR', sans-serif", pointerEvents: 'auto'
            }}
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                style={{
                    background: '#fff', border: '3px solid #000', borderRadius: 12,
                    padding: 30, maxWidth: 720, width: '90%',
                    boxShadow: '12px 12px 0 #000'
                }}
            >
                <div style={{ fontSize: 11, letterSpacing: 2, color: '#FF5C00', fontWeight: 800 }}>
                    MISSION · 등고선 길찾기
                </div>
                <h2 style={{ fontSize: 22, marginTop: 6, marginBottom: 8, fontWeight: 800 }}>
                    {question}
                </h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 22 }}>{intro}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {options.map((opt, idx) => {
                        const isSelected = selected === idx;
                        const showResult = feedback && isSelected;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={!!feedback}
                                style={{
                                    background: showResult ? (opt.isCorrect ? '#dcfce7' : '#fee2e2') : '#fafafa',
                                    border: `2px solid ${showResult ? (opt.isCorrect ? '#16a34a' : '#dc2626') : '#000'}`,
                                    borderRadius: 8,
                                    padding: 14,
                                    cursor: feedback ? 'default' : 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{opt.label}</div>
                                <ContourSvg type={TYPE_MAP[opt.label]} />
                                <div style={{ fontSize: 12, marginTop: 8, color: '#333' }}>{opt.description}</div>
                            </button>
                        );
                    })}
                </div>

                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 20, padding: 14, borderRadius: 8,
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

export default ContourPuzzleModal;
