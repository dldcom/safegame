const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 경험치 업데이트 및 레벨업 로직
router.post('/update-exp', async (req, res) => {
    try {
        const { userId, expToAdd, pointsToAdd, stageCleared, quizProgress } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        if (expToAdd) {
            user.exp += expToAdd;
            user.totalExp += expToAdd;

            // 레벨업 계산: 다음 레벨 필요 경험치 = 현재 레벨 * 100
            while (user.exp >= user.level * 100) {
                user.exp -= user.level * 100;
                user.level += 1;
                user.points += 100; // 레벨업 보너스 포인트!
            }
        }

        if (pointsToAdd) {
            user.points += pointsToAdd;
        }

        // 스테이지 클리어 정보 기록
        if (stageCleared && !user.clearedStages.includes(stageCleared)) {
            user.clearedStages.push(stageCleared);
            user.points += 500; // 스테이지 최초 클리어 보너스
        }

        // 퀴즈 진행도 기록
        if (typeof quizProgress === 'number') {
            user.quizProgress = quizProgress;
        }

        await user.save();
        res.json({
            message: '업데이트 완료',
            user: {
                points: user.points,
                exp: user.exp,
                totalExp: user.totalExp,
                level: user.level,
                clearedStages: user.clearedStages,
                quizProgress: user.quizProgress,
                equippedSkin: user.equippedSkin,
                equippedTitle: user.equippedTitle
            }
        });
    } catch (err) {
        console.error('Update EXP Error:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 리더보드 조회 (상위 10명)
router.get('/leaderboard', async (req, res) => {
    try {
        const topStudents = await User.find({ role: 'student' })
            .sort({ totalExp: -1 })
            .limit(10)
            .select('username level totalExp');

        res.json(topStudents);
    } catch (err) {
        console.error('Leaderboard Error:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 도감 추가
router.post('/add-collection', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        if (!user.collection.includes(itemId)) {
            user.collection.push(itemId);
            await user.save();
        }

        res.json({ message: '도감 추가 완료', collection: user.collection });
    } catch (err) {
        console.error('Add Collection Error:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
