
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ReturnRequest from '@/models/ReturnRequest';
import Credit from '@/models/Credit';
import BloodBag from '@/models/BloodBag';
import Inventory from '@/models/Inventory';
import User from '@/models/User';

// POST: Create a new Return Request (Donor Action)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { creditId, userId, hospitalId } = await req.json();

    if (!creditId || !userId || !hospitalId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify Credit exists and belongs to user
    const credit = await Credit.findOne({ _id: creditId, userId: userId });
    if (!credit) {
      return NextResponse.json({ error: 'Credit not found or unauthorized' }, { status: 404 });
    }

    // Check if there is already a pending request
    const existingRequest = await ReturnRequest.findOne({ creditId, status: 'pending' });
    if (existingRequest) {
      return NextResponse.json({ error: 'A return request is already pending for this credit' }, { status: 409 });
    }

    const now = new Date();
    const dueDate = new Date(credit.dueDate);

    // Default units (from original request)
    let returnUnits = credit.requestId?.units || 1;

    // Penalty Logic
    if (now > dueDate) {
      const overdueMillis = now.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(overdueMillis / (1000 * 60 * 60 * 24));

      if (overdueDays <= 7) {
        // Week 1 (Grace): No Penalty
        // returnUnits remains same
      } else if (overdueDays <= 14) {
        // Week 2: +25%
        returnUnits = returnUnits * 1.25;
      } else if (overdueDays <= 21) {
        // Week 3: +50%
        returnUnits = returnUnits * 1.50;
      } else {
        // Week 4+ (Blocked): +75% (or custom max)
        returnUnits = returnUnits * 1.75;
      }

      // Round off to nearest integer as strict fractional units (e.g. 1.25) are not possible
      returnUnits = Math.round(returnUnits);
    }

    const newRequest = await ReturnRequest.create({
      creditId,
      userId,
      hospitalId,
      units: returnUnits, // Save calculated units
      status: 'pending'
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating return request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Fetch Return Requests (Hospital Action)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');

    if (!hospitalId) {
      return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
    }

    const requests = await ReturnRequest.find({ hospitalId: hospitalId, status: 'pending' })
      .populate('userId', 'fullName bloodGroup mobile email')
      .populate({
        path: 'creditId',
        populate: {
          path: 'requestId', // To get original units/blood group details if needed
          select: 'bloodGroup units'
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: requests });

  } catch (error: any) {
    console.error('Error fetching return requests:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Approve/Reject Return Request (Hospital Action)
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { requestId, status, adminComments, bagId, expiryDate, hospitalId } = await req.json();

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Request ID and Status are required' }, { status: 400 });
    }

    const returnRequest = await ReturnRequest.findById(requestId);
    if (!returnRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    if (status === 'approved') {
      if (!bagId || !expiryDate) {
        return NextResponse.json({ error: 'Bag ID and Expiry Date are required for approval' }, { status: 400 });
      }

      // 0. Check for Bag ID uniqueness
      const existingBag = await BloodBag.findOne({ bagId: bagId });
      if (existingBag) {
        return NextResponse.json({ error: 'Bag ID already exists in inventory. Please use a unique ID.' }, { status: 409 });
      }

      // 1. Update Return Request
      returnRequest.status = 'approved';
      returnRequest.bagId = bagId;
      returnRequest.expiryDate = expiryDate;
      returnRequest.adminComments = adminComments;
      await returnRequest.save();

      // Get full credit details to know what is being returned
      const credit = await Credit.findById(returnRequest.creditId).populate('requestId');
      const bloodGroup = credit.requestId.bloodGroup;

      // Use the actual returned units (which may include penalty) from the request
      const units = returnRequest.units || 1;

      // 2. Create Blood Bag in Inventory
      await BloodBag.create({
        bagId,
        bloodGroup,
        hospitalId,
        units,
        expiryDate,
        donorId: returnRequest.userId,
        status: 'available', // Ready for use
        metadata: { source: 'return_credit', returnRequestId: returnRequest._id }
      });

      // 3. Clear the Credit
      credit.status = 'cleared';
      credit.penaltyApplied = false;
      await credit.save();

      // 4. Update Aggregate Inventory
      await Inventory.findOneAndUpdate(
        { hospital: hospitalId, bloodGroup: bloodGroup },
        { $inc: { quantity: units } },
        { upsert: true }
      );

    } else if (status === 'rejected') {
      returnRequest.status = 'rejected';
      returnRequest.adminComments = adminComments;
      await returnRequest.save();
    }

    return NextResponse.json({ success: true, data: returnRequest });

  } catch (error: any) {
    console.error('Error updating return request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
