import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Credit from '../../../../../models/Credit';
import BloodRequest from '../../../../../models/BloodRequest';
import User from '../../../../../models/User';

const MAX_EXTENSIONS = 3;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const userId = params.id;
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const credits = await Credit.find({ userId: userId })
      .populate({
        path: 'requestId',
        model: BloodRequest,
        populate: {
          path: 'hospitalId',
          model: User,
          select: 'fullName' // Get hospital name from the User model
        }
      })
      .sort({ issuedDate: -1 }); // Sort by most recent

    const now = new Date();
    let isUserBlocked = false;

    // Process credits to update status and check for blocking conditions
    for (const credit of credits) {
      if ((credit.status === 'active' || credit.status === 'extended') && now > new Date(credit.dueDate)) {
        credit.status = 'overdue';
        await credit.save();
      }

      // Check for blocking condition: Overdue and no extensions left.
      if (credit.status === 'overdue' && credit.extensionsUsed >= MAX_EXTENSIONS) {
        isUserBlocked = true;
        // In a full implementation, you would also update the User model itself to persist the blocked state.
        // For example: await User.findByIdAndUpdate(userId, { isBlocked: true });
      }
    }

    // Fetch pending return requests for this user
    const returnRequests = await import('../../../../../models/ReturnRequest').then(mod => mod.default.find({
      userId: userId,
      status: 'pending'
    }));

    // Create a map for quick lookup: creditId -> status
    const returnStatusMap = new Map();
    returnRequests.forEach((req: any) => {
      returnStatusMap.set(req.creditId.toString(), req.status);
    });

    // Helper to format credit for response
    const formatCredit = (credit: any) => {
      const creditObj = credit.toObject();
      creditObj.returnRequestStatus = returnStatusMap.get(credit._id.toString()) || null;
      return creditObj;
    };

    // Categorize for the frontend
    const activeCredits = credits
      .filter(c => c.status === 'active' || c.status === 'extended')
      .map(formatCredit);

    // Overdue credits
    const overdueCredits = credits
      .filter(c => c.status === 'overdue')
      .map(formatCredit);

    // Cleared credits
    const clearedCredits = credits
      .filter(c => c.status === 'cleared')
      .map(formatCredit);

    return new NextResponse(JSON.stringify({
      isBlocked: isUserBlocked,
      activeCredits,
      overdueCredits,
      clearedCredits,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error fetching user credits:', error);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
