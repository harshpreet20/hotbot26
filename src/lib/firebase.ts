/**
 * Firebase stub — Firebase has been removed in favour of Supabase Auth.
 * All functions return false/null so callers that still reference this
 * module compile cleanly and fall through to the Supabase path.
 */
import type { Role } from "@/types/dashboard";

export function isFirebaseEnabled(): boolean { return false; }

// Kept so existing imports don't break at compile time
export function fbAuth(): never {
  throw new Error("Firebase is not configured. Use Supabase auth.");
}

export function toFirebaseEmail(username: string): string {
  return `${username.toLowerCase()}@hotbotstudios.internal`;
}

export function resolveLoginEmail(identifier: string): string {
  return identifier.includes("@") ? identifier : toFirebaseEmail(identifier);
}

export type FirebaseAuthSuccess = { ok: true; uid: string; email: string; role: Role };
export type FirebaseAuthFailure = {
  ok: false;
  code: "NO_API_KEY" | "NETWORK_ERROR" | "TIMEOUT" | "API_KEY_INVALID" |
        "INVALID_CREDENTIALS" | "USER_NOT_FOUND" | "USER_DISABLED" |
        "TOO_MANY_ATTEMPTS" | "FIREBASE_ADMIN_ERROR" | "UNKNOWN";
  raw?: string;
};
export type FirebaseAuthResult = FirebaseAuthSuccess | FirebaseAuthFailure;

export async function verifyFirebasePassword(): Promise<FirebaseAuthResult> {
  return { ok: false, code: "NO_API_KEY", raw: "Firebase removed" };
}
