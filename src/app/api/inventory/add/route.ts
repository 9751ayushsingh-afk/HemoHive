import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BloodBag from '@/models/BloodBag';
import InventoryChangeLog from '@/models/InventoryChangeLog';
import Inventory from '@/models/Inventory';
import { getAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { user, error } = await getAuth(req);
    if (error || !user || user.role !== 'hospital' || !user.hospitalId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ message: 'Invalid request body, "items" array not found.' }, { status: 400 });
    }

    const results = { added: 0, failed: [] as { bagId: string, reason: string }[] };

    for (const item of items) {
      const { bagId, bloodGroup, expiryDate } = item;

      // Server validation
      if (!bagId || !bloodGroup || !expiryDate) {
        results.failed.push({ bagId: item.bagId || 'unknown', reason: 'Missing required fields.' });
        continue;
      }
      if (new Date(expiryDate) <= new Date()) {
        results.failed.push({ bagId, reason: 'Expiry date must be in the future.' });
        continue;
      }
      const existingBag = await BloodBag.findOne({ bagId });
      if (existingBag) {
        results.failed.push({ bagId, reason: 'Duplicate Bag ID.' });
        continue;
      }

      try {
        const newBag = new BloodBag({
          ...item,
          quantity: item.quantity || 450, // Default to 450ml if not provided
          collectionDate: item.collectionDate ? new Date(item.collectionDate) : new Date(), // Default to today
          originHospitalId: user.hospitalId,
          currentOwnerId: user.hospitalId,
          transferCount: 0,
          status: 'AVAILABLE',
          coldChainIntegrity: true
        });
        await newBag.save();

        // Log the change
        await new InventoryChangeLog({
          actorId: user.id,
          hospitalId: user.hospitalId,
          action: 'add',
          bagId: newBag.bagId,
          payload: item,
        }).save();

        // Update inventory summary
        await Inventory.findOneAndUpdate(
          { hospital: user.hospitalId, bloodGroup: newBag.bloodGroup },
          {
            $inc: { quantity: 1 },
            $set: { lastUpdated: new Date() }
          },
          { upsert: true, new: true }
        );

        results.added++;
        // TODO: Emit socket.io event
      } catch (e) {
        const err = e as Error;
        results.failed.push({ bagId, reason: err.message });
      }
    }

    return NextResponse.json(results, { status: 201 });

  } catch (error) {
    console.error('Error adding blood bags:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}