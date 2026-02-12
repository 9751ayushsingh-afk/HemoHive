import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import dbConnect from '../../../lib/dbConnect';
import Notification from '../../../models/Notification';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await Notification.find({ recipient: session.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            recipient: session.user.id,
            read: false
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Mark all as read for now, or specific IDs if provided
        await Notification.updateMany(
            { recipient: session.user.id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
