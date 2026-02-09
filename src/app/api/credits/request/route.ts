import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import BloodRequest from '../../../models/BloodRequest';
import Credit from '../../../models/Credit';
import { getAuth } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  await dbConnect();

  const authResult = await getAuth(request);
  if (authResult.error || !authResult.user) {
    return new NextResponse(
      JSON.stringify({ message: authResult.error || 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { user } = authResult;

  try {
    const { bloodGroup, units, hospitalId, urgency, reason } = await request.json();

    if (!bloodGroup || !units || !hospitalId || !urgency) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newBloodRequest = new BloodRequest({
      userId: user.id, // Assuming user object has id
      hospitalId,
      bloodGroup,
      units,
      urgency,
      reason,
    });

    await newBloodRequest.save();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Set due date 30 days from now

    const newCredit = new Credit({
      userId: user.id,
      requestId: newBloodRequest._id,
      dueDate,
    });

    await newCredit.save();

    return new NextResponse(
      JSON.stringify({
        message: 'Blood request and credit created successfully',
        bloodRequest: newBloodRequest,
        credit: newCredit,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating blood request:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}