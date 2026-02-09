
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import BloodBag from '../../../models/BloodBag';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "../../../lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();
        // @ts-ignore
        const session = await getServerSession(authOptions);
        const requestingUserId = session?.user?.id || 'NO_SESSION';

        const allBags = await BloodBag.find({}).lean();

        const analysis = allBags.map((bag: any) => ({
            bagId: bag.bagId,
            exchangeStatus: bag.exchangeStatus,
            expiryDate: bag.expiryDate,
            isExpired: new Date(bag.expiryDate) < new Date(),
            transferCount: bag.transferCount,
            ownerId: bag.currentOwnerId,
            isOwnerMatch: bag.currentOwnerId.toString() === requestingUserId,
            isVisibleInMarket: (
                bag.exchangeStatus === 'LISTED' &&
                // bag.currentOwnerId.toString() !== requestingUserId && // (We removed this restriction)
                new Date(bag.expiryDate) > new Date() &&
                bag.transferCount === 0
            ) ? 'YES' : 'NO - Filtered'
        }));

        return NextResponse.json({
            requestingUserId,
            totalBags: allBags.length,
            analysis
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
