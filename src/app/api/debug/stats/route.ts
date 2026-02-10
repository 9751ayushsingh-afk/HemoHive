
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import BloodBag from '../../../../models/BloodBag';
import Inventory from '../../../../models/Inventory';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const hospitalCount = await User.countDocuments({ role: 'hospital' });
        const totalBags = await BloodBag.countDocuments({});
        const listedBags = await BloodBag.countDocuments({ exchangeStatus: 'LISTED' });
        const oldInventoryCount = await Inventory.countDocuments({});

        return NextResponse.json({
            hospitals: hospitalCount,
            bloodBags: totalBags,
            listedOnExchange: listedBags,
            legacyInventoryRecords: oldInventoryCount,
            message: "Exchange is empty because 'listedOnExchange' is " + listedBags
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
