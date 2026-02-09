import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import BloodRequest from '../../../models/BloodRequest';
import { getAuth } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
            JSON.stringify({ message: 'Only hospitals can view pending requests.' }),
            { status: 403 }
        );
    }

    try {
        const now = new Date();

        // Find requests that:
        // 1. Have NO hospitalId (not accepted yet)
        // 2. Are NOT expired
        // 3. Status is 'Pending'
        const requests = await BloodRequest.find({
            $or: [
                { hospitalId: { $exists: false } },
                { hospitalId: null }
            ],
            status: 'Pending',
            expiresAt: { $gt: now }
        }).sort({ createdAt: -1 });

        return new NextResponse(
            JSON.stringify(requests),
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error fetching pending requests:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
