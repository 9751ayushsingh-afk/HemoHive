
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const driverId = params.id;
    const body = await request.json();

    try {
        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            { $set: body },
            { new: true }
        );

        if (!updatedDriver) {
            return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, driver: updatedDriver });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update driver', error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const driver = await Driver.findById(params.id).populate('userId', 'fullName email mobile');
        if (!driver) {
            return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
        }
        return NextResponse.json(driver);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching driver', error: error.message }, { status: 500 });
    }
}
