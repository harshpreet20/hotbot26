import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByUsername, updateUser } from "./db";
import { logActivity } from "./activity";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await getUserByUsername(credentials.username);
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        await updateUser(user.id, { last_login_at: new Date().toISOString() });

        await logActivity({
          userId: user.id,
          action: "login",
          details: { username: user.username },
        });

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role as "super_admin" | "admin",
          displayName: user.display_name || undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.role = user.role;
        token.displayName = user.displayName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        username: token.username,
        role: token.role,
        displayName: token.displayName,
        email: token.email,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
