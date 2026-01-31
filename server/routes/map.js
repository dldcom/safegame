const express = require('express');
const router = express.Router();
const Map = require('../models/Map');

// Save or Update Map
router.post('/save', async (req, res) => {
    try {
        const { mapId, title, author, content } = req.body;

        let map = await Map.findOne({ mapId });

        if (map) {
            map.title = title;
            map.content = content;
            map.author = author;
            await map.save();
            return res.status(200).json({ message: 'Map updated successfully', map });
        } else {
            map = new Map({ mapId, title, author, content });
            await map.save();
            return res.status(201).json({ message: 'Map created successfully', map });
        }
    } catch (error) {
        console.error('Error saving map:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Map by ID
router.get('/:mapId', async (req, res) => {
    try {
        const map = await Map.findOne({ mapId: req.params.mapId });
        if (!map) return res.status(404).json({ error: 'Map not found' });
        res.json(map);
    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
