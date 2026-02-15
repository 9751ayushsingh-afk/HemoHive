const mongoose = require('mongoose');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

const BloodRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional (for specific hospital)
    patientHospital: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true },
    urgency: { type: String, enum: ['Normal', 'Urgent', 'Emergency'], default: 'Normal' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'], default: 'Pending' },
    reason: { type: String },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', BloodRequestSchema);

async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const testRequest = new BloodRequest({
            userId: new mongoose.Types.ObjectId(), // Random User ID
            patientHospital: 'City General Hospital (Test)',
            bloodGroup: 'O+',
            units: 2,
            urgency: 'Emergency',
            status: 'Pending',
            reason: 'DEBUG: Fresh Test Request by Seed',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Expires in 48 hours
            // No hospitalId set, so it should be visible to all
        });

        await testRequest.save();
        console.log('✅ seeded test request:', testRequest);

    } catch (error) {
        console.error('❌ Error seeding:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
