import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StageSelectModal = ({ isOpen, onClose, stages, onSelectStage, userClearedStages = [] }) => {
    if (!isOpen) return null;

    return (
        <div className="stage-modal-overlay">
            <motion.div
                className="stage-modal-container"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
                <div className="stage-modal-header">
                    <div className="header-left">
                        <span className="modal-tag">MISSION_SELECT</span>
                        <h2>맵 선택</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>CLOSE</button>
                </div>

                <div className="stage-grid-scroll">
                    <div className="stage-card-grid">
                        {stages.map((stage) => {
                            const isLocked = false; // 모든 스테이지 잠금 해제 (테스트 및 자유 선택 허용)

                            return (
                                <motion.div
                                    key={stage.id}
                                    className={`stage-select-card ${isLocked ? 'is-locked' : ''}`}
                                    whileHover={!isLocked ? { y: -10, boxShadow: '12px 12px 0px #000' } : {}}
                                    onClick={() => !isLocked && onSelectStage(stage.name)}
                                >
                                    <div className="stage-card-top">
                                        <span className="stage-num">STAGE 0{stage.id}</span>
                                        <div className="difficulty-dots">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`dot ${i < (stage.difficulty === 'EASY' ? 1 : stage.difficulty === 'NORMAL' ? 2 : 3) ? 'active' : ''}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="stage-card-body">
                                        <div className="stage-visual-placeholder">
                                            {isLocked ? (
                                                <span className="lock-icon">🔒</span>
                                            ) : (
                                                <div className={`stage-bg-art stage-${stage.id}`}></div>
                                            )}
                                        </div>
                                        <h3 className="stage-title">{stage.name}</h3>
                                        <p className="stage-desc">{stage.description || '재난 현장에서 사람들을 구조하고 탈출하세요.'}</p>
                                    </div>

                                    <div className="stage-card-footer">
                                        {isLocked ? (
                                            <span className="lock-msg">이전 스테이지를 클리어하세요</span>
                                        ) : (
                                            <button className="select-btn">MISSION_START</button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            <style>{`
                .stage-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                    z-index: 2500; display: flex; align-items: center; justify-content: center;
                    padding: 40px; font-family: 'Space Grotesk', sans-serif;
                    pointer-events: auto;
                }
                .stage-modal-container {
                    background: #fff; border: 3px solid #000; width: 95%; max-width: 1200px;
                    height: 85vh; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 25px 25px 0px #000;
                }
                .stage-modal-header { 
                    padding: 15px 40px; border-bottom: 3px solid #000; 
                    display: flex; justify-content: space-between; align-items: center;
                    background: #fff;
                }
                .header-left h2 { font-weight: 800; font-size: 1.5rem; margin-top: 2px; letter-spacing: -0.5px; }
                .modal-tag { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; color: #FF5C00; }
                .modal-close { 
                    background: none; border: 2.5px solid #000; padding: 10px 25px; 
                    font-weight: 800; cursor: pointer; transition: 0.2s;
                }
                .modal-close:hover { background: #000; color: #fff; }

                .stage-grid-scroll { flex: 1; overflow-y: auto; padding: 40px; background: #F8F9FA; display: flex; align-items: center; }
                .stage-card-grid { 
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; 
                    width: 100%; max-width: 1000px; margin: 0 auto;
                }

                .stage-select-card { 
                    background: #fff; border: 3px solid #000; display: flex; flex-direction: column;
                    cursor: pointer; transition: 0.3s cubic-bezier(0.19, 1, 0.22, 1);
                    position: relative; overflow: hidden;
                }
                .stage-select-card.is-locked { opacity: 0.6; cursor: not-allowed; border-color: #ccc; }
                
                .stage-card-top { 
                    padding: 15px 20px; border-bottom: 2px solid #000; background: #fff;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .stage-num { font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 12px; }
                .difficulty-dots { display: flex; gap: 4px; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: #eee; border: 1px solid #ddd; }
                .dot.active { background: #FF5C00; border-color: #000; }

                .stage-card-body { padding: 25px; flex: 1; display: flex; flex-direction: column; }
                .stage-visual-placeholder { 
                    height: 140px; background: #f0f0f0; margin-bottom: 20px; border: 2px solid #000;
                    display: flex; align-items: center; justify-content: center; overflow: hidden;
                }
                .stage-bg-art { width: 100%; height: 100%; transition: 0.5s; }
                .stage-1 { background: linear-gradient(45deg, #FF9A9E, #FAD0C4); }
                .stage-2 { background: linear-gradient(45deg, #A18CD1, #FBC2EB); }
                .stage-3 { background: linear-gradient(45deg, #84FAB0, #8FD3F4); }
                .stage-select-card:hover .stage-bg-art { transform: scale(1.1); }

                .lock-icon { font-size: 3rem; opacity: 0.3; }
                .stage-title { font-weight: 800; font-size: 1.4rem; margin-bottom: 10px; }
                .stage-desc { font-size: 13px; opacity: 0.6; line-height: 1.5; }

                .stage-card-footer { padding: 20px; border-top: 1px dashed #ddd; }
                .select-btn { 
                    width: 100%; padding: 12px; background: #000; color: #fff; 
                    border: none; font-weight: 800; cursor: pointer;
                }
                .lock-msg { font-size: 11px; color: #999; text-align: center; display: block; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default StageSelectModal;
