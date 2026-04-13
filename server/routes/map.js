const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Save or Update Map
router.post('/save', async (req, res) => {
    try {
        const { mapId, title, author, content } = req.body;

        const map = await prisma.map.upsert({
            where: { mapId },
            update: { title, content, author },
            create: { mapId, title, author, content }
        });

        const status = map.createdAt.getTime() === map.createdAt.getTime() ? 200 : 201;
        res.status(200).json({ message: 'Map saved successfully', map });
    } catch (error) {
        console.error('Error saving map:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get All Maps (Metadata only for listing)
router.get('/list', async (req, res) => {
    try {
        const maps = await prisma.map.findMany({
            select: { id: true, mapId: true, title: true, author: true, createdAt: true }
        });
        res.json(maps);
    } catch (error) {
        console.error('Error fetching map list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Map by ID
router.get('/:mapId', async (req, res) => {
    try {
        const map = await prisma.map.findUnique({
            where: { mapId: req.params.mapId }
        });
        if (!map) return res.status(404).json({ error: 'Map not found' });
        res.json(map);
    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
