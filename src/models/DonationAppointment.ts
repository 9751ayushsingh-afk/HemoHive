import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IDonationAppointment extends Document {
  user: mongoose.Types.ObjectId;
  donation_type: 'Whole Blood' | 'Plasma' | 'Platelets';
  center: mongoose.Types.ObjectId; // Reference to Hospital as a donation center
  scheduled_at: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  qr_code?: string; // QR code for appointment verification
  pickup_required?: boolean; // Added based on UI field
}

const DonationAppointmentSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  donation_type: {
    type: String,
    enum: ['Whole Blood', 'Plasma', 'Platelets'],
    required: true,
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Updated to ref User since we use role='hospital'
    required: true,
  },
  scheduled_at: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  qr_code: {
    type: String,
  },
  pickup_required: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Force re-compilation of the model if it exists to pick up Schema changes (dev environment fix)
if (mongoose.models.DonationAppointment) {
  delete mongoose.models.DonationAppointment;
}

const DonationAppointment: Model<IDonationAppointment> = mongoose.model<IDonationAppointment>('DonationAppointment', DonationAppointmentSchema);

export default DonationAppointment;
