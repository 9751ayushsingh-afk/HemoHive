
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import ReturnRequest from '../../../../models/ReturnRequest';
import Credit from '../../../../models/Credit';
import BloodBag from '../../../../models/BloodBag';
import Inventory from '../../../../models/Inventory';
import BloodRequest from '../../../../models/BloodRequest';

// POST: Create a new Return Request (Donor Action)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { creditId, userId, hospitalId } = await req.json();

    if (!creditId || !userId || !hospitalId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Populate requestId to get the unit count
    const credit = await Credit.findOne({ _id: creditId, userId: userId }).populate('requestId');
    if (!credit) {
      return NextResponse.json({ error: 'Credit not found or unauthorized' }, { status: 404 });
    }

    // Check if there is already a pending request
    const existingRequest = await ReturnRequest.findOne({ creditId, status: 'pending' });
    if (existingRequest) {
      return NextResponse.json({ error: 'A return request is already pending for this credit' }, { status: 409 });
    }

    // [UPDATED] Financial Penalty Logic
    // We do NOT increase blood units anymore. One unit borrowed = One unit returned.
    // The penalty is financial (deducted from deposit).
    const returnUnits = credit.requestId?.units || 1;

    const newRequest = await ReturnRequest.create({
      creditId,
      userId,
      hospitalId,
      units: returnUnits,
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
          select: 'bloodGroup units document depositAmount'
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
    const data = await req.json();
    const { requestId, status, adminComments, hospitalId, expiryDate } = data;

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Request ID and Status are required' }, { status: 400 });
    }

    const returnRequest = await ReturnRequest.findById(requestId);
    if (!returnRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    if (status === 'approved') {
      const { bagIds, bagId: singleBagId } = data;
      const finalBagIds = bagIds || (singleBagId ? [singleBagId] : []);

      if (finalBagIds.length === 0 || !expiryDate) {
        return NextResponse.json({ error: 'At least one Bag ID and Expiry Date are required for approval' }, { status: 400 });
      }

      // 0. Check for Bag ID uniqueness for all scanned bags
      const existingBags = await BloodBag.find({ bagId: { $in: finalBagIds } });
      if (existingBags.length > 0) {
        return NextResponse.json({
          error: `One or more Bag IDs (${existingBags.map(b => b.bagId).join(', ')}) already exist in inventory.`
        }, { status: 409 });
      }

      // 1. Update Return Request
      returnRequest.status = 'approved';
      returnRequest.bagId = finalBagIds.join(', '); // Join IDs for record keeping
      returnRequest.expiryDate = expiryDate;
      returnRequest.adminComments = adminComments;
      await returnRequest.save();

      // Get full credit details to know what is being returned
      const credit = await Credit.findById(returnRequest.creditId).populate('requestId');
      const bloodGroup = credit.requestId.bloodGroup;
      const originalDeposit = credit.requestId.depositAmount || 3000; // Default if missing

      const units = returnRequest.units || 1;
      const quantityPerBag = 450;

      // 2. Create Blood Bag records
      for (const id of finalBagIds) {
        await BloodBag.create({
          bagId: id,
          bloodGroup,
          quantity: quantityPerBag,
          expiryDate,
          collectionDate: new Date(),
          originHospitalId: hospitalId,
          currentOwnerId: hospitalId,
          sourceDonorId: returnRequest.userId,
          status: 'AVAILABLE'
        });
      }

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

      // 5. [NEW] Financial Refund Logic (Transaction)
      const now = new Date();
      const dueDate = new Date(credit.dueDate);
      const overdueMillis = now.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(overdueMillis / (1000 * 60 * 60 * 24));

      let refundPercentage = 100;
      let penaltyReason = 'None';

      if (overdueDays > 21) {
        refundPercentage = 0;
        penaltyReason = 'Blocked (>21 Days)';
      } else if (overdueDays > 14) {
        refundPercentage = 50;
        penaltyReason = 'Level 2 Penalty (15-21 Days)';
      } else if (overdueDays > 7) {
        refundPercentage = 75;
        penaltyReason = 'Level 1 Penalty (8-14 Days)';
      }

      const refundAmount = Math.round(originalDeposit * (refundPercentage / 100));
      const penaltyAmount = originalDeposit - refundAmount;

      // Dynamically import Transaction to avoid circular dependency issues if any
      const Transaction = (await import('../../../../models/Transaction')).default;

      await Transaction.create({
        userId: returnRequest.userId,
        type: 'REFUND',
        amount: refundAmount,
        currency: 'INR',
        status: 'COMPLETED',
        relatedEntity: 'ReturnRequest',
        entityId: returnRequest._id,
        description: `Refund for Blood Return. Penalty: ₹${penaltyAmount} (${penaltyReason})`,
        metadata: {
          originalDeposit,
          refundPercentage,
          overdueDays,
          penaltyReason
        }
      });

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
