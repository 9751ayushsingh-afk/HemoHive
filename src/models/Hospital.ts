import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  location: string;
  gps: { lat: number; lng: number };
  contact: string;
  email: string;
}

const HospitalSchema: Schema<IHospital> = new Schema({
  name: { type: String, required: true },
  location: { type: String },
  gps: { lat: Number, lng: Number },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  contact: { type: String },
  email: { type: String, unique: true, required: true },
});

HospitalSchema.index({ coordinates: '2dsphere' });


const Hospital: Model<IHospital> = models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema);

export default Hospital;