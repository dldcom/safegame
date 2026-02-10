const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 상점 아이템 리스트 (정적 데이터로 우선 관리)
const SHOP_ITEMS = [
    { id: 'skin_fire', name: '불꽃 소방관', category: 'skin', price: 1000, description: '열정적인 붉은색 수트' },
    { id: 'skin_water', name: '해양 구조대', category: 'skin', price: 1000, description: '시원한 푸른색 제복' },
    { id: 'skin_gold', name: '황금 가디언', category: 'skin', price: 5000, description: '전설적인 황금빛 갑옷' },
    { id: 'title_beginner', name: '꿈나무 구조대', category: 'title', price: 0, description: '기본 칭호' },
    { id: 'title_expert', name: '안전 전문가', category: 'title', price: 1500, description: '베테랑의 자존심' },
    { id: 'title_grandmaster', name: '세이프 마스터', category: 'title', price: 10000, description: '최고의 안전 영웅' }
];

// 아이템 목록 조회
router.get('/items', (req, res) => {
    res.json(SHOP_ITEMS);
});

// 아이템 구매
router.post('/buy', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return res.status(404).json({ message: '존재하지 않는 아이템입니다.' });

        // 이미 소유했는지 확인
        const alreadyOwned = user.inventory.some(i => i.itemId === itemId);
        if (alreadyOwned) return res.status(400).json({ message: '이미 소유한 아이템입니다.' });

        // 포인트 확인
        if (user.points < item.price) {
            return res.status(400).json({ message: '포인트가 부족합니다.' });
        }

        // 구매 처리
        user.points -= item.price;
        user.inventory.push({
            itemId: item.id,
            name: item.name,
            category: item.category
        });

        await user.save();
        res.json({ message: '구매 완료!', user });
    } catch (err) {
        console.error('Buy Item Error:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 아이템 장착
router.post('/equip', async (req, res) => {
    try {
        const { userId, itemId, category } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        // 인벤토리에 있는지 확인
        const hasItem = user.inventory.some(i => i.itemId === itemId);
        if (!hasItem) return res.status(400).json({ message: '소유하지 않은 아이템입니다.' });

        if (category === 'skin') {
            user.equippedSkin = itemId;
        } else if (category === 'title') {
            const item = user.inventory.find(i => i.itemId === itemId);
            user.equippedTitle = item.name;
        }

        await user.save();
        res.json({ message: '장착 완료!', user });
    } catch (err) {
        console.error('Equip Item Error:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
