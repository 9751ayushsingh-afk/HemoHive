
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import DonationAppointment from '../../../../models/DonationAppointment';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Assuming the logged-in user IS the hospital/center
        const appointments = await DonationAppointment.find({ center: userId })
            .populate('user', 'fullName bloodGroup mobile email') // Populate donor details
            .sort({ scheduled_at: 1 }); // Scheduled time ascending

        return NextResponse.json(appointments);

    } catch (error) {
        console.error('Error fetching hospital appointments:', error);
        return NextResponse.json({ message: 'Error fetching appointments' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, status, cancellationReason } = await req.json();

        if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const updateData: any = { status: status };
        if (cancellationReason) updateData.cancellationReason = cancellationReason;

        // Verify the appointment belongs to this center before updating
        const appointment = await DonationAppointment.findOneAndUpdate(
            { _id: id, center: userId },
            updateData,
            { new: true }
        );

        if (!appointment) {
            return NextResponse.json({ message: 'Appointment not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(appointment);

    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json({ message: 'Error updating appointment' }, { status: 500 });
    }
}
