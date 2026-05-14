/**
 * Auth diagnostics endpoint — protected by SETUP_SECRET.
 * Shows Firebase connectivity, user list with roles, and can test credentials.
 *
 * Usage:
 *   GET /api/blog/auth/debug?secret=YOUR_SETUP_SECRET
 *   GET /api/blog/auth/debug?secret=...&testEmail=you@gmail.com&testPass=yourpass
 */
import { NextRequest, NextResponse } from "next/server";
import { isFirebaseEnabled, fbAuth } from "@/lib/firebase";

export async function GET(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret || req.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result: Record<string, unknown> = {
    firebase_enabled:  isFirebaseEnabled(),
    has_api_key:       !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    project_id:        process.env.FIREBASE_PROJECT_ID ?? "(not set)",
    has_private_key:   !!process.env.FIREBASE_PRIVATE_KEY,
    has_client_email:  !!process.env.FIREBASE_CLIENT_EMAIL,
  };

  // ── Admin SDK check: list users ───────────────────────────────────────────
  if (isFirebaseEnabled()) {
    try {
      const list = await fbAuth().listUsers(50);
      result.admin_sdk = "ok";
      result.users = list.users.map((u) => ({
        uid:      u.uid,
        email:    u.email,
        disabled: u.disabled,
        role:     (u.customClaims as Record<string, unknown> | null)?.role ?? "(no role — will become super_admin on first login)",
        providers: u.providerData.map((p) => p.providerId),
      }));
    } catch (err) {
      result.admin_sdk       = "error";
      result.admin_sdk_error = err instanceof Error ? err.message : String(err);
    }
  }

  // ── REST API test (optional) ──────────────────────────────────────────────
  const testEmail = req.nextUrl.searchParams.get("testEmail");
  const testPass  = req.nextUrl.searchParams.get("testPass");
  const apiKey    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (testEmail && testPass && apiKey) {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailAndPassword?key=${apiKey}`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: testEmail, password: testPass, returnSecureToken: true }),
          signal:  AbortSignal.timeout(8_000),
        },
      );
      const data = await res.json() as Record<string, unknown>;
      if (res.ok) {
        result.rest_test = "SUCCESS — credentials are correct";
        result.rest_uid  = data.localId;
      } else {
        result.rest_test  = "FAILED";
        result.rest_error = (data as { error?: { message?: string } }).error?.message ?? "unknown";
        result.rest_hint  = getHint(result.rest_error as string);
      }
    } catch (err) {
      result.rest_test  = "error";
      result.rest_error = err instanceof Error ? err.message : String(err);
    }
  } else if (!testEmail) {
    result.rest_test = "Add ?testEmail=your@email.com&testPass=yourpass to test credentials";
  }

  return NextResponse.json(result, { status: 200 });
}

function getHint(error: string): string {
  if (error.includes("EMAIL_NOT_FOUND"))   return "No Firebase account with that email in this project";
  if (error.includes("INVALID_PASSWORD"))  return "Wrong password for this account";
  if (error.includes("USER_DISABLED"))     return "This account is disabled in Firebase Console";
  if (error.includes("INVALID_LOGIN_CREDENTIALS")) return "Wrong email or password";
  if (error.includes("TOO_MANY_ATTEMPTS")) return "Account temporarily locked — wait or reset password in Firebase Console";
  if (error.includes("API_KEY_INVALID"))   return "NEXT_PUBLIC_FIREBASE_API_KEY is wrong or from a different project";
  return "Check Firebase Console → Authentication → Users";
}
