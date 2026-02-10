require('dotenv').config();
const mongoose = require('mongoose');
const Map = require('./models/Map');

const DB_NAME = process.env.MONGO_DB || 'safegame';
const MONGO_USER = process.env.MONGO_USER || 'admin';
const MONGO_PASS = process.env.MONGO_PASS || 'safe1234';

// Try different hosts
const URIs = [
    `mongodb://${MONGO_USER}:${MONGO_PASS}@127.0.0.1:27017/${DB_NAME}?authSource=admin`,
    `mongodb://${MONGO_USER}:${MONGO_PASS}@database:27017/${DB_NAME}?authSource=admin`
];

async function checkStageSchool() {
    let connected = false;
    for (const uri of URIs) {
        console.log('Trying to connect to:', uri.replace(MONGO_PASS, '****'));
        try {
            await mongoose.connect(uri, {
                family: 4,
                serverSelectionTimeoutMS: 2000
            });
            console.log('Connected to DB');
            connected = true;
            break;
        } catch (err) {
            console.log('Connection failed for', uri.split('@')[1], ':', err.message);
        }
    }

    if (!connected) {
        process.exit(1);
    }

    try {
        const map = await Map.findOne({ mapId: 'stage_school' });

        if (!map) {
            console.log('\nMap "stage_school" not found.');
        } else {
            console.log('\n--- Map Found: stage_school ---');
            console.log('Title:', map.title);
            console.log('Author:', map.author);

            const content = map.content;
            if (content && content.layers) {
                console.log('Layers found:', content.layers.map(l => l.name));

                const spawnLayer = content.layers.find(l => l.name === 'spawn');
                if (spawnLayer) {
                    console.log('\n--- Object Layer "spawn" Details ---');
                    console.log('Type:', spawnLayer.type);
                    console.log('Objects Count:', spawnLayer.objects ? spawnLayer.objects.length : 0);

                    if (spawnLayer.objects && spawnLayer.objects.length > 0) {
                        spawnLayer.objects.forEach((obj, i) => {
                            // Check for both name and potentially other fields if needed
                            console.log(`[Object ${i}] Name: ${obj.name.padEnd(20)} | Pos: (${(obj.x / 32).toFixed(1)}, ${(obj.y / 32).toFixed(1)})`);
                        });
                    } else {
                        console.log('No objects found in spawn layer.');
                    }
                } else {
                    console.log('Spawn layer (objectgroup) NOT found.');
                }
            } else {
                console.log('Map content or layers missing.');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

checkStageSchool();
