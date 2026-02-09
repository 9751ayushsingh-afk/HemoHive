
import mongoose, { Schema, Document } from 'mongoose';

export interface IReturnRequest extends Document {
    creditId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    hospitalId: Schema.Types.ObjectId; // The hospital this credit belongs to
    status: 'pending' | 'approved' | 'rejected';
    adminComments?: string;
    bagId?: string; // Filled by hospital on approval
    expiryDate?: Date; // Filled by hospital on approval
    createdAt: Date;
    updatedAt: Date;
}

const ReturnRequestSchema: Schema = new Schema({
    creditId: {
        type: Schema.Types.ObjectId,
        ref: 'Credit',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Hospitals are users with role 'hospital'
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    units: {
        type: Number,
        required: true,
        default: 1
    },
    adminComments: {
        type: String
    },
    bagId: {
        type: String
    },
    expiryDate: {
        type: Date
    }
}, { timestamps: true });

// Prevent duplicate pending requests for the same credit
ReturnRequestSchema.index({ creditId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

export default mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>('ReturnRequest', ReturnRequestSchema);
