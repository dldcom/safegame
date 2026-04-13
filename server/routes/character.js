const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');

// 이미지 저장 경로 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/characters');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'char-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB 제한
});

// 캐릭터 저장 API
router.post('/upload', upload.single('characterImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '이미지 파일이 없습니다.' });
        }

        const { name, atlasData } = req.body;

        const newCharacter = await prisma.character.create({
            data: {
                name: name || '무명 캐릭터',
                imagePath: `/uploads/characters/${req.file.filename}`,
                atlasData: typeof atlasData === 'string' ? JSON.parse(atlasData) : atlasData
            }
        });

        res.status(201).json({
            message: '캐릭터가 성공적으로 저장되었습니다.',
            character: newCharacter
        });
    } catch (error) {
        console.error('Character Upload Error Detail:', error);
        res.status(500).json({
            message: '서버 오류가 발생했습니다.',
            error: error.message,
            stack: error.stack
        });
    }
});

// 캐릭터 변경 API (1000 포인트 소모)
router.post('/change-skin', async (req, res) => {
    try {
        const { userId, characterId } = req.body;
        const id = parseInt(userId);
        const charId = parseInt(characterId);
        const COST = 1000;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

        if (user.points < COST) {
            return res.status(400).json({ message: '포인트가 부족합니다. (1,000P 필요)' });
        }

        // 포인트 차감 및 캐릭터 변경
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                points: { decrement: COST },
                customCharacterId: charId
            },
            include: { customCharacter: true }
        });

        res.json({
            message: '캐릭터가 변경되었습니다!',
            user: {
                points: updatedUser.points,
                customCharacter: updatedUser.customCharacter,
                exp: updatedUser.exp,
                level: updatedUser.level,
                totalExp: updatedUser.totalExp,
                clearedStages: updatedUser.clearedStages,
                quizProgress: updatedUser.quizProgress
            }
        });
    } catch (error) {
        console.error('Change Skin Error:', error);
        res.status(500).json({ message: '캐릭터 변경 중 오류가 발생했습니다.' });
    }
});

// 모든 캐릭터 목록 조회 (회원가입 및 변경 시 사용)
router.get('/list', async (req, res) => {
    try {
        const characters = await prisma.character.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(characters);
    } catch (error) {
        console.error('Character List Fetch Error:', error);
        res.status(500).json({ message: '캐릭터 목록을 불러오는데 실패했습니다.' });
    }
});

module.exports = router;
