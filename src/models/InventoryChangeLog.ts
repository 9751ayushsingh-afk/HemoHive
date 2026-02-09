import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IInventoryChangeLog extends Document {
  actorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  action: 'add' | 'update' | 'delete' | 'expire' | 'issue' | 'return';
  bagId: string;
  payload?: any;
}

const InventoryChangeLogSchema: Schema<IInventoryChangeLog> = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
  action: { type: String, enum: ['add','update','delete','expire','issue','return'], required: true },
  bagId: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
}, { timestamps: true });

const InventoryChangeLog: Model<IInventoryChangeLog> = models.InventoryChangeLog || mongoose.model<IInventoryChangeLog>('InventoryChangeLog', InventoryChangeLogSchema);

export default InventoryChangeLog;