import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/Inventory';

export async function GET(
  request: Request,
  { params }: { params: { bloodGroup: string } }
) {
  const { bloodGroup } = params;

  if (!bloodGroup) {
    return new NextResponse(
      JSON.stringify({ message: 'Blood group is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const units = parseInt(searchParams.get('units') || '1');

    const availableHospitals = await Inventory.aggregate([
      {
        $match: {
          bloodGroup: bloodGroup,
          quantity: { $gte: units }, // Check if inventory has enough units
        },
      },
      {
        $lookup: {
          from: 'users', // The collection name for the User model
          localField: 'hospital',
          foreignField: '_id',
          as: 'hospitalDetails',
        },
      },
      {
        $unwind: '$hospitalDetails',
      },
      {
        $replaceRoot: { newRoot: '$hospitalDetails' },
      },
      {
        $match: {
          role: 'hospital',
        },
      },
      {
        $group: {
          _id: '$_id',
          fullName: { $first: '$fullName' },
          email: { $first: '$email' },
          // add other fields from User model you want to return
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
        }
      }
    ]);

    return new NextResponse(JSON.stringify(availableHospitals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching available hospitals:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}