
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import BloodBag from '../../../../models/BloodBag';
import User from '../../../../models/User';
import Hospital from '../../../../models/Hospital';

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Find Hospitals
        const hospitals = await User.find({ role: 'hospital' }).limit(5);
        if (hospitals.length < 2) {
            return NextResponse.json({ message: 'Need at least 2 hospitals in DB users to seed exchange data.' }, { status: 400 });
        }

        // We will distribute bags among these hospitals
        // User is likely logged in as one of them.
        // Creating bags for ALL of them ensures the user sees at least (N-1) hospitals' data.

        const seedBags = [];

        for (const h of hospitals) {
            // Create 2 bags per hospital
            seedBags.push({
                bagId: `SEED-${h.fullName.substring(0, 3).toUpperCase()}-${Date.now()}-1`,
                bloodGroup: 'O-',
                quantity: 450,
                expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days (Urgent)
                collectionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                originHospitalId: h._id,
                currentOwnerId: h._id,
                status: 'AVAILABLE',
                exchangeStatus: 'LISTED',
                transferCount: 0,
                coldChainIntegrity: true
            });

            seedBags.push({
                bagId: `SEED-${h.fullName.substring(0, 3).toUpperCase()}-${Date.now()}-2`,
                bloodGroup: 'AB+',
                quantity: 350,
                expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // +12 days (Eligible)
                collectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                originHospitalId: h._id,
                currentOwnerId: h._id,
                status: 'AVAILABLE',
                exchangeStatus: 'LISTED',
                transferCount: 0,
                coldChainIntegrity: true
            });
        }

        await BloodBag.insertMany(seedBags);

        return NextResponse.json({
            message: 'Seed Complete',
            count: seedBags.length,
            note: 'Refresh the Exchange page. You should see listings from OTHER hospitals.'
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
