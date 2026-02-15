import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Credit from '../../../../../models/Credit'; // Import Credit Model
import Delivery from '../../../../../models/Delivery';
import BloodBag from '../../../../../models/BloodBag';
import Inventory from '../../../../../models/Inventory';
import Driver from '../../../../../models/Driver';

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
            await BloodBag.findOneAndDelete({ bagId: delivery.bloodBagId });

            if (delivery.requestId) {
                await Inventory.findOneAndUpdate(
                    { hospital: (delivery.requestId as any).hospitalId, bloodGroup: (delivery.requestId as any).bloodGroup },
                    { $inc: { quantity: -1 } }
                );
            }
        }

        // Update Delivery Status
        delivery.status = 'DELIVERED';
        delivery.endTime = new Date();
        await delivery.save();

        // Update Blood Request Status to 'Fulfilled' AND Create Credit
        if (delivery.requestId) {
            const BloodRequest = (await import('../../../../../models/BloodRequest')).default;
            const request = await BloodRequest.findByIdAndUpdate(delivery.requestId._id || delivery.requestId, { status: 'Fulfilled' }, { new: true });

            // Create the credit record now that delivery is confirmed
            if (request) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30);

                await Credit.create({
                    userId: request.userId,
                    requestId: request._id,
                    dueDate,
                    status: 'active'
                });
            }
        }

        // Free the Driver
        await Driver.findByIdAndUpdate(delivery.driverId, { status: 'ONLINE' });

        return NextResponse.json({ success: true, message: 'Delivery Completed Successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
    }
}
