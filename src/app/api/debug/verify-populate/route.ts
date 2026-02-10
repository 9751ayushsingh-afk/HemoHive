
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import BloodBag from '../../../../models/BloodBag';
import User from '../../../../models/User';
import Hospital from '../../../../models/Hospital';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Simulate the exact query from the Exchange API
        const query = {
            exchangeStatus: 'LISTED',
            expiryDate: { $gt: new Date() },
            transferCount: 0
        };

        const rawDocs = await BloodBag.find(query).lean();

        const populatedDocs = await BloodBag.find(query)
            .populate({
                path: 'currentOwnerId',
                select: 'fullName address location hospitalId',
                populate: {
                    path: 'hospitalId',
                    model: Hospital,
                    select: 'name location gps'
                }
            })
            .lean();

        return NextResponse.json({
            query,
            rawCount: rawDocs.length,
            populatedCount: populatedDocs.length,
            sampleRaw: rawDocs[0],
            samplePopulated: populatedDocs[0]
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 200 });
    }
}
