
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Delivery from '../../../../models/Delivery';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        const delivery = await Delivery.findOne().sort({ createdAt: -1 });
        if (!delivery) return NextResponse.json({ message: 'No delivery found' });

        return NextResponse.json({
            id: delivery._id,
            status: delivery.status,
            pickupCode: delivery.pickupCode,
            dropoffCode: delivery.dropoffCode
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
