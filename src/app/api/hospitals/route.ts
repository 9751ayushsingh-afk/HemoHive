
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Hospital from '../../../models/Hospital';
import User from '../../../models/User'; // [FIX] Import User model

export async function GET() {
  await dbConnect();

  try {
    // [MODIFIED] Query 'User' collection for registered hospitals
    // This ensures we get the correct _id (User ID) and fullName
    const hospitals = await User.find({ role: 'hospital' }, '_id fullName email address city').lean();

    return NextResponse.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
