import React from 'react';
import useGameStore from '../../store/useGameStore';

const Hearts = () => {
    // 성능 최적화: hearts 데이터에만 빨대 꽂기
    const hearts = useGameStore((state) => state.hearts);
    const maxHearts = 3;

    return (
        <div className="hud-hearts">
            {Array.from({ length: maxHearts }).map((_, i) => (
                <span key={i} style={{ fontSize: '30px', filter: i >= hearts ? 'grayscale(100%) opacity(0.5)' : 'none' }}>
                    {i < hearts ? '❤️' : '💔'}
                </span>
            ))}
        </div>
    );
};

export default Hearts;
