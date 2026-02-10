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
    customCharacterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
    gold: { type: Number, default: 0 },
    inventory: [
        {
            itemId: String,
            name: String,
            category: String,
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
    // 게이미피케이션 필드 강화
    points: { type: Number, default: 0 }, // 아이템 구매용 재화
    exp: { type: Number, default: 0 },
    totalExp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    equippedSkin: { type: String, default: 'skin_default' }, // 현재 장착 스킨
    equippedTitle: { type: String, default: '초보 구조대' },   // 현재 장착 칭호
    itemCollection: [{ type: String }], // 획득한 아이템 ID (예: 'extinguisher')
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
