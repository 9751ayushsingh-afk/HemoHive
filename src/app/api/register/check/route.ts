import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { field, value } = await request.json();

        if (!field || !value) {
            return NextResponse.json({ exists: false });
        }

        // Only allow checking unique fields
        const allowedFields = ['mobile', 'aadhaar', 'email'];
        if (!allowedFields.includes(field)) {
            return NextResponse.json({ exists: false });
        }

        const query: any = {};
        query[field] = value;

        const existingUser = await User.findOne(query);

        return NextResponse.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Check Existence Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
