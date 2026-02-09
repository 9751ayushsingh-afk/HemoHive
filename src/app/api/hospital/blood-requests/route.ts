import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BloodRequest from '@/models/BloodRequest';
import { getAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await dbConnect();

  const authResult = await getAuth(request);
  if (authResult.error || !authResult.user) {
    return new NextResponse(
      JSON.stringify({ message: authResult.error || 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { user } = authResult;

  if (user.role !== 'hospital') {
    return new NextResponse(
      JSON.stringify({ message: 'You are not authorized to view this page.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const bloodRequests = await BloodRequest.find({ hospitalId: user.id }).populate('userId', 'fullName');

    return new NextResponse(
      JSON.stringify(bloodRequests),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching blood requests:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
