import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/Delivery';
import Driver from '@/models/Driver';
import BloodBag from '@/models/BloodBag'; // Import BloodBag Model
import Inventory from '@/models/Inventory';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { deliveryId, code } = await request.json();

        // Populate Request to get HospitalId and BloodGroup info
        const delivery = await Delivery.findById(deliveryId).populate('requestId');

        if (!delivery) {
            return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
        }

        if (delivery.dropoffCode !== code) {
            return NextResponse.json({ message: 'Invalid Dropoff Code' }, { status: 400 });
        }

        // --- RAKTSINDHU: Inventory Deduction ---
        if (delivery.bloodBagId) {
            // 1. Mark Specific Bag as 'issued' (or delete) to remove from available stock
            // We use 'delete' to simulate physics of 'bag is gone' as per user request
            await BloodBag.findOneAndDelete({ bagId: delivery.bloodBagId });

            // 2. Decrement Aggregated Inventory for Stats
            if (delivery.requestId) {
                await Inventory.findOneAndUpdate(
                    { hospital: delivery.requestId.hospitalId, bloodGroup: delivery.requestId.bloodGroup },
                    { $inc: { quantity: -1 } }
                );
            }
            console.log(`[RaktSindhu] Processed Bag ${delivery.bloodBagId}: Removed from DB & Inventory Decremented.`);
        }

        // Update Delivery Status
        delivery.status = 'DELIVERED';
        delivery.endTime = new Date();
        await delivery.save();

        // Update Blood Request Status to 'Fulfilled'
        if (delivery.requestId) {
            const BloodRequest = (await import('@/models/BloodRequest')).default;
            await BloodRequest.findByIdAndUpdate(delivery.requestId._id || delivery.requestId, { status: 'Fulfilled' });
        }

        // Free the Driver
        await Driver.findByIdAndUpdate(delivery.driverId, { status: 'ONLINE' });

        return NextResponse.json({ success: true, message: 'Delivery Completed Successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
    }
}
