import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    fullName: string;
    email: string;
    password?: string;
    role: 'donor' | 'hospital' | 'admin' | 'driver';
    hospitalId?: mongoose.Types.ObjectId;
    gender?: string;
    dob?: Date;
    mobile?: string;
    aadhaar?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    lastDonationDate?: Date;
    weight?: number;
    hemoglobin?: number;
    next_eligible_date?: Date;
    medicalConditions?: string;
    preferredDonationType?: string;
    bloodGroup?: string;
    agreeTerms?: boolean;
    notificationPreference?: string;
    profilePicture?: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
    preferredBloodBank?: string;
    status?: 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Blocked';
    qty?: number;
    credit?: number;
    amount?: number;
    location?: {
        type: string;
        coordinates: number[];
    };
    fcmToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['donor', 'hospital', 'admin', 'driver'],
        required: [true, 'Please select a role'],
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: function () { return this.role === 'hospital'; },
    },
    gender: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    dob: {
        type: Date,
        required: function () { return this.role === 'donor'; },
    },
    mobile: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    aadhaar: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    address: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    city: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    state: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    pincode: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    lastDonationDate: {
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
    medicalConditions: {
        type: String,
    },
    preferredDonationType: {
        type: String,
    },
    bloodGroup: {
        type: String,
        required: function () { return this.role === 'donor'; },
    },
    agreeTerms: {
        type: Boolean,
        required: function () { return this.role === 'donor'; },
    },
    notificationPreference: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    emergencyContactName: {
        type: String,
    },
    emergencyContactNumber: {
        type: String,
    },
    preferredBloodBank: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Returned', 'Blocked'],
        default: 'Pending',
    },
    qty: {
        type: Number,
        default: 1,
    },
    credit: {
        type: Number,
        default: 1,
    },
    amount: {
        type: Number,
        default: 500,
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    fcmToken: {
        type: String,
    },
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });


// Hash password before saving and validate donor fields
UserSchema.pre('save', async function (next) {
    console.log('User.pre(save) hook triggered');
    console.log('this.role:', this.role);
    console.log('this:', this);


    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);