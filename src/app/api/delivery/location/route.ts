
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';
import Delivery from '@/models/Delivery';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { driverId, location, deliveryId } = await request.json();

        // Update Driver Location
        await Driver.findByIdAndUpdate(driverId, {
            currentLocation: location
        });

        // Log if active delivery
        if (deliveryId) {
            await Delivery.findByIdAndUpdate(deliveryId, {
                $push: {
                    routeLogs: {
                        location,
                        timestamp: new Date()
                    }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
