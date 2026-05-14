/**
 * Firebase Admin SDK singleton.
 * Active only when FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL are set.
 * Falls back gracefully to legacy bcrypt/Supabase auth when not configured.
 */
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Role } from "@/types/dashboard";

export function isFirebaseEnabled(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  );
}

function initApp() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    }),
  });
}

export function fbAuth() {
  initApp();
  return getAuth();
}

/**
 * Maps a bare username to the internal Firebase email format.
 * Used only for users created via the admin dashboard (not self-registered).
 */
export function toFirebaseEmail(username: string): string {
  return `${username.toLowerCase()}@hotbotstudios.internal`;
}

/**
 * Resolves a login identifier (email or username) to a Firebase email.
 * - If it contains "@": used as-is (real email, e.g. harshpreet@hotbotstudios.com)
 * - Otherwise: treated as username, mapped to username@hotbotstudios.internal
 */
export function resolveLoginEmail(identifier: string): string {
  return identifier.includes("@") ? identifier : toFirebaseEmail(identifier);
}

// ── Typed result from verifyFirebasePassword ─────────────────────────────────

export type FirebaseAuthSuccess = { ok: true; uid: string; email: string; role: Role };

export type FirebaseAuthFailure = {
  ok: false;
  code:
    | "NO_API_KEY"
    | "NETWORK_ERROR"
    | "TIMEOUT"
    | "API_KEY_INVALID"
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "USER_DISABLED"
    | "TOO_MANY_ATTEMPTS"
    | "FIREBASE_ADMIN_ERROR"
    | "UNKNOWN";
  raw?: string;
};

export type FirebaseAuthResult = FirebaseAuthSuccess | FirebaseAuthFailure;

function mapFirebaseErrorCode(msg: string): FirebaseAuthFailure["code"] {
  if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid"))
    return "API_KEY_INVALID";
  if (msg.includes("EMAIL_NOT_FOUND"))
    return "USER_NOT_FOUND";
  if (msg.includes("INVALID_PASSWORD") || msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("INVALID_EMAIL"))
    return "INVALID_CREDENTIALS";
  if (msg.includes("USER_DISABLED"))
    return "USER_DISABLED";
  if (msg.includes("TOO_MANY_ATTEMPTS") || msg.includes("QUOTA_EXCEEDED"))
    return "TOO_MANY_ATTEMPTS";
  return "UNKNOWN";
}

/**
 * Verify login credentials against Firebase Auth REST API.
 * Returns a typed result — check `.ok` before using `.uid/.email/.role`.
 * Requires NEXT_PUBLIC_FIREBASE_API_KEY env var.
 */
export async function verifyFirebasePassword(
  identifier: string,
  password: string,
): Promise<FirebaseAuthResult> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    console.error("[firebase] NEXT_PUBLIC_FIREBASE_API_KEY is not set — add it to Vercel env vars");
    return { ok: false, code: "NO_API_KEY" };
  }

  const email = resolveLoginEmail(identifier);
  let res: Response;
  try {
    res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailAndPassword?key=${apiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, returnSecureToken: true }),
        signal:  AbortSignal.timeout(10_000),
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.includes("timeout") || msg.includes("TimeoutError") ? "TIMEOUT" : "NETWORK_ERROR";
    console.error(`[firebase] REST fetch failed (${code}):`, msg);
    return { ok: false, code, raw: msg };
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as { error?: { message?: string } };
    const raw = errBody?.error?.message ?? "unknown";
    const code = mapFirebaseErrorCode(raw);
    console.error(`[firebase] signIn rejected [${code}]: HTTP ${res.status} — ${raw}`);
    return { ok: false, code, raw };
  }

  const data = await res.json() as { localId?: string };
  const uid = data.localId;
  if (!uid) {
    console.error("[firebase] signIn OK but localId missing — unexpected Firebase response");
    return { ok: false, code: "UNKNOWN", raw: "localId missing" };
  }

  try {
    const fbUser = await fbAuth().getUser(uid);
    const claims = fbUser.customClaims as Record<string, string> | null;
    const role   = (claims?.role as Role) ?? "agent";
    return { ok: true, uid, email, role };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[firebase] Admin SDK getUser failed:", msg);
    return { ok: false, code: "FIREBASE_ADMIN_ERROR", raw: msg };
  }
}
