import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    // In a real flow, we might fetch 'last_donation_date' from the user's history in DB
    // For this specific 'check-eligibility' tool (often a pre-screen), we might rely on user input OR DB.
    // Let's assume this endpoint validates the *answers* provided in the form, 
    // BUT we could also cross-reference with DB if the user is logged in.

    const { age, weight, last_donation_date, hemoglobin } = await request.json();

    // Logic:
    // 1. Age: 18-65
    // 2. Weight: > 50kg
    // 3. Hemoglobin: > 12.5 g/dL
    // 4. Frequency: Last donation > 90 days ago (3 months)

    const isEligible =
      age >= 18 && age <= 65 &&
      weight > 50 &&
      hemoglobin >= 12.5 &&
      (last_donation_date === '' || !last_donation_date || new Date(last_donation_date).getTime() + (90 * 24 * 60 * 60 * 1000) <= new Date().getTime());

    if (isEligible) {
      return NextResponse.json({ eligible: true, reason: 'You are eligible to donate blood based on provided criteria.' }, { status: 200 });
    } else {
      let reason = 'You are not eligible right now.';
      if (!(age >= 18 && age <= 65)) reason = 'Age must be between 18 and 65.';
      else if (!(weight > 50)) reason = 'Weight must be above 50 kg.';
      else if (!(hemoglobin >= 12.5)) reason = 'Hemoglobin level must be at least 12.5 g/dL.';
      else if (last_donation_date && !(new Date(last_donation_date).getTime() + (90 * 24 * 60 * 60 * 1000) <= new Date().getTime())) reason = 'You must wait 90 days between donations.';

      return NextResponse.json({ eligible: false, reason }, { status: 200 });
    }
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}