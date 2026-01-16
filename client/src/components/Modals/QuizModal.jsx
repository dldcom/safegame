import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';

const QuizModal = () => {
    const { quiz, closeQuiz, setHearts } = useGameStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, message: string }
    const [canInput, setCanInput] = useState(false);

    // Initial input cooldown to prevent accidental clicks
    useEffect(() => {
        if (quiz.isOpen) {
            const timer = setTimeout(() => setCanInput(true), 500);
            return () => clearTimeout(timer);
        }
    }, [quiz.isOpen]);

    // Keyboard Navigation
    useEffect(() => {
        if (!quiz.isOpen || !canInput || feedback) return;

        const handleKeyDown = (e) => {
            const currentQuiz = quiz.data[currentIndex];
            if (!currentQuiz) return;

            if (e.key >= '1' && e.key <= currentQuiz.options.length.toString()) {
                handleAnswer(parseInt(e.key) - 1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                setSelectedOption(prev => prev === null ? 0 : Math.max(0, prev - 1));
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                setSelectedOption(prev => prev === null ? 0 : Math.min(currentQuiz.options.length - 1, prev + 1));
            } else if ((e.key === 'Enter' || e.key === ' ') && selectedOption !== null) {
                handleAnswer(selectedOption);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [quiz.isOpen, canInput, currentIndex, selectedOption, feedback]);

    if (!quiz.isOpen || !quiz.data) return null;

    const currentQuiz = quiz.data[currentIndex];

    const handleAnswer = (index) => {
        if (feedback) return; // Prevent double answering

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
            const explanation = currentQuiz.explanation || "틀렸습니다. 다시 생각해보세요.";
            setFeedback({
                isCorrect: false,
                message: `오답입니다! 😢\n${explanation}`
            });

            // Deduct heart
            const gameScene = window.game?.scene?.getScene('GameScene');
            if (gameScene) {
                gameScene.hearts--;
                setHearts(gameScene.hearts);
                if (gameScene.hearts <= 0) {
                    setTimeout(() => finishQuiz(false), 2000);
                }
            }
        }
    };

    const finishQuiz = (isSuccess) => {
        const gameScene = window.game?.scene?.getScene('GameScene');
        if (gameScene) {
            gameScene.isUIOpen = false;
            if (isSuccess) {
                gameScene.events.emit('completeMission');
                gameScene.events.emit('showDialogue', "모든 테스트를 통과했어! 정말 대단해. \n이제 학교는 안전해.", "미션 클리어!");
            } else {
                gameScene.events.emit('showDialogue', "체력이 모두 소진되어 실패했어...\n다시 도전해보자.", "게임 오버");
            }
        }

        // Reset local state for next time
        setCurrentIndex(0);
        setSelectedOption(null);
        setFeedback(null);
        closeQuiz();
    };

    const handleRetry = () => {
        setFeedback(null);
        setSelectedOption(null);
    };

    return (
        <div className="modal-overlay quiz-modal">
            <h2 className="modal-title">안전 퀴즈</h2>

            <div id="quiz-content">
                <div className="quiz-question">
                    Q{currentIndex + 1}. {currentQuiz.question}
                </div>

                <div className="quiz-options">
                    {currentQuiz.options.map((opt, idx) => (
                        <button
                            key={idx}
                            className={`quiz-btn ${selectedOption === idx ? 'focused' : ''} ${feedback && idx === currentQuiz.answerIndex ? 'correct-border' : ''}`}
                            onClick={() => handleAnswer(idx)}
                            onMouseEnter={() => !feedback && setSelectedOption(idx)}
                            disabled={!!feedback}
                        >
                            ({idx + 1}) {opt}
                        </button>
                    ))}
                </div>

                {feedback && (
                    <div className={`quiz-feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
                        {feedback.message.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                        {!feedback.isCorrect && useGameStore.getState().hearts > 0 && (
                            <button className="close-btn" style={{ marginTop: '10px' }} onClick={handleRetry}>다시 풀기</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizModal;
