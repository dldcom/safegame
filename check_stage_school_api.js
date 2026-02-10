const http = require('http');

http.get('http://localhost:3001/api/map/stage_school', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const map = JSON.parse(data);
            console.log('--- Map Found: stage_school ---');
            console.log('Title:', map.title);

            const content = map.content;
            if (content && content.layers) {
                const spawnLayer = content.layers.find(l => l.name === 'spawn');
                if (spawnLayer) {
                    console.log('\n--- Object Layer "spawn" Details ---');
                    console.log('Objects Count:', spawnLayer.objects ? spawnLayer.objects.length : 0);

                    if (spawnLayer.objects && spawnLayer.objects.length > 0) {
                        spawnLayer.objects.forEach((obj, i) => {
                            console.log(`[Object ${i}] Name: ${obj.name.padEnd(25)} | Pos: (${(obj.x / 32).toFixed(1)}, ${(obj.y / 32).toFixed(1)})`);
                        });
                    } else {
                        console.log('No objects found in spawn layer.');
                    }
                } else {
                    console.log('Spawn layer NOT found.');
                }
            } else {
                console.log('Invalid map content structure.');
            }
        } catch (e) {
            console.error('Failed to parse response:', e.message);
            console.log('Raw data excerpt:', data.substring(0, 200));
        }
    });
}).on('error', (err) => {
    console.error('API Request failed:', err.message);
});
