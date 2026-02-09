import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BloodRequest from '@/models/BloodRequest';
import User from '@/models/User';

export async function GET(request: Request, { params }: { params: { requestId: string } }) {
  const { requestId } = params;

  if (!requestId) {
    return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
  }

  await dbConnect();

  try {
    const bloodRequest = await BloodRequest.findById(requestId).populate('userId');

    if (!bloodRequest) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const user = bloodRequest.userId as any; // Cast to any to access user properties

    if (!user) {
      return NextResponse.json({ message: 'User not found for this invoice' }, { status: 404 });
    }

    // Construct location from user address details
    const customerLocation = `${user.address}, ${user.city}, ${user.state}, ${user.pincode}`;

    // Mock fees and refund policy for now, as they are not in BloodRequest or User models
    const processingFee = 1200;
    const deliveryFee = 500;
    const deposit = 3000;
    const refundPercentage = 97;
    const refundAmount = Math.round(deposit * (refundPercentage / 100));
    const retainedAmount = deposit - refundAmount;

    const invoiceData = {
      invoiceId: bloodRequest._id.toString(),
      // date and timestamp will be generated on the client-side for real-time display
      customer: {
        name: user.fullName,
        aadhaarLast4: user.aadhaar ? user.aadhaar.slice(-4) : 'N/A',
        contact: user.mobile,
        // Use bloodGroup from BloodRequest model
        bloodType: bloodRequest.bloodGroup,
        location: customerLocation
      },
      fees: {
        processing: processingFee,
        delivery: deliveryFee,
        deposit: deposit
      },
      deliveryType: bloodRequest.urgency === 'Emergency' ? 'Emergency' : 'Standard',
      distance: '12 km', // This would ideally come from logistics data
      estimatedTime: '45 mins', // This would ideally come from logistics data
      refundPolicy: {
        percentage: refundPercentage,
        amount: refundAmount,
        retained: retainedAmount
      },
      returnDeadline: 45, // This would ideally be dynamic
      paymentStatus: bloodRequest.paymentStatus,
      activeDelivery: null as any // Default
    };

    // [NEW] Check for active delivery
    const Delivery = (await import('@/models/Delivery')).default;
    const activeDelivery = await Delivery.findOne({
      requestId: bloodRequest._id,
      status: { $ne: 'CANCELLED' } // Get any non-cancelled delivery
    }).select('status _id driverId').lean();

    if (activeDelivery) {
      invoiceData.activeDelivery = {
        id: activeDelivery._id,
        status: activeDelivery.status
      };
    }

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
