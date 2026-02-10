import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Inventory from '../../../models/Inventory';
import BloodBag from '../../../models/BloodBag';
import { getAuth } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { user, error } = await getAuth(req);
    if (error || !user || user.role !== 'hospital' || !user.hospitalId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch aggregate summary
    const inventory = await Inventory.find({ hospital: user.hospitalId });

    // Fetch granular bags for the modal
    const bags = await BloodBag.find({
      currentOwnerId: user.hospitalId,
      status: 'AVAILABLE' // Only show available bags in the list
    }).sort({ expiryDate: 1 });

    return NextResponse.json({
      summary: inventory,
      bags: bags
    });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred while fetching inventory.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
