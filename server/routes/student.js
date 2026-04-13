const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// 경험치 업데이트 및 레벨업 로직
router.post('/update-exp', async (req, res) => {
    try {
        const { userId, expToAdd, pointsToAdd, stageCleared, quizProgress } = req.body;
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        let exp = user.exp;
        let totalExp = user.totalExp;
        let level = user.level;
        let points = user.points;
        let clearedStages = [...user.clearedStages];
        let newQuizProgress = user.quizProgress;

        if (expToAdd) {
            exp += expToAdd;
            totalExp += expToAdd;

            // 레벨업 계산: 다음 레벨 필요 경험치 = 현재 레벨 * 100
            while (exp >= level * 100) {
                exp -= level * 100;
                level += 1;
                points += 100; // 레벨업 보너스 포인트!
            }
        }

        if (pointsToAdd) {
            points += pointsToAdd;
        }

        // 스테이지 클리어 정보 기록
        if (stageCleared && !clearedStages.includes(stageCleared)) {
            clearedStages.push(stageCleared);
            points += 500; // 스테이지 최초 클리어 보너스
        }

        // 퀴즈 진행도 기록
        if (typeof quizProgress === 'number') {
            newQuizProgress = quizProgress;
        }

        const updated = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                exp,
                totalExp,
                level,
                points,
                clearedStages,
                quizProgress: newQuizProgress
            }
        });

        res.json({
            message: '업데이트 완료',
            user: {
                points: updated.points,
                exp: updated.exp,
                totalExp: updated.totalExp,
                level: updated.level,
                clearedStages: updated.clearedStages,
                quizProgress: updated.quizProgress,
                equippedSkin: updated.equippedSkin,
                equippedTitle: updated.equippedTitle
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
        const topStudents = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            orderBy: { totalExp: 'desc' },
            take: 10,
            select: { username: true, level: true, totalExp: true }
        });

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
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        if (!user.itemCollection.includes(itemId)) {
            const updated = await prisma.user.update({
                where: { id: parseInt(userId) },
                data: {
                    itemCollection: { push: itemId }
                }
            });
            return res.json({ message: '도감 추가 완료', collection: updated.itemCollection });
        }

        res.json({ message: '도감 추가 완료', collection: user.itemCollection });
    } catch (err) {
        console.error('Add Collection Error:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
