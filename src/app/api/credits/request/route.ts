import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import BloodRequest from '../../../../models/BloodRequest';
import { getAuth } from '../../../../lib/auth';
import cloudinary from '../../../../lib/cloudinary';

export const dynamic = 'force-dynamic';

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
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const {
      bloodGroup,
      units,
      hospitalId,
      recipientHospitalId,
      urgency,
      reason,
      patientHospital,
      targetedHospitalIds
    } = data;

    // hospitalId is the TARGET for fulfillment. recipientHospitalId is the PATIENT'S location.
    // actualBroadcastTo will store the IDs of all hospitals that have stock (from frontend stock check)
    const actualRecipientHospitalId = (recipientHospitalId as string) || null;
    const actualHospitalId = (hospitalId as string) || actualRecipientHospitalId;

    let actualBroadcastTo: string[] = [];
    if (targetedHospitalIds) {
      try {
        actualBroadcastTo = JSON.parse(targetedHospitalIds as string);
      } catch (e) {
        console.error('Failed to parse targetedHospitalIds:', e);
      }
    }

    if (!bloodGroup || !units || !actualHospitalId || !urgency) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required blood group, units, or urgency' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle Document Upload to Cloudinary
    let documentUrl = '';
    const documentFile = formData.get('document') as File | null;

    if (documentFile && documentFile.size > 0) {
      const arrayBuffer = await documentFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract extension and filename for raw resource accuracy
      const originalName = documentFile.name;
      const cleanName = originalName.replace(/\.[^/.]+$/, "").substring(0, 50); // Remove ext and cap length

      // Upload to Cloudinary using a stream
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "hemohive/medical_docs",
            public_id: cleanName, // Cloudinary adds folder prefix automatically
            resource_type: "raw",
            use_filename: true,
            unique_filename: true,
            access_control: [{ access_type: 'anonymous' }],
          },
          (error: any, result: any) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      documentUrl = uploadResult.secure_url;
    }

    const newBloodRequest = new BloodRequest({
      userId: user.id,
      hospitalId: actualHospitalId,
      recipientHospitalId: actualRecipientHospitalId,
      broadcastTo: actualBroadcastTo, // Fulfiller Targets (Personal to capable hospitals)
      patientHospital: patientHospital || 'Not Specified',
      bloodGroup: bloodGroup as string,
      units: Number(units),
      urgency: urgency as string,
      reason: reason as string,
      document: documentUrl,
      status: 'Pending',
      expiresAt: calculateExpiry(urgency as string),
    });

    await newBloodRequest.save();

    // Real-time Socket Emission via Internal Broadcast Route
    try {
      await fetch('http://localhost:3000/api/internal/broadcast-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBloodRequest)
      });
    } catch (e) {
      console.error('Socket broadcast error:', e);
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Blood request created successfully',
        bloodRequest: newBloodRequest,
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

function calculateExpiry(urgency: string): Date {
  const now = new Date();
  switch (urgency) {
    case 'Emergency':
      return new Date(now.getTime() + 30 * 60 * 1000); // 30 Minutes
    case 'Urgent':
      return new Date(now.getTime() + 45 * 60 * 1000); // 45 Minutes
    case 'Normal':
    default:
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 Hour
  }
}