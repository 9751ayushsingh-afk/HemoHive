
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Delivery from '@/models/Delivery';
import Driver from '@/models/Driver';
import BloodRequest from '@/models/BloodRequest';
import User from '@/models/User'; // Ensure User model is loaded
import mongoose from 'mongoose';

// Helper to generate 4-digit code
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

export async function POST(request: Request) {
    await dbConnect();
    try {
        const rawBody = await request.text();
        console.log('[DEBUG] /api/delivery/request Raw Body:', rawBody ? rawBody.substring(0, 100) : 'EMPTY');

        if (!rawBody) {
            return NextResponse.json({ message: 'Empty Request Body' }, { status: 400 });
        }

        const body = JSON.parse(rawBody);
        const { requestId, pickup, dropoff, userLocation } = body;

        let finalPickup = pickup;
        let finalDropoff = dropoff;
        let existingDelivery = null;

        if (requestId) {
            // [IDEMPOTENCY CHECK] Check if a delivery already exists for this request
            existingDelivery = await Delivery.findOne({
                requestId: requestId,
                status: { $in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'SEARCHING'] } // Check SEARCHING too?
            });

            if (existingDelivery && existingDelivery.status !== 'SEARCHING') {
                // If it is already ASSIGNED+ return it.
                // If it is SEARCHING, we proceed to re-search/expand search (logic below handles this)
                return NextResponse.json({
                    success: true,
                    delivery: existingDelivery,
                    message: 'Delivery already in progress'
                });
            }
        }

        // Validation: If no manual pickup/dropoff provided, fetch from BloodRequest
        if (!finalPickup || !finalDropoff) {
            if (!requestId) {
                console.log('[Error] RequestId missing');
                return NextResponse.json({ message: 'RequestId is required' }, { status: 400 });
            }

            // Populate both userId (Requester) and hospitalId (Provider)
            const bloodRequest = await BloodRequest.findById(requestId)
                .populate('userId')
                .populate('hospitalId')
                .populate('recipientHospitalId'); // [NEW] Populate Recipient

            if (!bloodRequest) {
                console.log('[Error] BloodRequest not found:', requestId);
                return NextResponse.json({ message: 'Blood Request not found' }, { status: 404 });
            }

            const hospital = bloodRequest.hospitalId;
            // Use registered recipient if available, otherwise fallback to user (requester)
            const recipient = bloodRequest.recipientHospitalId || bloodRequest.userId;

            // --- STRICT HOSPITAL-TO-HOSPITAL LOGIC ---

            // 1. Pickup: The Fulfilling Hospital (hospitalId)
            const hospitalAddress = hospital?.address || 'Unknown Hospital Address';
            const hospitalCoords = (hospital?.location?.coordinates && hospital.location.coordinates[0] !== 0)
                ? hospital.location
                : null;

            if (!hospitalCoords) {
                console.log('[Error] Pickup Hospital has no GPS:', hospital?._id);
                return NextResponse.json({ message: 'Pickup Hospital has no registered GPS location.' }, { status: 400 });
            }

            if (!finalPickup) {
                finalPickup = {
                    address: `${hospital?.fullName}, ${hospital?.city || ''}`,
                    location: hospitalCoords,
                    instructions: `Pickup from ${hospital?.fullName} Inventory`
                };
            }

            // 2. Dropoff: The Registered Recipient Hospital
            const recipientAddress = recipient?.address || 'Unknown Destination Address';
            const recipientCoords = (recipient?.location?.coordinates && recipient.location.coordinates[0] !== 0)
                ? recipient.location
                : null;

            if (!recipientCoords) {
                // If Requester has no GPS, we cannot route.
                console.log('[Error] Recipient has no GPS:', recipient?._id);
                return NextResponse.json({ message: 'Recipient Hospital has no registered GPS location.', debug: recipient?._id }, { status: 400 });
            }

            if (!finalDropoff) {
                finalDropoff = {
                    address: `${recipient?.fullName}, ${recipient?.city || ''}`,
                    location: recipientCoords,
                    instructions: `Deliver to ${recipient?.fullName} (Blood Bank)`
                };
            }
        }

        // Validate Coordinates presence
        if (!finalPickup.location || !finalPickup.location.coordinates) {
            console.log('[Error] Final Pickup Invalid:', finalPickup);
            return NextResponse.json({ message: 'Invalid Pickup Location' }, { status: 400 });
        }

        // Ensure Indexes (Safety Check)
        try { await Driver.syncIndexes(); } catch (e) { }

        // 1. Find Nearest Online Driver (Excluding Rejected)
        const rejectedDrivers = existingDelivery ? existingDelivery.rejectedDrivers : [];

        console.log(`[DEBUG] Searching for Driver near: ${finalPickup.address} [${finalPickup.location.coordinates[1]}, ${finalPickup.location.coordinates[0]}]`);

        const nearestDriver = await Driver.findOne({
            status: 'ONLINE',
            isBlocked: { $ne: true },
            _id: { $nin: rejectedDrivers }, // Exclude rejected
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: finalPickup.location.coordinates
                    },
                    $maxDistance: 5000000
                }
            }
        });

        if (!nearestDriver) {
            return NextResponse.json({
                success: false,
                message: 'No online drivers found nearby.'
            }, { status: 404 });
        }

        // 2. Create or Update Delivery (Proposal Mode)
        let delivery;
        const deadline = new Date(Date.now() + 60 * 1000); // 60 Seconds from now

        if (existingDelivery) {
            delivery = existingDelivery;
            delivery.proposedDriverId = nearestDriver._id as mongoose.Types.ObjectId;
            delivery.acceptanceDeadline = deadline;
            delivery.status = 'SEARCHING';
            await delivery.save();
        } else {
            delivery = await Delivery.create({
                requestId: requestId || new mongoose.Types.ObjectId(),
                driverId: undefined, // Not assigned yet
                proposedDriverId: nearestDriver._id,
                acceptanceDeadline: deadline,
                rejectedDrivers: [],
                pickup: finalPickup,
                dropoff: finalDropoff,
                status: 'SEARCHING',
                pickupCode: generateCode(),
                dropoffCode: generateCode(),
                distance: body.distance || 0
            });
        }

        // 3. Broadcast Proposal to Driver via Socket
        try {
            // Internal call to local server to emit socket event
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            const apiUrl = `${protocol}://${host}/api/internal/broadcast-proposal`;

            console.log(`[DEBUG] Broadcasting to ${apiUrl} for Driver: ${nearestDriver._id}`);

            const broadcastRes = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverId: nearestDriver._id,
                    data: {
                        deliveryId: delivery._id,
                        pickup: finalPickup,
                        dropoff: finalDropoff,
                        earnings: '₹ 250', // Mock Calculation
                        distance: '5 km', // Mock
                        time: '15 min', // Mock,
                        deadline: deadline // Send deadline to client
                    }
                })
            });

            if (!broadcastRes.ok) {
                console.error('[DEBUG] Broadcast Failed:', await broadcastRes.text());
            } else {
                console.log('[DEBUG] Broadcast Success');
            }

        } catch (socketError) {
            console.error('Socket Broadcast Failed:', socketError);
            // Continue anyway, driver might refresh and see it (if we add pulling)
        }

        return NextResponse.json({
            success: true,
            status: 'SEARCHING',
            deliveryId: delivery._id,
            deadline: deadline,
            message: 'Searching for driver...'
        });

    } catch (error: any) {
        console.error('Delivery Request Error:', error);
        return NextResponse.json({ message: 'Internal Error', error: error.message }, { status: 500 });
    }
}
