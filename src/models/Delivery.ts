
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IDelivery extends Document {
    requestId: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    pickup: {
        address: string;
        location: { type: 'Point'; coordinates: number[] };
        instructions?: string;
    };
    dropoff: {
        address: string;
        location: { type: 'Point'; coordinates: number[] };
        instructions?: string;
    };
    status: 'SEARCHING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
    routeLogs: {
        location: { type: 'Point'; coordinates: number[] };
        timestamp: Date;
    }[];
    rejectedDrivers: mongoose.Types.ObjectId[];
    proposedDriverId?: mongoose.Types.ObjectId;
    acceptanceDeadline?: Date;
    pickupCode: string;
    dropoffCode: string;
    eta?: Date;
    startTime?: Date;
    endTime?: Date;
    distance?: number; // in meters
    bloodBagId?: string;
}

const DeliverySchema: Schema<IDelivery> = new Schema(
    {
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
        driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
        pickup: {
            address: { type: String, required: true },
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }, // [lng, lat]
            },
            instructions: String,
        },
        dropoff: {
            address: { type: String, required: true },
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }, // [lng, lat]
            },
            instructions: String,
        },
        status: {
            type: String,
            enum: ['SEARCHING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
            default: 'SEARCHING',
        },
        routeLogs: [
            {
                location: {
                    type: { type: String, enum: ['Point'], default: 'Point' },
                    coordinates: [Number],
                },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        rejectedDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }],
        proposedDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
        acceptanceDeadline: Date,
        pickupCode: { type: String, required: true },
        dropoffCode: { type: String, required: true },
        eta: Date,
        startTime: Date,
        endTime: Date,
        distance: Number,
        bloodBagId: { type: String }, // Captured at Pickup
    },
    { timestamps: true }
);

// Force recompilation to ensure schema updates apply (Fix for 'verificationCode' ghost error)
if (mongoose.models.Delivery) {
    delete mongoose.models.Delivery;
}

const Delivery: Model<IDelivery> = mongoose.model<IDelivery>('Delivery', DeliverySchema);

export default Delivery;
