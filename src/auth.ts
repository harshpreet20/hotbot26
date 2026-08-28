/**
 * Auth.js v5 configuration.
 *
 * Provides a JWT-based session that works correctly across Vercel's
 * serverless instances (no database lookup per request at the edge).
 *
 * The Credentials provider reuses the existing Supabase Auth / bcrypt
 * verification logic so the login behaviour is unchanged.
 *
 * Env vars required:
 *   AUTH_SECRET          — 32-char random string for JWT signing (mandatory)
 *   SUPABASE_URL         — Supabase project URL (optional, enables Supabase Auth)
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service-role key (optional)
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { getUserByUsername, getEnvFallbackUser, BOOTSTRAP_USER } from "@/lib/adminStore";
import type { Role } from "@/types/dashboard";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = ((credentials?.username as string) ?? "").trim();
        const password = ((credentials?.password as string) ?? "").trim();
        if (!username || !password) return null;

        if (isSupabaseEnabled()) {
          try {
            return await authorizeViaSupabase(username, password);
          } catch (err) {
            console.error("[auth] Supabase authorize failed, trying bcrypt fallback:", err instanceof Error ? err.message : err);
            return authorizeViaBcrypt(username, password);
          }
        }
        return authorizeViaBcrypt(username, password);
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId   = (user as { id?: string }).id ?? "";
        token.role     = (user as { role?: string }).role as Role;
        token.username = (user as { username?: string }).username ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id       = (token.userId as string) ?? "";
      session.user.role     = token.role as Role;
      session.user.username = token.username as string;
      return session;
    },
  },

  pages: {
    signIn: "/enter/backdrop",
  },

  session: {
    strategy:   "jwt",
    maxAge:     30 * 24 * 60 * 60, // 30 days
    updateAge:  24 * 60 * 60,      // refresh daily
  },
});

// ── Credential verification helpers ──────────────────────────────────────────

async function authorizeViaSupabase(username: string, password: string) {
  const loginEmail = username.includes("@") ? username : `${username}@hotbotstudios.internal`;
  const { data, error } = await sb().auth.signInWithPassword({ email: loginEmail, password });
  if (error || !data?.user) return null;

  const { data: userRow } = await sb()
    .from("backdrop_users")
    .select("id, email, username, role, status")
    .eq("id", data.user.id)
    .single();

  if (!userRow || userRow.status !== "approved") return null;

  return {
    id:       userRow.id as string,
    username: (userRow.username as string) || (userRow.email as string).split("@")[0],
    role:     userRow.role as Role,
    email:    userRow.email as string,
  };
}

async function authorizeViaBcrypt(username: string, password: string) {
  const { default: bcrypt } = await import("bcryptjs");
  const envUser = getEnvFallbackUser();
  let user = envUser?.username.toLowerCase() === username.toLowerCase()
    ? envUser
    : await getUserByUsername(username);

  if (!user || user.username.toLowerCase() !== username.toLowerCase()) return null;

  let ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok && user.username.toLowerCase() === BOOTSTRAP_USER.username.toLowerCase()) {
    ok = await bcrypt.compare(password, BOOTSTRAP_USER.passwordHash);
    if (ok) user = BOOTSTRAP_USER;
  }
  if (!ok) return null;

  return {
    id:       user.id,
    username: user.username,
    role:     user.role as Role,
    email:    `${user.username}@hotbotstudios.internal`,
  };
}
