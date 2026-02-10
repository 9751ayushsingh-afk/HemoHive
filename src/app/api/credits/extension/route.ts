import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Credit from '../../../../models/Credit';

const MAX_EXTENSIONS = 3;
const EXTENSION_DAYS = 7;

export async function PATCH(request: Request) {
  await dbConnect();

  try {
    const { creditId } = await request.json();

    if (!creditId) {
      return new NextResponse(JSON.stringify({ message: 'creditId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const credit = await Credit.findById(creditId);
    if (!credit) {
      return new NextResponse(JSON.stringify({ message: 'Credit record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validation
    if (credit.status === 'cleared') {
      return new NextResponse(JSON.stringify({ message: 'Cannot extend a cleared credit.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (credit.extensionsUsed >= MAX_EXTENSIONS) {
      return new NextResponse(JSON.stringify({ message: 'Maximum number of extensions have already been used.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Apply extension
    credit.extensionsUsed += 1;
    const newDueDate = new Date(credit.dueDate.getTime() + EXTENSION_DAYS * 24 * 60 * 60 * 1000);
    credit.dueDate = newDueDate;
    credit.status = 'extended';

    await credit.save();

    return new NextResponse(JSON.stringify({
      message: 'Extension granted successfully.',
      newDueDate: newDueDate.toISOString(),
      extensionsRemaining: MAX_EXTENSIONS - credit.extensionsUsed,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error processing credit extension:', error);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
