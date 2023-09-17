import NextAuth, { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import { FirestoreAdapter } from "@auth/firebase-adapter";

import GitHub from 'next-auth/providers/github'
import { cert } from "firebase-admin/app";

export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter({
    namingStrategy: "snake_case",
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    })
  }) as Adapter,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
