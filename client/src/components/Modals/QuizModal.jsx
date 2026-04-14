import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

const QuizModal = () => {
    const { quiz, closeQuiz, setHearts, hearts } = useGameStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [canInput, setCanInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setCanInput(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        if (!canInput || feedback || isSubmitting) return;

        const handleKeyDown = (e) => {
            const currentQuiz = quiz.data[currentIndex];
            if (!currentQuiz) return;

            if (e.key >= '1' && e.key <= currentQuiz.options.length.toString()) {
                handleAnswer(parseInt(e.key) - 1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                setSelectedOption(prev => prev === null ? 0 : Math.max(0, prev - 1));
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                setSelectedOption(prev => prev === null ? 0 : Math.min(currentQuiz.options.length - 1, prev + 1));
            } else if ((e.code === 'Enter' || e.code === 'Space') && selectedOption !== null) {
                e.preventDefault();
                e.stopPropagation();
                handleAnswer(selectedOption);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canInput, currentIndex, selectedOption, feedback, isSubmitting]);

    if (!quiz.data) return null;

    const currentQuiz = quiz.data[currentIndex];

    const handleAnswer = (index) => {
        if (feedback || isSubmitting) return;

        const isCorrect = index === currentQuiz.answerIndex;

        if (isCorrect) {
            setFeedback({ isCorrect: true, message: "정답입니다! 👏" });
            setTimeout(() => {
                if (currentIndex + 1 < quiz.data.length) {
                    setCurrentIndex(prev => prev + 1);
                    setSelectedOption(null);
                    setFeedback(null);
                } else {
                    finishQuiz(true);
                }
            }, 1500);
        } else {
            const explanation = currentQuiz.explanation || "다시 한번 생각해보세요!";
            setFeedback({
                isCorrect: false,
                message: explanation
            });

            const gameScene = window.game?.scene?.getScene('GameScene');
            if (gameScene) {
                gameScene.hearts--;
                setHearts(gameScene.hearts);
                if (gameScene.hearts <= 0) {
                    setTimeout(() => finishQuiz(false), 2500);
                } else {
                    setTimeout(() => {
                        setFeedback(null);
                        setSelectedOption(null);
                    }, 2500);
                }
            }
        }
    };

    const finishQuiz = (isSuccess) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const gameScene = window.game?.scene?.getScene('GameScene');
        if (gameScene) {
            gameScene.isUIOpen = false;
            if (isSuccess) {
                // Stage 3는 NPC별 퀴즈 단위이므로 미션 클리어 대사를 쓰지 않고 씬이 직접 처리
                if (gameScene.currentStage === 3) {
                    gameScene.events.emit('quizComplete');
                } else {
                    gameScene.events.emit('completeMission');
                    gameScene.events.emit('showDialogue', "모든 테스트를 통과했어! 정말 대단해. \n이제 학교는 안전해.", "미션 클리어!");
                }
            } else {
                gameScene.events.emit('showDialogue', "체력이 모두 소진되어 실패했어...\n다시 도전해보자.", "게임 오버");
            }
        }

        closeQuiz();
    };

    return (
        <motion.div
            className="modal-overlay quiz-modal"
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-45%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-45%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
            <h2 className="modal-title">안전 퀴즈</h2>
            <div style={{ position: 'absolute', top: '25px', right: '25px', color: '#ffd700', fontSize: '18px' }}>
                {currentIndex + 1} / {quiz.data.length}
            </div>

            <motion.div
                id="quiz-content"
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                <div className="quiz-question">
                    {currentQuiz.question}
                </div>

                <div className="quiz-options">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {currentQuiz.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={`quiz-btn ${selectedOption === idx ? 'focused' : ''} ${feedback && idx === currentQuiz.answerIndex ? 'correct-border' : ''}`}
                                onClick={() => handleAnswer(idx)}
                                onMouseEnter={() => !feedback && setSelectedOption(idx)}
                                disabled={!!feedback}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`quiz-feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '28px', color: '#ffd700' }}>
                                {feedback.isCorrect ? ' 정 답 ' : '!! 오 답 !!'}
                            </div>
                            <div style={{ fontSize: '20px' }}>{feedback.message}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default QuizModal;
