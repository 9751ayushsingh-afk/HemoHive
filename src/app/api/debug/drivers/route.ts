
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Driver from '../../../../models/Driver';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        // 1. Force Indexes
        await Driver.syncIndexes();

        // 2. Fix Data (Ensure defaults exist)
        await Driver.updateMany(
            { isBlocked: { $exists: false } },
            { $set: { isBlocked: false } }
        );

        const drivers = await Driver.find({});
        const indexes = await Driver.collection.indexes();

        return NextResponse.json({
            message: 'Synced Indexes and Fixed Data',
            indexes,
            drivers: drivers.map(d => ({
                id: d._id,
                status: d.status,
                location: d.currentLocation,
                isBlocked: d.isBlocked,
                isVerified: d.isVerified
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
