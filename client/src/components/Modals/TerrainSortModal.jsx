import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const CATEGORY_COLORS = {
    mountain: { bg: '#fef3c7', border: '#d97706', icon: '🏔️' },
    water:    { bg: '#dbeafe', border: '#2563eb', icon: '💧' },
    flat:     { bg: '#dcfce7', border: '#16a34a', icon: '🌾' }
};

const TerrainSortModal = () => {
    const { terrainSort, closeTerrainSort } = useGameStore();
    const [assignments, setAssignments] = useState({});   // itemId → categoryId
    const [feedback, setFeedback] = useState(null);

    if (!terrainSort.data) return null;
    const { intro, categories, items, successMessage, failMessage } = terrainSort.data;

    const assign = (itemId, categoryId) => {
        if (feedback) return;
        setAssignments(prev => ({ ...prev, [itemId]: categoryId }));
    };

    const allAssigned = items.every(it => assignments[it.id]);
    const allCorrect = items.every(it => assignments[it.id] === it.correctCategory);

    const handleSubmit = () => {
        if (!allAssigned) return;
        if (allCorrect) {
            setFeedback({ isCorrect: true, message: successMessage });
            setTimeout(() => {
                if (terrainSort.onSolve) terrainSort.onSolve();
                closeTerrainSort();
            }, 2500);
        } else {
            setFeedback({ isCorrect: false, message: failMessage });
            setTimeout(() => {
                setFeedback(null);
                setAssignments({});
            }, 3000);
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
                    padding: 30, maxWidth: 760, width: '92%',
                    boxShadow: '12px 12px 0 #000'
                }}
            >
                <div style={{ fontSize: 11, letterSpacing: 2, color: '#FF5C00', fontWeight: 800 }}>
                    MISSION · 지형 분류
                </div>
                <h2 style={{ fontSize: 22, margin: '6px 0 8px', fontWeight: 800 }}>땅의 생김새를 정리하자</h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 22 }}>{intro}</p>

                {/* 카테고리 바구니 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
                    {categories.map(cat => {
                        const color = CATEGORY_COLORS[cat.id];
                        const assignedItems = items.filter(it => assignments[it.id] === cat.id);
                        return (
                            <div key={cat.id} style={{
                                background: color.bg,
                                border: `2px dashed ${color.border}`,
                                borderRadius: 8, padding: 12, minHeight: 90
                            }}>
                                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                                    {color.icon} {cat.label}
                                </div>
                                <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}>{cat.description}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {assignedItems.map(it => (
                                        <span key={it.id} style={{
                                            background: '#fff', border: `1px solid ${color.border}`,
                                            padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600
                                        }}>
                                            {it.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 분류할 아이템 */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#666', marginBottom: 8, letterSpacing: 1 }}>
                        아래 지형을 위 바구니에 분류하세요
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {items.map(it => {
                            const assigned = assignments[it.id];
                            const color = assigned ? CATEGORY_COLORS[assigned] : null;
                            return (
                                <div key={it.id} style={{
                                    background: assigned ? color.bg : '#f5f5f5',
                                    border: `2px solid ${assigned ? color.border : '#ccc'}`,
                                    borderRadius: 6, padding: '8px 12px'
                                }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{it.name}</div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {categories.map(cat => {
                                            const c = CATEGORY_COLORS[cat.id];
                                            const isActive = assigned === cat.id;
                                            return (
                                                <button key={cat.id} onClick={() => assign(it.id, cat.id)}
                                                    disabled={!!feedback}
                                                    style={{
                                                        background: isActive ? c.border : '#fff',
                                                        color: isActive ? '#fff' : '#333',
                                                        border: `1px solid ${c.border}`,
                                                        borderRadius: 4, padding: '2px 6px',
                                                        fontSize: 10, fontWeight: 700, cursor: 'pointer'
                                                    }}>
                                                    {c.icon}{cat.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 제출 버튼 */}
                <button
                    onClick={handleSubmit}
                    disabled={!allAssigned || !!feedback}
                    style={{
                        width: '100%', padding: 12, background: allAssigned && !feedback ? '#000' : '#ccc',
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontSize: 14, fontWeight: 800, letterSpacing: 1,
                        cursor: allAssigned && !feedback ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit'
                    }}
                >
                    {allAssigned ? '정답 확인' : '모든 지형을 분류해 주세요'}
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

export default TerrainSortModal;
