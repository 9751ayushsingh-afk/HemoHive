const mongoose = require('mongoose');
const path = require('path');
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

async function simulateApi() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is undefined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // MOCK PAYLOAD (Mimicking Frontend)
        const body = {
            bloodGroup: 'B+',
            units: 2,
            urgency: 'Emergency',
            patientHospital: 'Simulated Hospital',
            // Frontend sends recipientHospitalId, NOT hospitalId
            recipientHospitalId: '698eddd718688df24d07fed1',
            reason: 'Simulation Test',
            document: 'data:image/png;base64,fake'
        };

        // API LOGIC (Copy-Paste from route.ts)
        const { bloodGroup, units, hospitalId, recipientHospitalId, urgency, reason, patientHospital, document } = body;
        const actualHospitalId = hospitalId || recipientHospitalId;

        console.log('--- API LOGIC START ---');
        console.log('hospitalId:', hospitalId);
        console.log('recipientHospitalId:', recipientHospitalId);
        console.log('actualHospitalId:', actualHospitalId);

        if (!bloodGroup || !units || !actualHospitalId || !urgency) {
            console.error('❌ Validation Failed: Missing fields');
            return;
        }

        const newBloodRequest = new BloodRequest({
            userId: new mongoose.Types.ObjectId(), // Mock User ID
            hospitalId: actualHospitalId,
            recipientHospitalId: actualHospitalId,
            patientHospital: patientHospital || 'Not Specified',
            bloodGroup,
            units,
            urgency,
            reason,
            document,
            status: 'Pending',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await newBloodRequest.save();
        console.log('✅ Request Saved Successfully:', newBloodRequest._id);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

simulateApi();
