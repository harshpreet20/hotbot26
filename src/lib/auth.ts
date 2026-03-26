import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
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

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", credentials.username)
          .eq("is_active", true)
          .single();

        if (error || !user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!valid) return null;

        // Update last login
        await supabase
          .from("users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);

        // Log login activity
        await logActivity({
          userId: user.id,
          action: "login",
          details: { username: user.username },
        });

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          displayName: user.display_name,
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
