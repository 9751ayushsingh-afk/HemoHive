const fs = require('fs');
const raw = fs.readFileSync('url_results.json', 'utf16le');
const cleaned = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
const data = JSON.parse(cleaned);
const fails = data.filter(r => r.status !== 200);
console.log('Total URLs:', data.length);
console.log('Failures:', JSON.stringify(fails, null, 2));
if (fails.length === 0) console.log('All 200 OK');
