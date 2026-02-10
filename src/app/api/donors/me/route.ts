import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import DonationAppointment from '../../../../models/DonationAppointment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "../../../../lib/auth";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id; // Use implicit user ID

    // 1. Fetch User Details for Blood Group
    const user = await User.findById(userId).select('bloodGroup next_eligible_date');

    // 2. Fetch Donation Statistics from Appointments
    const completedAppointments = await DonationAppointment.find({
      user: userId,
      status: 'completed'
    }).sort({ scheduled_at: -1 });

    const totalDonations = completedAppointments.length;

    // 3. Determine Last Donation Date
    let lastDonationDate = null;
    if (completedAppointments.length > 0) {
      lastDonationDate = completedAppointments[0].scheduled_at;
    }

    // 4. Calculate Next Eligible Date
    // Use stored date or calculate from last donation + 3 months
    let nextEligibleDate = user?.next_eligible_date;

    // Recalculate if we have a recent donation that might push it forward
    if (lastDonationDate) {
      const calculatedNextDate = new Date(lastDonationDate);
      calculatedNextDate.setMonth(calculatedNextDate.getMonth() + 3);

      // If stored date is missing or older than calculated, use calculated
      if (!nextEligibleDate || new Date(nextEligibleDate) < calculatedNextDate) {
        nextEligibleDate = calculatedNextDate;
      }
    } else if (!nextEligibleDate) {
      // If no donations and no stored date, eligible now
      nextEligibleDate = new Date();
    }

    const isEligible = new Date() >= new Date(nextEligibleDate);

    // 5. Return formatted response (snake_case keys as expected by page.tsx)
    return NextResponse.json({
      blood_group: user?.bloodGroup || 'Unknown',
      last_donation_date: lastDonationDate ? new Date(lastDonationDate).toISOString().split('T')[0] : 'Never',
      next_eligible_date: nextEligibleDate ? new Date(nextEligibleDate).toISOString().split('T')[0] : 'Available',
      total_donations: totalDonations,
      eligibility: isEligible ? 'Eligible' : 'Not Eligible'
    });

  } catch (error) {
    console.error('Error fetching donor profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
