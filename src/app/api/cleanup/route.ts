
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import BloodBag from '../../models/BloodBag';

export async function POST(req: Request) {
    try {
        await dbConnect();
        // Delete all bags that look like seed data (start with SEED-)
        // Also delete the ones from the first attempt if they had different IDs but 'SEED_DATA' in notes
        const result = await BloodBag.deleteMany({
            $or: [
                { bagId: { $regex: /^SEED-/ } },
                { notes: 'SEED_DATA' }
            ]
        });

        return NextResponse.json({
            message: 'Cleanup Complete',
            deletedCount: result.deletedCount
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
