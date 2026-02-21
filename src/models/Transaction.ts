import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'DEPOSIT' | 'REFUND' | 'FEE' | 'PENALTY' | 'CREDIT_USED';
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    relatedEntity: 'BloodRequest' | 'Credit' | 'ReturnRequest';
    entityId: mongoose.Types.ObjectId;
    description?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'REFUND', 'FEE', 'PENALTY', 'CREDIT_USED'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    relatedEntity: {
        type: String,
        enum: ['BloodRequest', 'Credit', 'ReturnRequest'],
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'relatedEntity'
    },
    description: {
        type: String
    },
    metadata: {
        type: Map,
        of: Schema.Types.Mixed
    }
}, { timestamps: true });

// Compound index for efficient history queries
TransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
