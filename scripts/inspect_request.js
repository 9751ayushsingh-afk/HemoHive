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

async function inspectRequest() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is undefined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const id = '6991fa6ad1540cf0dd47231b';
        console.log(`🔍 Inspecting Request: ${id}`);

        const request = await BloodRequest.findById(id);
        if (request) {
            fs.writeFileSync('inspect_output.json', JSON.stringify(request, null, 2));
            console.log('✅ Written to inspect_output.json');
        } else {
            console.log('❌ Request not found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

inspectRequest();
