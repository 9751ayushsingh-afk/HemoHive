import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import BloodRequest from '../../../../models/BloodRequest';
import { getAuth } from '../../../../lib/auth';

export async function PATCH(request: NextRequest) {
    await dbConnect();

    const authResult = await getAuth(request);
    if (authResult.error || !authResult.user) {
        return new NextResponse(
            JSON.stringify({ message: 'Authentication failed' }),
            { status: 401 }
        );
    }

    const { user } = authResult;

    if (user.role !== 'hospital') {
        return new NextResponse(
            JSON.stringify({ message: 'Only hospitals can reject requests.' }),
            { status: 403 }
        );
    }

    try {
        const { requestId } = await request.json();

        if (!requestId) {
            return new NextResponse(
                JSON.stringify({ message: 'Request ID is required' }),
                { status: 400 }
            );
        }

        const now = new Date();

        // Rejection marks it as 'Rejected' for this specific hospital if it was personal,
        // or effectively removes it from the broadcast pool if we set hospitalId.
        const updatedRequest = await BloodRequest.findOneAndUpdate(
            {
                _id: requestId,
                $or: [
                    { hospitalId: { $exists: false } },
                    { hospitalId: null },
                    { hospitalId: user.id }
                ],
                expiresAt: { $gt: now },
                status: 'Pending'
            },
            {
                $set: {
                    hospitalId: user.id,
                    status: 'Rejected'
                }
            },
            { new: true }
        );

        if (!updatedRequest) {
            return new NextResponse(
                JSON.stringify({ message: 'Request unavailable, already handled, or expired.' }),
                { status: 409 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: 'Request Rejected', request: updatedRequest }),
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error rejecting request:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
