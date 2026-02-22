import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import HemoFlux from '../../../../lib/hemofluxEngine';
import BloodBag from '../../../../models/BloodBag';
import Hospital from '../../../../models/Hospital';
import User from '../../../../models/User';
import dbConnect from '../../../../lib/dbConnect';

// GET: Fetch available units for exchange (Exchange Pool) OR My Listings
export async function GET(request: Request) {
    await dbConnect();
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const requestingHospitalId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        let query: any = {};

        if (type === 'mine') {
            // Fetch *MY* listings (Active or Sold)
            query = {
                currentOwnerId: requestingHospitalId,
                exchangeStatus: { $ne: 'NONE' } // Must have been listed at some point. 
                // Issue: If sold, currentOwnerId might change? 
                // HemoFlux Engine: bag.currentOwnerId = requestingHospitalId (New Owner).
                // So if I sold it, I am NO LONGER the owner.
                // WE NEED TO CHECK originHospitalId OR key off 'exchangeStatus' history?
                // For simplicity in this V1: 
                // - Active Listings: owner = ME, status = LISTED
                // - Sold Listings: origin = ME, status = TRANSFERRED
            };

            // Actually, robust way:
            query = {
                $or: [
                    { currentOwnerId: requestingHospitalId, exchangeStatus: 'LISTED' }, // My Active Listings
                    { originHospitalId: requestingHospitalId, exchangeStatus: 'TRANSFERRED' } // Things I sold
                ]
            };
        } else {
            // Market Pool (Buy View)
            query = {
                exchangeStatus: 'LISTED',
                // currentOwnerId: { $ne: requestingHospitalId }, // REMOVED: Allow seeing own listings
                expiryDate: { $gt: new Date() },
                transferCount: 0
            };
        }

        const rawCount = await BloodBag.countDocuments(query);

        const pool = await BloodBag.find(query)
            .populate({
                path: 'currentOwnerId',
                select: 'fullName address location hospitalId',
                populate: {
                    path: 'hospitalId',
                    model: Hospital,
                    select: 'name location gps'
                }
            })
            // Also populate origin for Sold items to see who I am? (Redundant but consistent)
            .sort({ expiryDate: 1 })
            .lean();

        return NextResponse.json({ pool, requestingUserId: requestingHospitalId, debugRawCount: rawCount });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Execute a Transfer (Claim a Unit) OR List a Unit
export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const hospitalId = session.user.id;

    try {
        const body = await request.json();
        const { action, bagId } = body;

        if (!bagId) {
            return NextResponse.json({ message: 'Bag ID is required' }, { status: 400 });
        }

        if (action === 'LIST') {
            // List a unit for exchange
            const updatedBag = await HemoFlux.listUnit(bagId, hospitalId);
            return NextResponse.json({ message: 'Unit listed successfully', bag: updatedBag });
        }

        else if (action === 'CLAIM') {
            // Claim/Transfer a unit
            const result = await HemoFlux.executeTransfer(bagId, hospitalId);
            return NextResponse.json({
                message: 'Transfer executed successfully. One-Hop Lock engaged.',
                details: result
            });
        }

        else {
            return NextResponse.json({ message: 'Invalid action. Use LIST or CLAIM' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('HemoFlux API Error:', error);
        return NextResponse.json({ message: error.message || 'Transaction Failed' }, { status: 400 });
    }
}
