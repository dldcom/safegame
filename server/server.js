const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// --- MongoDB Connection ---
const DB_NAME = 'safegame';
const MONGO_URI = process.env.MONGO_URI || `mongodb://admin:safe1234@database:27017/${DB_NAME}?authSource=admin`;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('DB Connection Error:', err));
// --------------------------

const app = express();
app.use(express.json()); // JSON 본문을 읽기 위한 미들웨어

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
app.use('/api/auth', authRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/student', studentRoutes);

// Serve static files from the dist folder in production
app.use(express.static(path.join(__dirname, '../dist')));

// Game State
const players = {};

io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // Initialize player data
    players[socket.id] = {
        x: 400,
        y: 300,
        playerId: socket.id,
        username: `용사 ${socket.id.substring(0, 4)}`,
        color: Math.floor(Math.random() * 0xffffff),
        isReady: false
    };

    // Immediate send current state
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('joinLobby', () => {
        console.log(`[Socket] Player ${socket.id} joined lobby.`);
        socket.emit('currentPlayers', players);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[Socket] User disconnected: ${socket.id} (Reason: ${reason})`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });

    // Handle player ready
    socket.on('playerReady', () => {
        if (players[socket.id]) {
            players[socket.id].isReady = !players[socket.id].isReady;
            console.log(`[Socket] Player ${socket.id} ready state: ${players[socket.id].isReady}`);
            io.emit('playerUpdate', players[socket.id]);

            const playerList = Object.values(players);
            const allReady = playerList.length > 0 && playerList.every(p => p.isReady);
            if (allReady) {
                console.log(`[Socket] All players ready! Starting game...`);
                io.emit('startGame');
            }
        }
    });

    socket.on('joinGame', () => {
        socket.emit('currentPlayers', players);
    });

    // Handle player movement
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].flipX = movementData.flipX;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
