import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import BloodRequest from '../../../../../models/BloodRequest';
import Inventory from '../../../../../models/Inventory'; // Import Inventory model
import { getAuth } from '../../../../../lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { requestId: string } }) {
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

      if (!inventoryItem || inventoryItem.quantity < bloodRequest.units) {
        return new NextResponse(
          JSON.stringify({ message: 'Insufficient aggregate blood units in inventory.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // IMPORT THE BLOOD BAG MODEL DYNAMICALLY IF NOT AT TOP OF FILE
      const BloodBag = (await import('../../../../../models/BloodBag')).default;

      // FIFO (First-In, First-Out): Find the oldest available physical bags
      const availableBags = await BloodBag.find({
        currentOwnerId: bloodRequest.hospitalId,
        bloodGroup: bloodRequest.bloodGroup,
        status: 'AVAILABLE'
      })
        .sort({ expiryDate: 1 }) // Get closest to expiry first
        .limit(bloodRequest.units);

      // Strict Validation: Physical bags must match the requested unit count
      if (availableBags.length < bloodRequest.units) {
        return new NextResponse(
          JSON.stringify({
            message: 'CRITICAL INVENTORY MISMATCH: Not enough physical, available blood bags (Status: AVAILABLE) were found to fulfill this order, despite aggregate counts. Please check for reserved or expired ghost-inventory.'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // MARK EACH BAG AS DISPENSED AND DELIST FROM HEMOFLUX
      const bagIds = availableBags.map((b: any) => b._id);
      await BloodBag.updateMany(
        { _id: { $in: bagIds } },
        {
          $set: {
            status: 'DISPENSED',
            exchangeStatus: 'NONE' // Crucial: Pulls it off the HemoFlux Market if it was LISTED
          }
        }
      );

      // Decrement the aggregate inventory count
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
