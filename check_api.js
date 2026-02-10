async function checkApi() {
    try {
        const response = await fetch('http://localhost:3001/api/map/custom_ai_map');
        if (response.ok) {
            const data = await response.json();
            console.log('--- Map Found via API ---');
            console.log(`Title: ${data.title}`);
            console.log(`Author: ${data.author}`);
            console.log(`Created: ${data.createdAt}`);
            console.log(`JSON Data Size: ${JSON.stringify(data.content).length} chars`);
        } else {
            console.log('Map custom_ai_map not found or server down. Status:', response.status);
        }
    } catch (err) {
        console.error('API Request failed:', err.message);
    }
}
checkApi();
