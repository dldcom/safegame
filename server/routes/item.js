const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/items');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'item-' + uniqueSuffix + '.png');
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// 아이템 스프라이트 업로드
router.post('/upload', upload.single('itemImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '이미지 파일이 없습니다.' });
        }

        const { itemId, name, category, stageNum } = req.body;

        const newItem = await prisma.item.create({
            data: {
                itemId: itemId || `item_${Date.now()}`,
                name: name || '무명 아이템',
                category: category || 'etc',
                imagePath: `/uploads/items/${req.file.filename}`,
                stageNum: parseInt(stageNum) || 1
            }
        });

        res.status(201).json({
            message: '아이템이 저장되었습니다.',
            item: newItem
        });
    } catch (error) {
        console.error('Item Upload Error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

// 아이템 목록 조회
router.get('/list', async (req, res) => {
    try {
        const { stageNum } = req.query;
        const where = stageNum ? { stageNum: parseInt(stageNum) } : {};

        const items = await prisma.item.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    } catch (error) {
        console.error('Item List Error:', error);
        res.status(500).json({ message: '아이템 목록을 불러오는데 실패했습니다.' });
    }
});

// 아이템 삭제
router.delete('/:id', async (req, res) => {
    try {
        const item = await prisma.item.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!item) return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });

        // 파일 삭제
        const filePath = path.join(__dirname, '../public', item.imagePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await prisma.item.delete({ where: { id: item.id } });
        res.json({ message: '아이템이 삭제되었습니다.' });
    } catch (error) {
        console.error('Item Delete Error:', error);
        res.status(500).json({ message: '삭제 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
