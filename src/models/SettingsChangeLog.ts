import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ISettingsChangeLog extends Document {
    hospitalId: mongoose.Types.ObjectId;
    field: string;
    oldValue: string;
    newValue: string;
    timestamp: Date;
}

const SettingsChangeLogSchema: Schema<ISettingsChangeLog> = new Schema({
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    field: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const SettingsChangeLog: Model<ISettingsChangeLog> = models.SettingsChangeLog || mongoose.model<ISettingsChangeLog>('SettingsChangeLog', SettingsChangeLogSchema);

export default SettingsChangeLog;
