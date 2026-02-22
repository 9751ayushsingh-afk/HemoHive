import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const transactions = await Transaction.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 transactions

        return NextResponse.json({ success: true, data: transactions });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
