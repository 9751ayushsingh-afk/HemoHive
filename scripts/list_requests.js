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
    document: { type: String },
}, { strict: false });

const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', BloodRequestSchema);

async function listRequests() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const requests = await BloodRequest.find({}).sort({ createdAt: -1 });
        console.log(`Found ${requests.length} requests:`);

        const output = requests.slice(0, 10).map(r => {
            const now = new Date();
            const notExpired = r.expiresAt ? new Date(r.expiresAt) > now : true;
            const sid = r._id.toString();
            // Handle hospitalId: can be ObjectId or undefined
            const hid = r.hospitalId ? r.hospitalId.toString() : 'NULL';
            const patientsHosp = r.patientHospital || 'N/A';
            const created = r.createdAt ? new Date(r.createdAt).toISOString() : 'N/A';

            return `REQ: ${sid} | ${r.status} | Exp:${notExpired} | Hosp:${hid} | PatientHosp:${patientsHosp} | Created:${created}`;
        }).join('\n');

        fs.writeFileSync('requests.txt', output);
        console.log('✅ Written to requests.txt');

    } catch (error) {
        console.error('❌ Error listing:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listRequests();
