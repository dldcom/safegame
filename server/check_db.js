const mongoose = require('mongoose');
const Map = require('./models/Map');

const DB_NAME = 'safegame';
// server.js uses 'database' but locally it's often localhost or 127.0.0.1
const MONGO_URI = 'mongodb://admin:safe1234@127.0.0.1:27017/' + DB_NAME + '?authSource=admin';

async function checkMaps() {
    console.log('Connecting to:', MONGO_URI);
    try {
        await mongoose.connect(MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 2000 // 2 seconds timeout
        });
        console.log('Connected to DB');
        const maps = await Map.find({}, { mapId: 1, title: 1, author: 1, createdAt: 1 });
        console.log('--- Current Maps ---');
        maps.forEach(m => {
            console.log(`[${m.mapId}] Title: ${m.title} | Author: ${m.author}`);
        });
        if (maps.length === 0) console.log('No maps found.');
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

checkMaps();
