
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BloodRequest from '@/models/BloodRequest';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const bloodRequest = await BloodRequest.findById(params.id).populate('hospitalId', 'fullName');
    if (!bloodRequest) {
      return NextResponse.json({ message: 'Blood request not found' }, { status: 404 });
    }

    // Ensure the request belongs to the user
    if (bloodRequest.userId.toString() !== token.id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(bloodRequest, { status: 200 });
  } catch (error) {
    console.error('Error fetching blood request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    await dbConnect();
  
    try {
      const { status } = await req.json();
  
      if (status !== 'Fulfilled') {
        return NextResponse.json({ message: 'Invalid status update' }, { status: 400 });
      }
  
      const bloodRequest = await BloodRequest.findById(params.id);
  
      if (!bloodRequest) {
        return NextResponse.json({ message: 'Blood request not found' }, { status: 404 });
      }
  
      // Ensure the request belongs to the user
      if (bloodRequest.userId.toString() !== token.id) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
  
      if (bloodRequest.status !== 'Approved') {
        return NextResponse.json({ message: 'Request not approved for payment' }, { status: 400 });
      }
  
      bloodRequest.status = 'Fulfilled';
      await bloodRequest.save();
  
      return NextResponse.json(bloodRequest, { status: 200 });
    } catch (error) {
      console.error('Error updating blood request:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
