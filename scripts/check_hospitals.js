const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const UserSchema = new mongoose.Schema({
    role: String,
    fullName: String,
    email: String,
    hospitalDetails: Object
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkHospitals() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is undefined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const hospitals = await User.find({ role: 'hospital' });
        console.log(`Found ${hospitals.length} hospitals:`);

        const output = hospitals.map(h => `HOSP: ${h._id} | ${h.fullName}`).join('\n');
        fs.writeFileSync('hospitals.txt', output);
        console.log('✅ Written to hospitals.txt');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkHospitals();
