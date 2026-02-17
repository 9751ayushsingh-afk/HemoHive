import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramSession extends Document {
    chatId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    context: {
        role: 'system' | 'user' | 'assistant';
        content: string;
    }[];
    language: 'en' | 'hi';
    linkedUserId?: mongoose.Types.ObjectId; // Link to HemoHive User ID
    createdAt: Date;
    updatedAt: Date;
}

const TelegramSessionSchema: Schema = new Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    context: [
        {
            role: {
                type: String,
                enum: ['system', 'user', 'assistant'],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            _id: false,
        },
    ],
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en',
    },
    linkedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true
});

// Prevent model overwrite in development
export default mongoose.models.TelegramSession || mongoose.model<ITelegramSession>('TelegramSession', TelegramSessionSchema);
