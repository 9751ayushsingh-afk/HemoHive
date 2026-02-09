
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Delivery from '../../../models/Delivery';
import Driver from '../../../models/Driver';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { deliveryId, code } = await request.json();

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
        }

        if (delivery.dropoffCode !== code) {
            return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
        }

        delivery.status = 'DELIVERED';
        delivery.endTime = new Date();
        await delivery.save();

        // Free up driver
        if (delivery.driverId) {
            await Driver.findByIdAndUpdate(delivery.driverId, { status: 'ONLINE', $inc: { totalDeliveries: 1 } });
        }

        return NextResponse.json({ success: true, message: 'Delivery verified successfully!' });

    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
