
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually read .env since dotenv might not be installed
function loadEnv() {
    try {
        console.log("Current directory:", __dirname);
        const envPath = path.join(process.cwd(), '.env');
        console.log("Looking for env at:", envPath);
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const lines = envFile.split('\n');
            for (const line of lines) {
                // Find first equals sign to split key and value
                const firstEq = line.indexOf('=');
                if (firstEq > 0) {
                    const key = line.slice(0, firstEq).trim();
                    let value = line.slice(firstEq + 1).trim();

                    // Remove wrapping quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }

                    if (key && value) {
                        process.env[key] = value;
                    }
                }
            }
        } else {
            console.log("File not found at path.");
        }
    } catch (e) {
        console.log("Error reading env:", e);
    }
}
loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    process.exit(1);
}

// Minimal Schemas
const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    role: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DonationAppointmentSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    donation_type: String,
    scheduled_at: Date,
    status: String,
    center: mongoose.Schema.Types.ObjectId
}, { timestamps: true });
const DonationAppointment = mongoose.models.DonationAppointment || mongoose.model('DonationAppointment', DonationAppointmentSchema);

async function diagnose() {
    try {
        console.log("Connecting to DB...");
        // Handle connection options if needed, but usually URI is enough
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        console.log("\n--- USERS (Role: donor) ---");
        const donors = await User.find({ role: 'donor' });
        if (donors.length === 0) console.log("No users with role 'donor' found!");
        donors.forEach(d => {
            console.log(`ID: ${d._id} | Name: ${d.fullName} | Email: ${d.email}`);
        });

        console.log("\n--- RECENT APPOINTMENTS ---");
        const appts = await DonationAppointment.find().sort({ createdAt: -1 }).limit(5);
        if (appts.length === 0) console.log("No appointments found!");
        appts.forEach(a => {
            console.log(`ID: ${a._id} | UserID: ${a.user} | Status: ${a.status} | Time: ${a.scheduled_at}`);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
