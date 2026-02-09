
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Driver from '@/models/Driver';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { fullName, email, password, vehicleType, plateNumber, model, contactNumber } = body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        // 1.1 Check if driver with contact number exists
        const existingDriver = await Driver.findOne({ contactNumber });
        if (existingDriver) {
            return NextResponse.json({ message: 'Driver with this contact number already exists' }, { status: 400 });
        }

        // 2. Create User (Password hashing is handled in User model pre-save hook, but let's double check)
        // The User model in this project HAS a pre-save hook for hashing. 
        // However, sometimes it's safer to hash here if the hook is flaky or we want explicit control.
        // Looking at User.ts provided earlier: "UserSchema.pre('save'...". It does hash.
        // So we can just pass the plain password. 

        // Wait, let's look at Step 36. 
        // "UserSchema.pre('save', async function (next) { ... if (this.isModified('password')) { ... bcrypt.hash ... } })"
        // Yes, it hashes.

        const newUser = await User.create({
            fullName,
            email,
            password, // Pre-save hook will hash this
            role: 'driver',
        });

        // 3. Create Driver Profile
        const newDriver = await Driver.create({
            userId: newUser._id,
            contactNumber,
            vehicleDetails: {
                type: vehicleType,
                plateNumber: plateNumber,
                model: model
            },
            status: 'OFFLINE',
            isVerified: true // Auto-verify for now
        });

        return NextResponse.json({ success: true, driver: newDriver, message: 'Driver created successfully' });

    } catch (error: any) {
        console.error('Error creating driver:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
