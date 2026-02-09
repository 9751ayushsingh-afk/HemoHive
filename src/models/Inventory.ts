
import mongoose, { Schema, Document, models } from 'mongoose';

export interface IInventory extends Document {
  bloodGroup: string;
  quantity: number;
  hospital: mongoose.Schema.Types.ObjectId;
  lastUpdated: Date;
}

const InventorySchema: Schema = new Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Inventory = models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
