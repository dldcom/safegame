const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- MongoDB Connection ---
const DB_NAME = 'safegame';
const MONGO_URI = process.env.MONGO_URI || `mongodb://admin:safe1234@database:27017/${DB_NAME}?authSource=admin`;

mongoose.connect(MONGO_URI, { family: 4 }) // IPv4 강제 설정으로 윈도우 지연 방지
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('DB Connection Error:', err));
// --------------------------

const app = express();
app.use(cors()); // CORS 허용 추가
app.use(express.json({ limit: '50mb' })); // 용량 제한 상향 (AI 맵 이미지 대응)
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// [확인용 로거 제거됨]
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true,
    pingTimeout: 10000,
    pingInterval: 5000,
    connectTimeout: 5000
});

// --- Routes ---
const authRoutes = require('./routes/auth');
const mapRoutes = require('./routes/map');
const studentRoutes = require('./routes/student');
const shopRoutes = require('./routes/shop');
const characterRoutes = require('./routes/character');
const npcRoutes = require('./routes/npc');
app.use('/api/auth', authRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/npc', npcRoutes);

// Serve static files from the dist folder in production
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // 업로드 이미지 접근 허용

// Game State
const players = {}; // [Key: username] - 세션 유지를 위해 유저 이름 사용
const socketToUser = {}; // [Key: socket.id] -> username 매핑용
const rooms = {};

io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // --- [Lobby Logic] ---
    // 1. 방 목록 보내주기
    socket.on('getRooms', () => {
        socket.emit('roomsUpdated', Object.values(rooms));
    });

    // 2. 방 만들기
    socket.on('createRoom', (roomData) => {
        const roomId = `room_${Date.now()}`;
        const newRoom = {
            id: roomId,
            title: roomData.title,
            hostId: socket.id,
            hostName: roomData.hostName,
            maxPlayers: roomData.maxPlayers,
            stageId: roomData.stageId,
            players: [{
                id: socket.id,
                name: roomData.hostName,
                isReady: false,
                role: 'host',
                skin: roomData.skin,
                titleName: roomData.titleName,
                customCharacter: roomData.customCharacter || null
            }],
            status: 'waiting'
        };
        rooms[roomId] = newRoom;
        socket.join(roomId); // 소켓을 방 전용 채널에 입장시킴

        console.log(`[Room] Room created: ${roomId} by ${roomData.hostName}`);
        io.emit('roomsUpdated', Object.values(rooms)); // 모든 대기자에게 새 목록 알림
        socket.emit('roomJoined', newRoom); // 방 만든 사람에게 입장 확인 전송
    });

    // 3. 방 참가하기
    socket.on('joinRoom', (roomId, userData) => {
        const room = rooms[roomId];
        if (room && room.players.length < room.maxPlayers) {
            room.players.push({
                id: socket.id,
                name: userData.username,
                isReady: false,
                role: 'member',
                skin: userData.skin,
                titleName: userData.titleName,
                customCharacter: userData.customCharacter || null,
                level: userData.level || 1,
                itemCollection: userData.itemCollection || [],
                clearedStages: userData.clearedStages || []
            });
            socket.join(roomId);

            console.log(`[Room] Player ${userData.username} joined ${roomId}`);
            io.to(roomId).emit('roomJoined', room); // 방 안에 있는 사람들에게만 업데이트 알림
            io.emit('roomsUpdated', Object.values(rooms)); // 대기실 목록 인원수 업데이트
        }
    });

    // 4. 방 나가기
    socket.on('leaveRoom', (roomId) => {
        handlePlayerLeave(socket, roomId);
    });

    // 5. 레디 상태변경 [NEW]
    socket.on('playerReady', (roomId) => {
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.isReady = !player.isReady;
            console.log(`[Room] Player ${player.name} in ${roomId} ready: ${player.isReady}`);

            // 방 안의 모든 사람에게 업데이트된 방 정보 전송
            io.to(roomId).emit('roomJoined', room);
        }
    });

    // 6. 게임 시작 [NEW]
    socket.on('startGame', (roomId) => {
        const room = rooms[roomId];
        if (!room) return;

        // 방장만 시작할 수 있음
        if (room.hostId !== socket.id) return;

        // 모든 인원이 레디했는지 확인 (방장 제외 혹은 포함 - 보통 방장은 자동 레디 혹은 시작버튼으로 취급)
        const allReady = room.players.every(p => p.role === 'host' || p.isReady);

        if (allReady) {
            room.status = 'playing';
            console.log(`[Room] Game starting in ${roomId}`);
            io.to(roomId).emit('startGame', {
                stageId: room.stageId,
                roomId: roomId
            });
        }
    });

    // 7. 대기실 채팅 및 감정표현 [NEW]
    socket.on('sendChatMessage', (data) => {
        const { roomId, message, senderName } = data;
        console.log(`[Chat] ${senderName} in ${roomId}: ${message}`);
        io.to(roomId).emit('chatMessageReceived', {
            senderId: socket.id,
            senderName,
            message,
            timestamp: Date.now()
        });
    });

    socket.on('sendEmote', (data) => {
        const { roomId, emoteId, senderName } = data;
        io.to(roomId).emit('emoteReceived', {
            senderId: socket.id,
            senderName,
            emoteId
        });
    });

    const handlePlayerLeave = (targetSocket, roomId) => {
        const room = rooms[roomId];
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.id === targetSocket.id);
        if (playerIndex !== -1) {
            const wasHost = room.players[playerIndex].role === 'host';
            room.players.splice(playerIndex, 1);
            targetSocket.leave(roomId);

            console.log(`[Room] Player ${targetSocket.id} left room ${roomId}`);

            if (room.players.length === 0) {
                delete rooms[roomId];
                console.log(`[Room] Room ${roomId} deleted (Empty)`);
            } else {
                if (wasHost) {
                    room.players[0].role = 'host';
                    room.hostId = room.players[0].id;
                    room.hostName = room.players[0].name;
                    console.log(`[Room] Host migrated in ${roomId} to ${room.hostName}`);
                }
                // 방에 남은 사람들에게 업데이트 알림
                io.to(roomId).emit('roomJoined', room);
            }
            // 모든 대기자에게 목록 업데이트 알림
            io.emit('roomsUpdated', Object.values(rooms));
        }
    };

    // ----------------------
    // [수정] 소켓 연결 시 즉시 플레이어를 생성하던 코드를 제거했습니다.
    // 이제 플레이어는 'joinGame' 이벤트를 통해 명시적으로 게임에 진입할 때만 생성됩니다.

    socket.on('joinLobby', () => {
        console.log(`[Socket] Player ${socket.id} joined lobby.`);
        // 로비에서는 전체 플레이어 목록이 아닌 필요한 정보만 송수신하도록 추후 최적화 가능
    });

    socket.on('disconnect', (reason) => {
        const username = socketToUser[socket.id];
        console.log(`[Socket] User disconnected: ${socket.id} (User: ${username}, Reason: ${reason})`);

        // 방 청소 로직
        Object.keys(rooms).forEach(roomId => {
            handlePlayerLeave(socket, roomId);
        });

        delete socketToUser[socket.id];
        // players[username]은 세션 복구를 위해 일단 유지 (서버 재시작 전까지)

        io.emit('playerDisconnected', socket.id);
    });

    // 기존의 글로벌 레디 로직은 제거하거나 유지 (여기서는 방 단위 로직으로 대체되었으므로 제거 권장)
    // socket.on('playerReady', () => { ... });

    socket.on('joinGame', (data) => {
        const { roomId, username, skin, titleName, customCharacter } = data;
        if (!roomId || !username) return;

        const cleanName = username.trim();
        console.log(`>>> [joinGame] User: ${cleanName}, Socket: ${socket.id}, Room: ${roomId}, Skin: ${skin}, Title: ${titleName}`);

        let room = rooms[roomId];
        if (!room) {
            console.warn(`>>> [joinGame] Room ${roomId} missing. AUTO-RESTORING...`);
            rooms[roomId] = { id: roomId, status: 'playing', players: [] };
            room = rooms[roomId];
        }

        socket.join(roomId);
        socket.roomId = roomId;
        socketToUser[socket.id] = cleanName; // 매핑 저장

        // 1. 플레이어 데이터 생성 또는 업데이트
        if (!players[cleanName]) {
            // 무작위 색상 할당 (너무 밝지 않은 색상 위주)
            const randomColor = Math.floor(Math.random() * 16777215);
            players[cleanName] = {
                username: cleanName,
                x: 400,
                y: 300,
                playerId: socket.id,
                roomId: roomId,
                color: randomColor,
                skin: skin || 'skin_default',
                titleName: titleName || '',
                customCharacter: customCharacter || null
            };
        } else {
            // 이미 존재한다면 소켓 ID만 최신화 (세션 복구)
            players[cleanName].playerId = socket.id;
            players[cleanName].roomId = roomId;
            players[cleanName].skin = skin || players[cleanName].skin || 'skin_default';
            players[cleanName].titleName = titleName || players[cleanName].titleName || '';
            players[cleanName].customCharacter = customCharacter || players[cleanName].customCharacter || null;
        }

        // 2. 방 플레이어 명단 업데이트
        let roomPlayer = room.players.find(p => p.name === cleanName);
        if (roomPlayer) {
            roomPlayer.id = socket.id;
        } else {
            room.players.push({
                id: socket.id,
                name: cleanName,
                isReady: true,
                role: 'member',
                score: 0,
                time: 0,
                finished: false
            });
        }

        // 3. 현재 방의 정보 수집 및 전송 [핵심 수정: 방 명단을 기준으로 수집하여 고스트 방지]
        const playersInRoom = {};
        room.players.forEach(rp => {
            const pData = players[rp.name];
            if (pData) {
                // 클라이언트는 소켓 ID를 키로 기대하므로 방에 저장된 최신 ID 사용
                playersInRoom[rp.id] = { ...pData, playerId: rp.id };
            }
        });

        console.log(`>>> [joinGame] Initializing player ${cleanName} with ID ${socket.id}. Room count: ${room.players.length}`);
        // [핵심] 본인에게만 직접 "너는 이 데이터로 시작해"라고 알려줌
        socket.emit('initPlayer', players[cleanName]);

        // 전체 목록도 함께 전송
        socket.emit('currentPlayers', playersInRoom);
        socket.to(roomId).emit('newPlayer', players[cleanName]);
    });

    // Handle player movement
    socket.on('playerMovement', (movementData) => {
        const username = socketToUser[socket.id];
        if (players[username]) {
            players[username].x = movementData.x;
            players[username].y = movementData.y;
            players[username].flipX = movementData.flipX;
            players[username].vx = movementData.vx;
            players[username].vy = movementData.vy;
            socket.to(players[username].roomId).emit('playerMoved', {
                playerId: socket.id,
                x: players[username].x,
                y: players[username].y,
                flipX: players[username].flipX,
                vx: players[username].vx,
                vy: players[username].vy
            });
        }
    });

    // [결과 시스템] 게임 완료 시 점수 기록 및 랭킹 브로드캐스트
    socket.on('gameComplete', (data) => {
        const { roomId, score, time } = data;
        const username = socketToUser[socket.id];
        if (!roomId || !username) return;

        const room = rooms[roomId];
        if (room) {
            // 방 플레이어 데이터에 점수와 시간 업데이트
            const p = room.players.find(p => p.name === username);
            if (p) {
                p.score = score;
                p.time = time;
                p.finished = true;
            }

            // 실시간 랭킹 계산
            const rankings = room.players
                .filter(p => p.finished)
                .sort((a, b) => b.score - a.score || a.time - b.time)
                .map(p => ({
                    username: p.name,
                    score: p.score,
                    time: p.time
                }));

            io.to(roomId).emit('gameResultsUpdated', rankings);
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
