import React, { useState, useEffect, useRef } from 'react';
import useGameStore from '../../store/useGameStore';
import { motion } from 'framer-motion';

const Dialogue = () => {
    const dialogue = useGameStore((state) => state.dialogue);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const isTypingRef = useRef(isTyping);

    useEffect(() => {
        isTypingRef.current = isTyping;
    }, [isTyping]);

    const timerRef = useRef(null);

    // Typing effect logic
    useEffect(() => {
        if (!dialogue.isOpen) {
            setDisplayedText('');
            setIsTyping(false);
            return;
        }

        setDisplayedText('');
        setIsTyping(true);
        const fullText = dialogue.text || '';
        let currentIndex = 0;

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            currentIndex++;
            if (currentIndex <= fullText.length) {
                setDisplayedText(fullText.substring(0, currentIndex));
            } else {
                setIsTyping(false);
                if (timerRef.current) clearInterval(timerRef.current);
            }
        }, 35);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [dialogue.text, dialogue.isOpen]);

    const handleAdvance = () => {
        if (isTypingRef.current) {
            if (timerRef.current) clearInterval(timerRef.current);
            setDisplayedText(dialogue.text);
            setIsTyping(false);
        } else {
            const uiScene = window.game?.scene?.getScene('UI_Scene');
            if (uiScene) {
                uiScene.events.emit('dialogueEnded');
            }
        }
    };

    useEffect(() => {
        const uiScene = window.game?.scene?.getScene('UI_Scene');
        if (uiScene) {
            uiScene.events.on('advanceDialogue', handleAdvance);
            return () => uiScene.events.off('advanceDialogue', handleAdvance);
        }
    }, [dialogue.text]);

    if (!dialogue.isOpen) return null;

    return (
        <motion.div
            className="react-dialogue-box"
            onClick={handleAdvance}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
            {dialogue.name && <div className="dialogue-name">{dialogue.name}</div>}
            <div className="dialogue-text">
                {displayedText}
                {isTyping && <span className="typing-cursor">|</span>}
            </div>
            {!isTyping && <div className="dialogue-hint">스페이스바 혹은 A 버튼을 눌러 넘기기</div>}
            {isTyping && <div className="dialogue-hint skip">클릭하여 스킵</div>}
        </motion.div>
    );
};

export default Dialogue;
