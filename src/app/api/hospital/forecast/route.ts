import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'hospital') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hospitalId = session.user.id;

        // Proxy request to Python ML Service
        const response = await fetch(`http://localhost:8000/forecast/${hospitalId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Do not cache so we get the latest model structure immediately
        });

        if (!response.ok) {
            throw new Error('ML Service Unreachable');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Forecast API Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch AI forecast',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
