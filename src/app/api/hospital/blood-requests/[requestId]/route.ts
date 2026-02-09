import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BloodRequest from '@/models/BloodRequest';
import Inventory from '@/models/Inventory'; // Import Inventory model
import { getAuth } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { requestId: string } }) {
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

  try {
    const { status } = await request.json();
    const { requestId } = params;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bloodRequest = await BloodRequest.findById(requestId);

    if (!bloodRequest) {
      return new NextResponse(
        JSON.stringify({ message: 'Blood request not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the hospital is authorized to update this request
    if (bloodRequest.hospitalId.toString() !== user.id) {
      return new NextResponse(
        JSON.stringify({ message: 'You are not authorized to update this blood request.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If the request is being approved and payment is completed, decrement inventory
    if (status === 'Approved' && bloodRequest.paymentStatus === 'Completed') {
      const inventoryItem = await Inventory.findOne({ 
        bloodGroup: bloodRequest.bloodGroup, 
        hospital: bloodRequest.hospitalId 
      });

      if (!inventoryItem) {
        return new NextResponse(
          JSON.stringify({ message: 'Inventory item not found for this blood group and hospital.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (inventoryItem.quantity < bloodRequest.units) {
        return new NextResponse(
          JSON.stringify({ message: 'Insufficient blood units in inventory.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      inventoryItem.quantity -= bloodRequest.units;
      await inventoryItem.save();
    }

    const updatedRequest = await BloodRequest.findOneAndUpdate(
      { _id: requestId },
      { status },
      { new: true }
    );

    return new NextResponse(
      JSON.stringify(updatedRequest),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating blood request:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
