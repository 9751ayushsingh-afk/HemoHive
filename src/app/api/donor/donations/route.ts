
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DonationAppointment from '@/models/DonationAppointment';
import User from '@/models/User';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;

    if (!user_id) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const appointments = await DonationAppointment.find({ user: user_id }).populate('center', 'name location').sort({ scheduled_at: -1 });

    return NextResponse.json(appointments);

  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ message: 'Error fetching donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received donation schedule request:', body);
    // In a real application, you would save this to the database
    // and interact with a third-party service for Aadhaar verification, etc.
    return NextResponse.json({ message: 'Donation scheduled successfully', data: body }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling donation:', error);
    return NextResponse.json({ message: 'Error scheduling donation' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;

    if (!user_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    const appointment = await DonationAppointment.findOne({ _id: id, user: user_id });

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.status !== 'pending') {
      return NextResponse.json({ message: 'Only pending appointments can be cancelled.' }, { status: 400 });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return NextResponse.json({ message: 'Appointment cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling donation:', error);
    return NextResponse.json({ message: 'Error cancelling donation' }, { status: 500 });
  }
}
