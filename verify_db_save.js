
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hemohive"; // Fallback if env missing

const DonationAppointmentSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    donation_type: String,
    center: mongoose.Schema.Types.ObjectId,
    scheduled_at: Date,
    status: String,
    pickup_required: Boolean,
    qr_code: String,
}, { timestamps: true });

const DonationAppointment = mongoose.models.DonationAppointment || mongoose.model('DonationAppointment', DonationAppointmentSchema);

async function checkDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB.");

        const count = await DonationAppointment.countDocuments();
        console.log(`Total Appointments in DB: ${count}`);

        const latest = await DonationAppointment.find().sort({ createdAt: -1 }).limit(1);
        if (latest.length > 0) {
            console.log("Latest Appointment:", JSON.stringify(latest[0], null, 2));
        } else {
            console.log("No appointments found.");
        }

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
