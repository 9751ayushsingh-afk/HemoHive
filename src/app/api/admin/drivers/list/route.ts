
import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Driver from '../../../../../models/Driver';
import User from '../../../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        // Populate user details (name, email)
        const drivers = await Driver.find({})
            .populate('userId', 'fullName email mobile')
            .sort({ createdAt: -1 });

        return NextResponse.json(drivers);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch drivers', error: error.message }, { status: 500 });
    }
}
