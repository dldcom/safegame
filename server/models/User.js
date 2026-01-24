const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher'],
        default: 'student'
    },
    // Character and Gameplay Data
    characterSkin: {
        type: String,
        default: 'character_default'
    },
    gold: {
        type: Number,
        default: 0
    },
    inventory: [
        {
            itemId: String,
            name: String,
            type: String,
            equipped: { type: Boolean, default: false }
        }
    ],
    progress: [
        {
            stageNum: Number,
            isCleared: { type: Boolean, default: false },
            topScore: { type: Number, default: 0 },
            updatedAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
