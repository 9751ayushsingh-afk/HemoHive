
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import Driver from '../../../../models/Driver';
import bcrypt from 'bcryptjs';
import cloudinary from '../../../../lib/cloudinary';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { fullName, email, password, vehicleType, plateNumber, model, contactNumber, profilePicture } = body;

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

        // 1.2 Check if vehicle with plate number exists
        const existingPlate = await Driver.findOne({ 'vehicleDetails.plateNumber': plateNumber });
        if (existingPlate) {
            return NextResponse.json({ message: 'Vehicle with this License Plate already exists' }, { status: 400 });
        }

        // 1.2 Upload Profile Picture (if provided)
        let profilePictureUrl = '';
        if (profilePicture) {
            try {
                console.log('Attempting Cloudinary upload, base64 length:', profilePicture.length);
                // Determine if it's base64 or URL (though usually base64 from client form)
                // Cloudinary uploader.upload handles base64 strings automatically
                const uploadResult = await cloudinary.uploader.upload(profilePicture, {
                    folder: 'hemohive/avatars',
                    transformation: [{ width: 400, height: 400, crop: 'fill' }] // Optimize - Changed crop to 'fill'
                });
                console.log('Cloudinary upload success:', uploadResult.secure_url);
                profilePictureUrl = uploadResult.secure_url;
            } catch (uploadError: any) {
                console.error('Image upload failed:', uploadError);
                return NextResponse.json({ message: 'Image upload failed: ' + (uploadError.message || 'Unknown error') }, { status: 500 });
            }
        }

        // 2. Create User
        const newUser = await User.create({
            fullName,
            email,
            password, // Pre-save hook will hash this
            role: 'driver',
            profilePicture: profilePictureUrl || undefined // Save URL if exists
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
