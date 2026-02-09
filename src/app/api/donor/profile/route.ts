
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import DonationAppointment from '../../../../models/DonationAppointment';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Auth Check
        const session = await getServerSession(authOptions);
        const user_id = session?.user?.id;

        if (!user_id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch User Details
        const user = await User.findById(user_id).select('fullName bloodGroup next_eligible_date');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 2. Fetch Donation Statistics from Appointments
        // Count 'completed' donations
        const completedAppointments = await DonationAppointment.find({
            user: user_id,
            status: 'completed'
        }).sort({ scheduled_at: -1 });

        const totalDonations = completedAppointments.length;

        // 3. Determine Last Donation Date
        // Use the most recent completed appointment, or fallback to user profile if none found
        let lastDonationDate = null;
        if (completedAppointments.length > 0) {
            lastDonationDate = completedAppointments[0].scheduled_at;
        }

        // 4. Calculate Next Eligible Date if not present or stale
        // (Simple logic: Last Donation + 3 months)
        let nextEligibleDate = user.next_eligible_date;
        if (lastDonationDate && (!nextEligibleDate || new Date(nextEligibleDate) < new Date())) {
            const nextDate = new Date(lastDonationDate);
            nextDate.setMonth(nextDate.getMonth() + 3);
            nextEligibleDate = nextDate;
        }
        // If never donated, they are eligible now
        if (!lastDonationDate && !nextEligibleDate) {
            nextEligibleDate = new Date();
        }

        return NextResponse.json({
            name: user.fullName,
            bloodGroup: user.bloodGroup || 'Unknown',
            lastDonationDate: lastDonationDate ? new Date(lastDonationDate).toISOString().split('T')[0] : 'Never',
            nextEligibleDate: nextEligibleDate ? new Date(nextEligibleDate).toISOString().split('T')[0] : 'Available',
            totalDonations: totalDonations
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
    }
}
