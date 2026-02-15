const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

async function checkHospitalsApi() {
    const fetch = (await import('node-fetch')).default;
    try {
        const res = await fetch('http://localhost:3000/api/hospitals');
        if (!res.ok) {
            console.error('API Error:', res.status, res.statusText);
            const text = await res.text();
            console.error('Body:', text);
            return;
        }
        const data = await res.json();
        console.log(`✅ API returned ${data.length} hospitals:`);
        data.slice(0, 3).forEach(h => console.log(`- ${h.fullName} (${h._id})`));
    } catch (err) {
        console.error('❌ Fetch failed:', err.message);
    }
}

checkHospitalsApi();
