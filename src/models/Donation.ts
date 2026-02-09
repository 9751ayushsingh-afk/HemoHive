
import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    donationType: {
        type: String,
        enum: ['Whole Blood', 'Plasma', 'Platelets'],
        required: true,
    },
    centerId: {
        type: String, // Assuming centerId is a string for now
        required: true,
    },
    scheduledAt: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    qrCode: {
        type: String,
    },
    completedAt: {
        type: Date,
    },
    creditsAwarded: {
        type: Number,
        default: 0,
    },
    pickupRequired: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
