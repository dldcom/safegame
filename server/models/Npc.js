const mongoose = require('mongoose');

const NpcSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    imagePath: {
        type: String, // 서버의 public 폴더 내 이미지 경로 (e.g., /uploads/npcs/...)
        required: true
    },
    atlasData: {
        type: Object, // legLimit, frames 등 JSON 데이터
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Npc', NpcSchema);
