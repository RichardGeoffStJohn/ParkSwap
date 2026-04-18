import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          hasAccessibleSpot: user.hasAccessibleSpot,
          isAdmin: user.isAdmin,
          unitNumber: user.unitNumber,
          spotIdentifier: user.spotIdentifier,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as {
          hasAccessibleSpot: boolean;
          isAdmin: boolean;
          unitNumber: string;
          spotIdentifier: string | null;
        };
        token.hasAccessibleSpot = u.hasAccessibleSpot;
        token.isAdmin = u.isAdmin;
        token.unitNumber = u.unitNumber;
        token.spotIdentifier = u.spotIdentifier;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.sub as string;
      session.user.hasAccessibleSpot = token.hasAccessibleSpot as boolean;
      session.user.isAdmin = token.isAdmin as boolean;
      session.user.unitNumber = token.unitNumber as string;
      session.user.spotIdentifier = (token.spotIdentifier as string | null) ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
