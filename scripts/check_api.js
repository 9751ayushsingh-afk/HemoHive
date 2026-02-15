const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

async function checkPending() {
    const fetch = (await import('node-fetch')).default;
    try {
        const res = await fetch('http://localhost:3000/api/blood-request/pending');
        if (!res.ok) {
            console.error('API Error:', res.status, res.statusText);
            const text = await res.text();
            console.error('Body:', text);
            return;
        }
        const data = await res.json();
        console.log('✅ Pending Requests from API:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Fetch failed (Server likely not running):', err.message);
    }
}

checkPending();
