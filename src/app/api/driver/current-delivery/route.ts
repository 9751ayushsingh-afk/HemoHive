
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/Delivery';
import Driver from '@/models/Driver';

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'driver') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find the driver profile first
        const driver = await Driver.findOne({ userId: session.user.id });
        if (!driver) {
            return NextResponse.json({ message: 'Driver profile not found' }, { status: 404 });
        }

        // Find any active delivery
        const activeDelivery = await Delivery.findOne({
            driverId: driver._id,
            status: { $in: ['ASSIGNED', 'PICKED_UP'] }
        })
            .populate('requestId') // to get blood request details if needed
            .sort({ createdAt: -1 });

        if (!activeDelivery) {
            return NextResponse.json({ active: false });
        }

        return NextResponse.json({
            active: true,
            delivery: activeDelivery
        });

    } catch (error: any) {
        console.error('Fetch Active Delivery Error:', error);
        return NextResponse.json({ message: 'Internal Error', error: error.message }, { status: 500 });
    }
}
