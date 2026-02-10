import { io } from 'socket.io-client';

// 싱글톤 패턴: 애플리케이션 전체에서 단 하나의 소켓 연결만 유지합니다.
let socket;

export const getSocket = () => {
    if (!socket) {
        socket = io({
            reconnectionAttempts: 5,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected with ID:', socket.id);
        });
    }
    return socket;
};
