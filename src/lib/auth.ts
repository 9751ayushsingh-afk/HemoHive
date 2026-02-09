import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface AuthPayload {
  id: string;
  role: 'hospital' | 'admin' | 'donor';
  hospitalId?: string;
  [key: string]: any;
}

interface AuthResult {
  user: AuthPayload | null;
  error?: string;
}

export async function getAuth(request: NextRequest): Promise<AuthResult> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return { user: null, error: 'No token found or token is invalid' };
  }

  // The token payload from next-auth/jwt already has the user data from the jwt callback
  return { user: token as AuthPayload };
}
