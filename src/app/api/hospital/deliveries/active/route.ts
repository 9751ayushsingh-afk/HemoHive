
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/Delivery';
import BloodRequest from '@/models/BloodRequest';

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'hospital') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find deliveries linked to blood requests fulfilled by this hospital
        // 1. Find Requests by this Hospital
        // Optimized: Find Deliveries where the associated Request has hospitalId == session.user.id
        // However, Delivery refs Request.

        // Let's populate and filter or aggregate.
        // Better: Query Delivery, populate Request, filter in App or use Aggregate.
        // Since we need "Active" ones, the list is small.

        const activeDeliveries = await Delivery.find({
            status: { $in: ['ASSIGNED', 'PICKED_UP'] }
        })
            .populate({
                path: 'requestId',
                match: { hospitalId: session.user.id }, // Filter by this hospital
                select: 'hospitalId patientName bloodGroup quantity'
            })
            .populate('driverId', 'fullName currentLocation vehicleDetails')
            .sort({ createdAt: -1 });

        // Filter out deliveries where requestId is null (didn't match hospital)
        const relevantDeliveries = activeDeliveries.filter(d => d.requestId);

        return NextResponse.json({ success: true, deliveries: relevantDeliveries });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching deliveries', error: error.message }, { status: 500 });
    }
}
