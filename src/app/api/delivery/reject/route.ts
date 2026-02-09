
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Delivery from '../../../models/Delivery';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { deliveryId, reason } = await request.json(); // reason: 'manual' | 'timeout'

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
        }

        if (delivery.status !== 'SEARCHING') {
            return NextResponse.json({ message: 'Request already processed' }, { status: 400 });
        }

        // Add current proposed driver to rejected list
        if (delivery.proposedDriverId) {
            delivery.rejectedDrivers.push(delivery.proposedDriverId);
            delivery.proposedDriverId = undefined;
            delivery.acceptanceDeadline = undefined;
            await delivery.save();
        }

        // TRIGGER NEXT SEARCH immediately
        // We can call the /api/delivery/request logic.
        // Since we can't easily import the POST function from another route file in Next.js app router safely
        // (it expects Request object), we should ideally extract the logic.
        // But for now, we can make an internal fetch call to /api/delivery/request

        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');

        // Call Request API again to find next driver
        // We need to pass the same requestId.
        // But the request API expects 'pickup', 'dropoff' etc OR just requestId.
        // Our modified request API handles 'existingDelivery' check via requestId.

        const res = await fetch(`${protocol}://${host}/api/delivery/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: delivery.requestId // Passing requestId triggers the "Existing Delivery" logic we added
            })
        });

        const nextDriverData = await res.json();

        return NextResponse.json({
            success: true,
            message: 'Rejected. Searching next driver.',
            nextSearch: nextDriverData
        });

    } catch (error: any) {
        return NextResponse.json({ message: 'Internal Error', error: error.message }, { status: 500 });
    }
}
