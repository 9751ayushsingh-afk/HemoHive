const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const BloodRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patientHospital: { type: String },
    bloodGroup: { type: String },
    units: { type: Number },
    urgency: { type: String },
    status: { type: String },
    reason: { type: String },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', BloodRequestSchema);

async function debugPendingQuery() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is undefined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const hospitalIdToTest = '698eddd718688df24d07fed1'; // Jeevan Jyoti
        console.log(`🔍 Testing query for Hospital ID: ${hospitalIdToTest}`);

        const query = {
            $or: [
                { hospitalId: { $exists: false } },
                { hospitalId: null },
                { hospitalId: hospitalIdToTest }
            ],
            status: 'Pending',
            expiresAt: { $gt: new Date() }
        };

        const requests = await BloodRequest.find(query).sort({ createdAt: -1 });

        const output = requests.map(r => `- Request ID: ${r._id} | Target Hosp: ${r.hospitalId}`).join('\n');
        fs.writeFileSync('debug_output.txt', `Found ${requests.length} matching requests:\n${output}`);
        console.log('✅ Written to debug_output.txt');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugPendingQuery();
