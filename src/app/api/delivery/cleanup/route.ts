
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Delivery from '../../../../models/Delivery';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const now = new Date();
        
        // 1. Find Search-Expired Deliveries (Populate BloodRequest to check status)
        const expiredDeliveries = await Delivery.find({
            status: 'SEARCHING',
            acceptanceDeadline: { $lte: now }
        }).populate('requestId');

        if (expiredDeliveries.length === 0) {
            return NextResponse.json({ success: true, processed: 0 });
        }

        console.log(`[CLEANUP] Found ${expiredDeliveries.length} expired delivery proposals. Checking statuses...`);

        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');

        // 2. Process each expired delivery
        const results = await Promise.all(expiredDeliveries.map(async (delivery) => {
            const bloodRequest = delivery.requestId as any;

            // [SAFEGUARD] If the BloodRequest is already completed or doesn't exist, cancel this delivery object
            if (!bloodRequest || bloodRequest.status === 'Fulfilled' || bloodRequest.status === 'Cancelled') {
                delivery.status = 'CANCELLED';
                delivery.proposedDriverIds = [];
                delivery.acceptanceDeadline = undefined;
                await delivery.save();
                return { status: 'CANCELLED', message: 'Request already fulfilled or invalid' };
            }

            // Add current proposed drivers to rejected list
            if (delivery.proposedDriverIds && delivery.proposedDriverIds.length > 0) {
                delivery.rejectedDrivers.push(...delivery.proposedDriverIds);
                delivery.proposedDriverIds = [];
                delivery.acceptanceDeadline = undefined;
                await delivery.save();
            }

            // Trigger next search
            try {
                const res = await fetch(`${protocol}://${host}/api/delivery/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId: bloodRequest._id })
                });
                return await res.json();
            } catch (e) {
                return { error: 'Broadcast failed' };
            }
        }));

        return NextResponse.json({
            success: true,
            processed: expiredDeliveries.length,
            details: results
        });

    } catch (error: any) {
        console.error('Cleanup Error:', error);
        return NextResponse.json({ message: 'Internal Error', error: error.message }, { status: 500 });
    }
}
