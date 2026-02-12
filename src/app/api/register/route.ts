import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import Driver from '../../../models/Driver';
import cloudinary from '../../../lib/cloudinary';
import { sendWelcomeEmail } from '../../../lib/email';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const formData = await request.formData();
        const body = Object.fromEntries(formData.entries());

        const profilePictureFile = formData.get('profilePicture') as File | null;
        let profilePictureUrl: string | undefined = undefined;

        if (profilePictureFile && profilePictureFile.size > 0) {
            const arrayBuffer = await profilePictureFile.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            // Upload to Cloudinary using a stream
            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "hemohive/avatars", // Optional: organize uploads
                    },
                    (error: any, result: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(buffer);
            });

            profilePictureUrl = uploadResult.secure_url;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: body.email as string });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ message: 'User with this email already exists.' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { profilePicture, location, ...userData } = body;

        // Process GeoJSON Location if provided (from GPS)
        let processedLocation = undefined;
        if (location) {
            try {
                // Should come as stringified JSON or object depending on Form handling
                // Since we use FormData, standard fields update, but object might need parsing if sent as string
                // However, react-hook-form -> formData usually flattens, let's assume we handle it in frontend or parse here
                // Note: fetch's FormData doesn't support nested objects natively without stringifying.
                // Let's rely on body-parser or manual parsing if it comes as string.
            } catch (e) { }
        }

        // Actually, better approach: The frontend sends FormData. 
        // We need to handle 'location[lat]' and 'location[lng]' or check how axios sends it.
        // Assuming standard JSON body would be cleaner, but existing code uses formData().

        // Let's stick to existing pattern but parse location
        let geoLocation = { type: 'Point', coordinates: [0, 0] }; // Default

        // Check for coordinates in body (flat) or location object
        const lat = parseFloat(body['location[lat]'] as string || '0');
        const lng = parseFloat(body['location[lng]'] as string || '0');

        if (lat && lng) {
            geoLocation.coordinates = [lng, lat]; // GeoJSON is [lng, lat]
        }

        const newUser = new User({
            ...userData,
            password: body.password, // Pass the plain password to the model
            profilePicture: profilePictureUrl,
            location: geoLocation
        });

        if (newUser.role === 'hospital') {
            newUser.hospitalId = newUser._id;
        }

        await newUser.save();

        // Create Driver Profile if role is driver
        if (newUser.role === 'driver') {
            try {
                // Initialize default driver fields
                const newDriver = new Driver({
                    userId: newUser._id,
                    contactNumber: body.mobile, // From form
                    status: 'OFFLINE',
                    currentLocation: newUser.location || { type: 'Point', coordinates: [0, 0] },
                    vehicleDetails: {
                        type: 'Bike', // Default, to be updated by driver
                        plateNumber: 'PENDING',
                        model: 'Unknown'
                    },
                    isVerified: false,
                    totalDeliveries: 0,
                    rating: 5.0
                });

                await newDriver.save();
                console.log('Driver profile created for user:', newUser._id);
            } catch (driverError) {
                console.error('Error creating driver profile:', driverError);
                // Optional: Delete user if driver creation fails? 
                // For now, we log it. User exists but dashboard might fail.
                // ideally we should use transaction or rollback
            }
        }

        console.log('User object before sending welcome email:', newUser);

        // Send welcome email
        try {
            await sendWelcomeEmail({
                email: newUser.email,
                userName: newUser.fullName,
                bloodGroup: newUser.bloodGroup,
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Do not block registration if email fails, just log the error
        }

        return new NextResponse(JSON.stringify({ message: 'User registered successfully', user: newUser }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Registration Error:', error);
        if (error.name === 'ValidationError') {
            return new NextResponse(JSON.stringify({ message: error.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}