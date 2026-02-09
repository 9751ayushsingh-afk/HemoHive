import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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