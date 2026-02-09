import mongoose, { Schema, Document, models } from 'mongoose';

export interface IBloodBag extends Document {
  bagId: string; // Physical Barcode/QR content
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  quantity: number; // Volume in ml
  expiryDate: Date;
  collectionDate: Date;

  // Origin and Ownership
  originHospitalId: mongoose.Schema.Types.ObjectId;
  currentOwnerId: mongoose.Schema.Types.ObjectId;
  sourceDonorId?: mongoose.Schema.Types.ObjectId;

  // Status and Flow
  status: 'AVAILABLE' | 'RESERVED' | 'TRANSFERRED' | 'EXPIRED' | 'USED' | 'DISCARDED';
  transferCount: number; // For HemoFlux One-Hop Rule
  exchangeStatus: 'NONE' | 'LISTED' | 'TRANSFERRED';

  // Quality
  coldChainIntegrity: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodBagSchema: Schema = new Schema({
  bagId: {
    type: String,
    required: [true, 'Bag ID (Barcode) is required'],
    unique: true,
    trim: true,
    index: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true,
  },
  collectionDate: {
    type: Date,
    required: true,
  },

  // Origin and Ownership
  originHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming Hospital is a User with role 'hospital'
    required: true,
  },
  currentOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sourceDonorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Status and Flow
  status: {
    type: String,
    enum: ['AVAILABLE', 'RESERVED', 'TRANSFERRED', 'EXPIRED', 'USED', 'DISCARDED'],
    default: 'AVAILABLE',
    index: true,
  },
  transferCount: {
    type: Number,
    default: 0,
    max: [1, 'Maximum transfer limit (1) reached. This bag cannot be transferred again.'],
  },
  exchangeStatus: {
    type: String,
    enum: ['NONE', 'LISTED', 'TRANSFERRED'],
    default: 'NONE',
  },

  // Quality
  coldChainIntegrity: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true
});

// Indexes for performance
BloodBagSchema.index({ currentOwnerId: 1, status: 1 });
BloodBagSchema.index({ expiryDate: 1, status: 1 });
BloodBagSchema.index({ exchangeStatus: 1 });

const BloodBag = models.BloodBag || mongoose.model<IBloodBag>('BloodBag', BloodBagSchema);

export default BloodBag;