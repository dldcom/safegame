const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    // ... 기존 필드 유지
    characterSkin: { type: String, default: 'character_default' },
    gold: { type: Number, default: 0 },
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
    // 게이미피케이션 필드 추가
    exp: { type: Number, default: 0 },
    totalExp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    collection: [{ type: String }], // 획득한 아이템 ID (예: 'extinguisher')
    clearedStages: [{ type: Number }], // 클리어한 스테이지 번호
    quizProgress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// 저장 전 비밀번호 암호화
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 비밀번호 비교 메소드
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
