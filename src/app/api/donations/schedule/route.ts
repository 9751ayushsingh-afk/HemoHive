
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import DonationAppointment from '../../../../models/DonationAppointment';
import User from '../../../../models/User';
import { getServerSession } from "next-auth"; // Should be used for real user ID
import { authOptions } from "../../../../lib/auth"; // Assuming auth options export

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { donation_type, date, time_slot, center_id, pickup_required } = await request.json();

    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;

    if (!user_id) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Parse start time from format like "09:00 AM – 10:00 AM"
    const startTimeString = time_slot.split('–')[0].trim(); // e.g. "09:00 AM"

    // Convert 12h to 24h format for ISO string
    const [timePart, modifier] = startTimeString.split(' ');
    let [hours, minutes] = timePart.split(':');

    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    // Pad hours/minutes if needed (though usually 2 digits)
    hours = hours.padStart(2, '0');
    minutes = minutes.padStart(2, '0');

    const scheduledAt = new Date(`${date}T${hours}:${minutes}:00`);

    // Handle invalid date parsing
    if (isNaN(scheduledAt.getTime())) {
      console.error(`Invalid Date Parsing. Date: ${date}, TimeSlot: ${time_slot}, Parsed: ${hours}:${minutes}`);
      return NextResponse.json({ message: 'Invalid Date/Time format' }, { status: 400 });
    }

    const newAppointment = await DonationAppointment.create({
      user: user_id,
      donation_type,
      center: center_id,
      scheduled_at: scheduledAt,
      status: 'pending',
      pickup_required: pickup_required || false,
      qr_code: `DPN-${Date.now().toString().slice(-6)}${user_id.toString().substring(0, 4).toUpperCase()}`,
    });

    return NextResponse.json(
      {
        appointment_id: newAppointment._id,
        qr_code: newAppointment.qr_code,
        status: 'Confirmed',
        message: 'Donation appointment confirmed successfully!',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Donation scheduling error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Placeholder for a function to calculate the next eligible date
function calculateNextEligibleDate(lastDonationDate: string, donationType: string): Date {
  const date = new Date(lastDonationDate);
  if (donationType === 'Whole Blood') {
    date.setDate(date.getDate() + 90); // 90 days for whole blood
  }
  // Add logic for Plasma, Platelets if needed
  return date;
}
