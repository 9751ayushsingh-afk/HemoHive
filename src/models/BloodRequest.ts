import mongoose, { Schema, Document } from 'mongoose';

export interface IBloodRequest extends Document {
    userId: Schema.Types.ObjectId;
    patientHospital: string; // [NEW] Broad location
    hospitalId?: Schema.Types.ObjectId; // Optional until accepted
    expiresAt?: Date; // [NEW] For timer
    broadcastTo?: Schema.Types.ObjectId[]; // [NEW] List of notified hospitals
    bloodGroup: string;
    units: number;
    urgency: 'Normal' | 'Urgent' | 'Emergency';
    reason?: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
    paymentStatus: 'Pending' | 'Completed' | 'Failed';
}

const BloodRequestSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patientHospital: {
        type: String,
        required: true,
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Changed from true
    },
    recipientHospitalId: { // [NEW] The ID of the hospital where patient is admitted
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for backward compatibility, but UI will enforce
    },
    expiresAt: {
        type: Date,
    },
    broadcastTo: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    bloodGroup: {
        type: String,
        required: true,
    },
    units: {
        type: Number,
        required: true,
        default: 1,
    },
    urgency: {
        type: String,
        enum: ['Normal', 'Urgent', 'Emergency'],
        required: true,
        default: 'Normal',
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
        default: 'Pending',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    }
}, { timestamps: true });

// Force recompilation for Dev (Schema Changes)
if (mongoose.models.BloodRequest) {
    delete mongoose.models.BloodRequest;
}

export default mongoose.models.BloodRequest || mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
