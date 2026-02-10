const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Npc = require('../models/Npc');

// 이미지 저장 경로 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/npcs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'npc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB 제한
});

// NPC 저장 API
router.post('/upload', upload.single('npcImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '이미지 파일이 없습니다.' });
        }

        const { name, atlasData } = req.body;

        // 데이터베이스에 NPC 정보 저장
        const newNpc = new Npc({
            name: name || '무명 NPC',
            imagePath: `/uploads/npcs/${req.file.filename}`,
            atlasData: typeof atlasData === 'string' ? JSON.parse(atlasData) : atlasData
        });

        await newNpc.save();

        res.status(201).json({
            message: 'NPC가 성공적으로 저장되었습니다.',
            npc: newNpc
        });
    } catch (error) {
        console.error('NPC Upload Error:', error);
        res.status(500).json({
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 모든 NPC 목록 조회
router.get('/list', async (req, res) => {
    try {
        const npcs = await Npc.find().sort({ createdAt: -1 });
        res.json(npcs);
    } catch (error) {
        console.error('NPC List Fetch Error:', error);
        res.status(500).json({ message: 'NPC 목록을 불러오는데 실패했습니다.' });
    }
});

// 특정 NPC 조회
router.get('/:name', async (req, res) => {
    try {
        const npc = await Npc.findOne({ name: req.params.name });
        if (!npc) return res.status(404).json({ message: 'NPC를 찾을 수 없습니다.' });
        res.json(npc);
    } catch (error) {
        res.status(500).json({ message: '데이터 조회 오류' });
    }
});

module.exports = router;
