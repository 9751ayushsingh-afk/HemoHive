
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import Inventory from '../../../../models/Inventory';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();

  try {
    // Find a hospital user to associate the inventory with
    const hospital = await User.findOne({ role: 'hospital' });

    if (!hospital) {
      return new NextResponse(JSON.stringify({ message: 'No hospital found to seed inventory for.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a new inventory item for B+ blood group
    const inventoryData = {
      bloodGroup: 'B+',
      quantity: 10,
      hospital: hospital._id,
      lastUpdated: new Date(),
    };

    const newInventory = new Inventory(inventoryData);
    await newInventory.save();

    return new NextResponse(JSON.stringify({ message: 'Inventory seeded successfully for B+ blood group.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error seeding inventory:', error);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred while seeding inventory.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
