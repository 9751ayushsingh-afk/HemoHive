
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/dbConnect';
import Driver from '../../../../models/Driver';
import Delivery from '../../../../models/Delivery';
import User from '../../../../models/User';

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'driver') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const driver = await Driver.findOne({ userId: session.user.id }).populate('userId', 'fullName email');

        if (!driver) {
            return NextResponse.json({ message: 'Driver profile not found' }, { status: 404 });
        }

        // Fetch Stats
        // 1. Completed Trips
        const completedDeliveries = await Delivery.find({
            driverId: driver._id,
            status: 'DELIVERED'
        }).sort({ updatedAt: -1 }).limit(10);

        const tripCount = completedDeliveries.length;

        // 2. Earnings (Mock Logic: ₹50 base + ₹10/km)
        // In real app, this would come from a Payment model
        const totalEarnings = completedDeliveries.reduce((sum, del) => {
            const dist = del.distance || 5; // fallback 5km
            return sum + (50 + (dist * 10));
        }, 0);

        // 3. Format History
        const history = completedDeliveries.map(d => ({
            id: d._id,
            to: d.dropoff.address, // Shorten if needed
            time: new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            earn: `₹ ${Math.floor(50 + ((d.distance || 5) * 10))}`,
            status: 'Completed'
        }));

        return NextResponse.json({
            profile: {
                id: driver._id, // [FIX] Include Driver Document ID
                userId: (driver.userId as any)._id,
                name: (driver.userId as any).fullName,
                email: (driver.userId as any).email,
                status: driver.status,
                isOnline: driver.status === 'ONLINE'
            },
            stats: {
                earnings: `₹ ${Math.floor(totalEarnings)}`,
                trips: tripCount,
                hours: `${(tripCount * 0.5).toFixed(1)}` // Mock hours
            },
            recentTrips: history
        });

    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching driver data', error: error.message }, { status: 500 });
    }
}
