
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually read .env
const envPath = path.resolve(process.cwd(), '.env');
let MONGODB_URI = '';

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/MONGODB_URI=(.*)/);
    if (match && match[1]) {
        MONGODB_URI = match[1].trim();
    }
} catch (e) {
    console.error('Error reading .env.local:', e.message);
}

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

const DeliverySchema = new mongoose.Schema({
    requestId: mongoose.Schema.Types.ObjectId,
    driverId: mongoose.Schema.Types.ObjectId,
    status: String,
    pickupCode: String,
    dropoffCode: String,
    createdAt: Date
});

const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);

async function getCodes() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Get latest delivery
        const delivery = await Delivery.findOne().sort({ createdAt: -1 });

        if (delivery) {
            console.log('--- LATEST DELIVERY ---');
            console.log(`ID: ${delivery._id}`);
            console.log(`Status: ${delivery.status}`);
            console.log(`Pickup Code: ${delivery.pickupCode}`);
            console.log(`Dropoff Code: ${delivery.dropoffCode}`);
            console.log('-----------------------');
        } else {
            console.log('No deliveries found.');
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

getCodes();
