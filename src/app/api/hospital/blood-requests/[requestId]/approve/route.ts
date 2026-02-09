import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BloodRequest from '@/models/BloodRequest';
import Inventory from '@/models/Inventory';
import { getAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
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
      JSON.stringify({ message: 'You are not authorized to perform this action.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { requestId } = params;

  try {
    const bloodRequest = await BloodRequest.findById(requestId);

    if (!bloodRequest) {
      return new NextResponse(
        JSON.stringify({ message: 'Blood request not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (bloodRequest.hospitalId.toString() !== user.id) {
      return new NextResponse(
        JSON.stringify({ message: 'You are not authorized to approve this request.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (bloodRequest.status !== 'Pending') {
      return new NextResponse(
        JSON.stringify({ message: 'Blood request is not in a pending state.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check and decrement inventory atomically
    const updatedInventory = await Inventory.findOneAndUpdate(
      { hospital: bloodRequest.hospitalId, bloodGroup: bloodRequest.bloodGroup, quantity: { $gte: bloodRequest.units } },
      { $inc: { quantity: -bloodRequest.units } },
      { new: true }
    );

    if (!updatedInventory) {
      return new NextResponse(
        JSON.stringify({ message: 'Not enough blood units available in your inventory to approve this request.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    bloodRequest.status = 'Approved';
    await bloodRequest.save();

    return new NextResponse(
      JSON.stringify(bloodRequest),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error approving blood request:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
