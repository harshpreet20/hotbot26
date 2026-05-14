/**
 * Public Firebase config diagnostic — returns whether Firebase is reachable
 * and whether env vars are present, WITHOUT exposing secrets.
 *
 * Usage: GET /api/blog/auth/configcheck
 * Safe to call from the login page to diagnose setup issues.
 */
import { NextResponse } from "next/server";
import { isFirebaseEnabled } from "@/lib/firebase";

export async function GET() {
  const hasApiKey     = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const hasProjectId  = !!process.env.FIREBASE_PROJECT_ID;
  const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  const hasEmail      = !!process.env.FIREBASE_CLIENT_EMAIL;
  const projectId     = process.env.FIREBASE_PROJECT_ID ?? null;

  // Test whether the Firebase REST API is reachable with this API key
  let restReachable  = false;
  let restError: string | null = null;

  if (hasApiKey) {
    try {
      // Use accounts:lookup with a fake UID — will return 400 "INVALID_IDENTIFIER"
      // which is fine; it means the key is valid and Firebase responded.
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ idToken: "test" }),
          signal:  AbortSignal.timeout(5_000),
        },
      );
      const data = await res.json() as { error?: { message?: string } };
      const msg  = data.error?.message ?? "";

      // Any response other than "API key invalid" means Firebase is reachable
      if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
        restReachable = false;
        restError     = "API_KEY_INVALID — the key in NEXT_PUBLIC_FIREBASE_API_KEY does not match any Firebase project";
      } else {
        // "INVALID_ID_TOKEN" or similar = key is valid, Firebase responded
        restReachable = true;
      }
    } catch (err) {
      restError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    firebase_mode_enabled:  isFirebaseEnabled(),
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: hasApiKey  ? "✓ set" : "✗ MISSING",
      FIREBASE_PROJECT_ID:          hasProjectId  ? "✓ set" : "✗ MISSING",
      FIREBASE_PRIVATE_KEY:         hasPrivateKey ? "✓ set" : "✗ MISSING",
      FIREBASE_CLIENT_EMAIL:        hasEmail      ? "✓ set" : "✗ MISSING",
    },
    project_id:        projectId,
    rest_api_reachable: restReachable,
    rest_error:         restError,
    diagnosis: !hasApiKey
      ? "NEXT_PUBLIC_FIREBASE_API_KEY is missing. Add it in Vercel → Settings → Environment Variables."
      : !isFirebaseEnabled()
      ? "One or more FIREBASE_* admin vars are missing. Add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL."
      : !restReachable
      ? `Firebase REST API unreachable: ${restError}`
      : "Firebase is configured correctly. Login failures are credential errors (wrong email/password) or the account does not exist in this project.",
  });
}
