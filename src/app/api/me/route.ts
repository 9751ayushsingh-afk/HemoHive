import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    await dbConnect();

    try {
        const token = cookies().get('token')?.value;

        if (!token) {
            return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in the environment variables.');
        }

        const decoded = jwt.verify(token, jwtSecret) as { id: string };

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return new NextResponse(JSON.stringify({ message: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new NextResponse(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Me Endpoint Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return new NextResponse(JSON.stringify({ message: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
