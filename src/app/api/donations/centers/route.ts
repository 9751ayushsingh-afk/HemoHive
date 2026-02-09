import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Fetch users who have the role of 'hospital'
    // The user mentioned they have "hospital type of user" in the DB.
    const hospitalUsers = await User.find({ role: 'hospital' });

    // Transform to match expected frontend format
    // Note: User model might not have 'gps', so we use defaults or placeholder
    const formattedCenters = hospitalUsers.map(user => ({
      id: user._id,
      name: user.fullName || 'Unknown Hospital',
      address: user.address ? `${user.address}, ${user.city}, ${user.state}` : user.email,
      lat: 34.0522, // Default/Mock Coords since User model doesn't seem to have GPS
      lng: -118.2437
    }));

    return NextResponse.json(formattedCenters);
  } catch (error) {
    console.error('Error fetching centers:', error);
    return NextResponse.json({ message: 'Error fetching centers' }, { status: 500 });
  }
}
