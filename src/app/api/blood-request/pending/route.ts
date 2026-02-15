import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import BloodRequest from '../../../../models/BloodRequest';
import { getAuth } from '../../../../lib/auth';
import mongoose from 'mongoose';

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

        // Convert user.id to ObjectId for accurate matching
        let hospitalId;
        try {
            hospitalId = new mongoose.Types.ObjectId(user.id);
        } catch (e) {
            console.error(`❌ [API:Pending] Invalid Hospital ID Format: ${user.id}`);
            return new NextResponse(JSON.stringify({ message: "Invalid ID format" }), { status: 400 });
        }

        const query = {
            $or: [
                // 1. Specifically Targeted to this hospital's private feed
                { broadcastTo: { $in: [hospitalId] } },
                // 2. Already assigned/accepted by this hospital
                { hospitalId: hospitalId },
                // 3. True Global Broadcasts (for safety/backward compatibility)
                {
                    $and: [
                        { $or: [{ broadcastTo: { $exists: false } }, { broadcastTo: { $size: 0 } }] },
                        { $or: [{ hospitalId: { $exists: false } }, { hospitalId: null }] }
                    ]
                }
            ],
            status: 'Pending',
            expiresAt: { $gt: now }
        };

        const requests = await BloodRequest.find(query).sort({ createdAt: -1 });

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
