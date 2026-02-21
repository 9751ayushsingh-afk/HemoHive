import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import BloodRequest from '../../../../../models/BloodRequest';
import { getAuth } from '../../../../../lib/auth';

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  await dbConnect();

  const authResult = await getAuth(request);
  if (authResult.error || !authResult.user) {
    return new NextResponse(
      JSON.stringify({ message: authResult.error || 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { user } = authResult;

  // Only a donor (or an admin) should be able to confirm payment for their request
  // For a real application, this would involve more robust payment gateway webhook verification
  if (user.role !== 'donor' && user.role !== 'admin') {
    return new NextResponse(
      JSON.stringify({ message: 'You are not authorized to confirm payment.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { requestId } = params;

    const bloodRequest = await BloodRequest.findOneAndUpdate(
      { _id: requestId, userId: user.id },
      { paymentStatus: 'Completed' },
      { new: true }
    );

    if (bloodRequest) {
      // Create Transaction Record for Payment
      const Transaction = (await import('../../../../../models/Transaction')).default;

      const totalAmount = (bloodRequest.processingFee || 0) + (bloodRequest.deliveryFee || 0) + (bloodRequest.depositAmount || 0);

      await Transaction.create({
        userId: user.id,
        type: 'DEPOSIT',
        amount: totalAmount,
        currency: 'INR',
        status: 'COMPLETED',
        relatedEntity: 'BloodRequest',
        entityId: bloodRequest._id,
        description: 'Payment for Blood Request (Includes Deposit)',
        metadata: {
          processingFee: bloodRequest.processingFee,
          deliveryFee: bloodRequest.deliveryFee,
          depositAmount: bloodRequest.depositAmount
        }
      });
    }

    if (!bloodRequest) {
      return new NextResponse(
        JSON.stringify({ message: 'Blood request not found or not authorized.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'Payment confirmed successfully', bloodRequest }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
