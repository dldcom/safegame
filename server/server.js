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
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

// Serve static files from the dist folder in production
app.use(express.static(path.join(__dirname, '../dist')));

// Game State
const players = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Initialize player
    players[socket.id] = {
        x: 400,
        y: 300,
        playerId: socket.id,
        color: Math.random() * 0xffffff,
        isReady: false
    };

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Broadcast new player to others
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });

    // Handle player ready
    socket.on('playerReady', () => {
        if (players[socket.id]) {
            players[socket.id].isReady = !players[socket.id].isReady;
            io.emit('playerUpdate', players[socket.id]);

            const allReady = Object.values(players).every(p => p.isReady);
            if (Object.keys(players).length > 0 && allReady) {
                io.emit('startGame');
            }
        }
    });

    socket.on('joinGame', () => {
        socket.emit('currentPlayers', players);
    });

    // Handle player movement
    socket.on('playerMovement', (movementData) => {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].flipX = movementData.flipX;

        // Emit to other players
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
