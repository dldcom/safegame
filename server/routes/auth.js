const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// [POST] 회원가입
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, customCharacterId } = req.body;
        console.log('Register attempt:', { username, role, customCharacterId });

        // 이미 존재하는 유저인지 확인
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

        user = new User({
            username,
            password,
            role,
            customCharacterId: customCharacterId || null
        });
        await user.save();

        res.status(201).json({ message: '회원가입 성공!' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: '서버 오류', error: err.message });
    }
});

// [POST] 로그인
router.post('/login', async (req, res) => {
    const start = Date.now();
    try {
        const { username, password } = req.body;
        console.log(`>>> [Login Start] User: ${username}`);

        const dbStart = Date.now();
        const user = await User.findOne({ username }).populate('customCharacterId');
        console.log(`>>> [Step 1] DB FindOne: ${Date.now() - dbStart}ms`);

        if (!user) {
            return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 2. 비밀번호 비교 (Bcrypt 연산 시간 측정)
        const bcryptStart = Date.now();
        const isMatch = await user.comparePassword(password);
        console.log(`>>> [Step 2] Bcrypt Compare: ${Date.now() - bcryptStart}ms`);

        if (!isMatch) {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // 3. JWT 토큰 발급
        const tokenStart = Date.now();
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'safe_secret_key',
            { expiresIn: '1d' }
        );
        console.log(`>>> [Step 3] Token Sign: ${Date.now() - tokenStart}ms`);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                points: user.points || 0,
                exp: user.exp || 0,
                totalExp: user.totalExp || 0,
                level: user.level || 1,
                itemCollection: user.itemCollection || [],
                clearedStages: user.clearedStages || [],
                quizProgress: user.quizProgress || 0,
                customCharacter: user.customCharacterId // populated data
            }
        });

        console.log(`>>> [Login Total] ${Date.now() - start}ms`);

    } catch (err) {
        console.error('>>> [Login ERROR]:', err);
        res.status(500).json({
            message: '서버 오류',
            error: err.message
        });
    }
});

module.exports = router;
