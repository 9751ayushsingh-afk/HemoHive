
import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Delivery from '../../../../../models/Delivery';
import BloodBag from '../../../../../models/BloodBag'; // Import BloodBag Model
import { io } from 'socket.io-client'; // Mock import setup, real emitter below

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { deliveryId, code, bloodBagId } = await request.json();

        const delivery = await Delivery.findById(deliveryId).populate('requestId'); // Populate Request to get HospitalId

        if (!delivery) {
            return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
        }

        // --- RAKTSINDHU SECURITY: Blood Bag Verification (FIRST) ---
        if (bloodBagId) {
            const cleanBagId = bloodBagId.trim();

            // 1. Verify Bag Exists & Belongs to Hospital
            // [FIX] Changed 'hospitalId' to 'currentOwnerId' as per BloodBag schema
            const bag = await BloodBag.findOne({
                bagId: cleanBagId,
                currentOwnerId: (delivery.requestId as any).hospitalId
            });

            if (!bag) {
                return NextResponse.json({ message: 'Invalid Blood Bag ID for this Hospital.' }, { status: 400 });
            }

            // 2. Verify Bag Status
            // [FIX] Changed 'available' to 'AVAILABLE' to match schema Enum
            if (bag.status !== 'AVAILABLE') {
                return NextResponse.json({ message: `Bag is currently ${bag.status} (Not Available)` }, { status: 400 });
            }

            // 3. Verify Blood Group Match [NEW]
            const requiredBloodGroup = (delivery.requestId as any).bloodGroup;
            if (bag.bloodGroup !== requiredBloodGroup) {
                return NextResponse.json({
                    message: `Mismatch! Request needs ${requiredBloodGroup}, but Bag is ${bag.bloodGroup}`
                }, { status: 400 });
            }

            // Bag is valid, we don't save yet until Code is also verified below
        }

        // --- Verify Pickup Code (SECOND) ---
        if (delivery.pickupCode !== code) {
            return NextResponse.json({ message: 'Invalid Pickup Code' }, { status: 400 });
        }

        // --- Finalize: Mark Bag as Issued & Delivery as Picked Up ---
        // --- Finalize: Mark Bag as Issued & Delivery as Picked Up ---
        if (bloodBagId) {
            const cleanBagId = bloodBagId.trim();
            const bag = await BloodBag.findOne({ bagId: cleanBagId });
            if (bag) {
                // [FIX] Changed 'issued' to 'TRANSFERRED' to match schema Enum
                bag.status = 'TRANSFERRED';
                await bag.save();
            }
            delivery.bloodBagId = cleanBagId;
        }

        // Update Status
        delivery.status = 'PICKED_UP';
        delivery.startTime = new Date();
        await delivery.save();

        return NextResponse.json({ success: true, message: `Pickup Verified. Bag ${bloodBagId || 'N/A'} Secured & Issued.` });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
    }
}
