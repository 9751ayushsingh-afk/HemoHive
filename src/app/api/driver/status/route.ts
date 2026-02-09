
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'driver') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { status, location } = body; // location expected as { lat: number, lng: number }

        if (!['ONLINE', 'OFFLINE'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const updateData: any = { status };

        // If location provided, update it (MongoDB GeoJSON format)
        if (location && location.lat && location.lng) {
            updateData.currentLocation = {
                type: 'Point',
                coordinates: [location.lng, location.lat] // GeoJSON is [lng, lat]
            };
        }

        const driver = await Driver.findOneAndUpdate(
            { userId: session.user.id },
            updateData,
            { new: true }
        );

        if (!driver) {
            return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, status: driver.status, location: driver.currentLocation });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating status', error: error.message }, { status: 500 });
    }
}
