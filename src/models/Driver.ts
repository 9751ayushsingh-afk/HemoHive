
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  contactNumber: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  currentLocation: {
    type: 'Point';
    coordinates: number[]; // [lng, lat]
  };
  vehicleDetails: {
    type: string;
    plateNumber: string;
    model: string;
  };
  isVerified: boolean;
  totalDeliveries: number;
  rating: number;
}

const DriverSchema: Schema<IDriver> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    contactNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'BUSY'],
      default: 'OFFLINE',
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    vehicleDetails: {
      type: { type: String },
      plateNumber: { type: String },
      model: { type: String },
    },
    isVerified: { type: Boolean, default: false },
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
  },
  { timestamps: true }
);

// safe index for geospatial queries
DriverSchema.index({ currentLocation: '2dsphere' });

const Driver: Model<IDriver> = models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);

export default Driver;
