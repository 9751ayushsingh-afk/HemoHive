import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import BloodRequest from '../../../../models/BloodRequest';
import Inventory from '../../../../models/Inventory';
import { getAuth } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  await dbConnect();

  const authResult = await getAuth(request);
  if (authResult.error || !authResult.user) {
    return new NextResponse(
      JSON.stringify({ message: authResult.error || 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { user } = authResult;

  if (user.role !== 'donor') {
    return new NextResponse(
      JSON.stringify({ message: 'You are not authorized to view this page.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const bloodRequests = await BloodRequest.find({ userId: user.id }).populate('hospitalId', 'fullName');

    return new NextResponse(
      JSON.stringify(bloodRequests),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching blood requests:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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

  if (user.role !== 'donor') {
    return new NextResponse(
      JSON.stringify({ message: 'You are not authorized to create a blood request.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { bloodGroup, units, urgency, reason, patientHospital, recipientHospitalId } = await request.json();

    if (!bloodGroup || !units || !urgency || !patientHospital) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields: bloodGroup, units, urgency, patientHospital' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // [Step 2] Broadcast Logic: Trigger Internal Broadcast (Fire & Forget)
    // We will assume the existence of an internal broadcast mechanism or just rely on polling for V1.
    // For V2 (True Broadcast), we'll ping the socket server here.

    // Calculate expiration (30 mins from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const newBloodRequest = await BloodRequest.create({
      userId: user.id,
      patientHospital, // Broad location (Display Name)
      recipientHospitalId, // [NEW] Registered Hospital ID

      // hospitalId is intentionally undefined until Accepted
      bloodGroup,
      units,
      urgency,
      reason,
      status: 'Pending',
      paymentStatus: 'Pending',
      expiresAt: expiresAt,
    });

    // Attempt to broadcast via internal fetch to custom server (if listening)
    try {
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host');
      const baseUrl = `${protocol}://${host}`;

      await fetch(`${baseUrl}/api/internal/broadcast-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBloodRequest)
      }).catch(err => console.log("Broadcast skipped (server might not be ready):", err.message));
    } catch (e) {
      // Ignore broadcast errors so we don't block the UI
    }

    return new NextResponse(
      JSON.stringify(newBloodRequest),
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
