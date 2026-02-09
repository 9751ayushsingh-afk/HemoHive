
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            hospitalId?: string;
            bloodGroup?: string;
            createdAt?: string;
            fullName?: string;
            profilePicture?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        hospitalId?: string;
        bloodGroup?: string;
        createdAt?: string;
        fullName?: string;
        profilePicture?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        hospitalId?: string;
        bloodGroup?: string;
        createdAt?: string;
        fullName?: string;
        profilePicture?: string;
    }
}
