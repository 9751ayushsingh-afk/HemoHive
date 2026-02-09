import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IDonorProfile extends Document {
  user: mongoose.Types.ObjectId;
  blood_group: string;
  last_donation_date?: Date;
  weight?: number;
  hemoglobin?: number;
  next_eligible_date?: Date;
  total_donations_done: number;
}

const DonorProfileSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  blood_group: {
    type: String,
    required: true,
  },
  last_donation_date: {
    type: Date,
  },
  weight: {
    type: Number,
  },
  hemoglobin: {
    type: Number,
  },
  next_eligible_date: {
    type: Date,
  },
  total_donations_done: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const DonorProfile: Model<IDonorProfile> = models.DonorProfile || mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);

export default DonorProfile;
