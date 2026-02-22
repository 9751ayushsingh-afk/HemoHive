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
            JSON.stringify({ message: 'Only hospitals can approve requests.' }),
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

        // Atomic Update: Only strictly finding one that has NO hospitalId assigned yet
        // AND is not expired.
        const now = new Date();

        const updatedRequest = await BloodRequest.findOneAndUpdate(
            {
                _id: requestId,
                $or: [
                    { hospitalId: { $exists: false } }, // Broadcast
                    { hospitalId: null },               // Broadcast 
                    { hospitalId: user.id }             // Specifically targeted to ME
                ],
                expiresAt: { $gt: now }
            },
            {
                $set: {
                    hospitalId: user.id,
                    status: 'Approved'
                }
            },
            { new: true }
        );

        if (!updatedRequest) {
            return new NextResponse(
                JSON.stringify({ message: 'Request unavailable or expired.' }),
                { status: 409 } // Conflict
            );
        }

        // Broadcast "Request Taken" to remove it from other dashboards
        try {
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            const baseUrl = `${protocol}://${host}`;

            await fetch(`${baseUrl}/api/internal/broadcast-taken`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            }).catch(err => console.log("Broadcast skipped:", err.message));
        } catch (e) {
            // Ignore
        }

        return new NextResponse(
            JSON.stringify({ message: 'Request Approved Successfully', request: updatedRequest }),
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error approving request:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
