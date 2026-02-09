
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const DriverSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
    isBlocked: Boolean
});

const Driver = mongoose.models.Driver || mongoose.model('Driver', DriverSchema);

async function checkDriver() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const drivers = await Driver.find({});
    console.log(`Found ${drivers.length} drivers.`);

    drivers.forEach(d => {
        console.log(`Driver ID: ${d._id}`);
        console.log(`Status: ${d.status}`);
        console.log(`Location: ${JSON.stringify(d.currentLocation)}`);
        console.log(`Blocked: ${d.isBlocked}`);
        console.log('---');
    });

    // Check indexes
    const indexes = await Driver.collection.getIndexes();
    console.log('Indexes:', JSON.stringify(indexes, null, 2));

    await mongoose.disconnect();
}

checkDriver();
