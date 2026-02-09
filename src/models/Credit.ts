import mongoose, { Schema, Document } from 'mongoose';

export interface ICredit extends Document {
    userId: Schema.Types.ObjectId;
    requestId: Schema.Types.ObjectId;
    issuedDate: Date;
    dueDate: Date;
    status: 'active' | 'cleared' | 'overdue' | 'extended';
    extensionsUsed: number;
    penaltyApplied: boolean;
}

const CreditSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestId: {
        type: Schema.Types.ObjectId,
        ref: 'BloodRequest',
        required: true,
    },
    issuedDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'cleared', 'overdue', 'extended'],
        default: 'active',
        required: true,
    },
    extensionsUsed: {
        type: Number,
        default: 0,
        max: 3,
    },
    penaltyApplied: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Credit || mongoose.model<ICredit>('Credit', CreditSchema);
