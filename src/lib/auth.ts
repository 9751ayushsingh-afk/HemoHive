import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';

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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await User.findOne({ email: credentials.email });

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            hospitalId: user.hospitalId?.toString(), // Ensure hospitalId is included
            bloodGroup: user.bloodGroup,
            createdAt: user.createdAt,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
        token.profilePicture = user.profilePicture;
        token.hospitalId = user.hospitalId; // Add hospitalId to the token
        token.bloodGroup = user.bloodGroup;
        token.createdAt = user.createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
        session.user.profilePicture = token.profilePicture as string;
        session.user.hospitalId = token.hospitalId as string; // Add hospitalId to the session
        session.user.bloodGroup = token.bloodGroup as string;
        session.user.createdAt = token.createdAt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
