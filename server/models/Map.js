const mongoose = require('mongoose');

const MapSchema = new mongoose.Schema({
    mapId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String, // Teacher's userId
        required: true
    },
    // The entire Tiled JSON structure
    content: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Map', MapSchema);
