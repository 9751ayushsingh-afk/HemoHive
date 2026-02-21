import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getToken } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from './dbConnect';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';

interface AuthPayload {
  id: string;
  role: 'hospital' | 'admin' | 'donor' | 'driver';
  hospitalId?: string;
  fullName?: string;
  profilePicture?: string;
  bloodGroup?: string;
  createdAt?: string;
  sessionId?: string;
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

  return { user: token as unknown as AuthPayload };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
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

        if (user && user.password && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            hospitalId: user.hospitalId?.toString(),
            bloodGroup: user.bloodGroup,
            createdAt: user.createdAt?.toISOString(),
          };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create a donor profile for new Google users
          await User.create({
            fullName: user.name,
            email: user.email,
            role: 'donor',
            profilePicture: user.image,
            status: 'Approved', // Auto-approve Google users for now or set based on your policy
            bloodGroup: 'Unknown',
            gender: 'Other',
            dob: new Date(0),
            mobile: '0000000000',
            aadhaar: '000000000000',
            address: 'Pending Completion',
            city: 'Pending',
            state: 'Pending',
            pincode: '000000',
            agreeTerms: true,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      await dbConnect();

      // If this is a login, user object will be present (initial trigger)
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          // Generate a new unique session ID for this login instance
          const newSid = crypto.randomBytes(16).toString('hex');

          console.log(`[AUTH-DEBUG] NEW LOGIN: ${dbUser.email} | Generating SID: ${newSid}`);

          // Lock this SID into the database
          const updateResult = await User.updateOne(
            { _id: dbUser._id },
            { $set: { currentSessionId: newSid } }
          );

          console.log(`[AUTH-DEBUG] DB UPDATE RESULT:`, updateResult);

          token.id = dbUser._id.toString();
          token.email = dbUser.email; // Crucial: preserve email
          token.role = dbUser.role;
          token.fullName = dbUser.fullName;

          // Special case: For hospitals, try to get the actual hospital name
          if (dbUser.role === 'hospital' && dbUser.hospitalId) {
            const Hospital = (await import('../models/Hospital')).default;
            const hospitalDoc = await Hospital.findById(dbUser.hospitalId);
            if (hospitalDoc) {
              token.fullName = hospitalDoc.name;
            }
          }

          token.profilePicture = dbUser.profilePicture;
          token.hospitalId = dbUser.hospitalId?.toString();
          token.bloodGroup = dbUser.bloodGroup;
          token.createdAt = dbUser.createdAt?.toISOString();
          token.sessionId = newSid;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        await dbConnect();

        // Fetch user document to check its state
        const dbUser = (await User.findById(token.id).lean()) as any;

        const dbSid = dbUser?.currentSessionId;
        const browserSid = token.sessionId as string;
        const userEmail = dbUser?.email || token.email || 'Unknown';

        console.log(`[AUTH-LOCK] SYNC: ${userEmail} | BrowserSID: ${browserSid} | DBSID: ${dbSid}`);

        // SELF-HEALING: If DB SID is missing but Browser has one, sync it!
        if (dbUser && browserSid && !dbSid) {
          console.warn(`[AUTH-LOCK] Syncing missing DBSID for ${userEmail}...`);
          await User.findByIdAndUpdate(token.id, { $set: { currentSessionId: browserSid } });
        }
        // REAL OVERRIDE: Both exist but mismatch
        else if (dbUser && browserSid && dbSid && dbSid !== browserSid) {
          console.log(`[AUTH-LOCK] !!! OVERRIDE DETECTED !!! for ${userEmail}`);
          (session as any).error = 'SESSION_OVERRIDDEN';
        }

        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
        session.user.name = token.fullName as string;
        session.user.profilePicture = token.profilePicture as string;
        session.user.hospitalId = token.hospitalId as string;
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
