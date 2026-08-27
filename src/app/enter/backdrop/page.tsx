"use client";
import Image from "next/image";
import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

function BackdropLoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [username, setUsername]     = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [notice, setNotice]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(true);

  // Reset-password modal state
  const [showReset, setShowReset]   = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg]     = useState("");
  const [resetErr, setResetErr]     = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const userRef  = useRef<HTMLInputElement>(null);
  const resetRef = useRef<HTMLInputElement>(null);

  // If Auth.js session is active, redirect immediately
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/enter/backdrop/dashboard");
    }
  }, [status, session, router]);

  // ── Session check — cookie authoritative, sessionStorage for display only ──
  async function checkSession(showFormOnFail = true) {
    try {
      const res  = await fetch("/api/blog/auth", { credentials: "same-origin" });
      const data = await res.json() as {
        authenticated?: boolean;
        token?: string;
        role?: string;
        username?: string;
      };
      if (data.authenticated && data.token) {
        sessionStorage.setItem("backdrop_secret", data.token);
        if (data.role)     sessionStorage.setItem("backdrop_role",     data.role);
        if (data.username) sessionStorage.setItem("backdrop_username", data.username);
        router.replace("/enter/backdrop/dashboard");
        return;
      }
    } catch { /* network error — fall through */ }

    if (showFormOnFail) {
      setChecking(false);
      setTimeout(() => userRef.current?.focus(), 50);
    }
  }

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setNotice("Email verified! Your access request is pending administrator approval.");
    }
    // Only fall back to legacy session check if Auth.js hasn't loaded yet
    if (status === "unauthenticated") {
      checkSession(true);
    } else if (status === "loading") {
      // Wait for Auth.js status
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible" && status === "unauthenticated") {
        checkSession(false);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [router, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login submit ──────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      // Try Auth.js signIn first (JWT-based, stateless)
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result && !result.error) {
        router.replace("/enter/backdrop/dashboard");
        return;
      }

      // Fall back to legacy session endpoint (sets backdrop_auth cookie)
      const res  = await fetch("/api/blog/auth", {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      let data: { success: boolean; token?: string; role?: string; username?: string; error?: string };
      try { data = await res.json() as typeof data; }
      catch {
        setError(`Server error (HTTP ${res.status}). Please try again.`);
        setPassword("");
        return;
      }
      if (!res.ok || !data.success || !data.token) {
        setError(data.error || result?.error || "Something went wrong. Please try again.");
        setPassword("");
        return;
      }
      sessionStorage.setItem("backdrop_secret", data.token);
      if (data.role)     sessionStorage.setItem("backdrop_role",     data.role);
      if (data.username) sessionStorage.setItem("backdrop_username", data.username);
      router.replace("/enter/backdrop/dashboard");
    } catch {
      setError("Connection error. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Password reset ────────────────────────────────────────────────────────
  function openReset() {
    setResetEmail(username); // pre-fill with whatever's in the email field
    setResetMsg("");
    setResetErr("");
    setShowReset(true);
    setTimeout(() => resetRef.current?.focus(), 80);
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) { setResetErr("Enter your email address."); return; }
    setResetLoading(true);
    setResetErr("");
    setResetMsg("");
    try {
      const res  = await fetch("/api/blog/auth/reset", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      if (data.success) {
        setResetMsg(data.message ?? "Reset email sent. Check your inbox.");
      } else {
        setResetErr(data.error ?? "Failed to send reset email.");
      }
    } catch {
      setResetErr("Connection error. Try again.");
    } finally {
      setResetLoading(false);
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border:     "1px solid rgba(255,255,255,0.12)",
    outline:    "none",
    transition: "border-color 0.15s",
  };
  const focusStyle = { borderColor: "rgba(99,102,241,0.6)" };
  const blurStyle  = { borderColor: "rgba(255,255,255,0.12)" };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
        <svg className="animate-spin h-7 w-7 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%), #0a0e1a" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 mx-auto"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <Image src="/logos/hotbot-logo.svg" alt="HotBot Studios" width={40} height={40} className="object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Backdrop</h1>
          <p className="text-slate-500 text-xs mt-0.5">HotBot Studios · Admin</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate className="rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>

          <div>
            <label htmlFor="username" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              ref={userRef} id="username" type="email" autoComplete="email"
              value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
              style={inputStyle} placeholder="you@example.com"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              id="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
              style={inputStyle} placeholder="••••••••"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
            />
          </div>

          {notice && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm text-emerald-400"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
              <span className="shrink-0 mt-0.5 text-xs">✓</span>
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <span className="shrink-0 mt-0.5 text-xs">⚠</span>
              <div className="space-y-1">
                <span>{error}</span>
                {(error.includes("Invalid email or password") || error.includes("invalid")) && (
                  <p className="text-red-500 text-xs">
                    Wrong password?{" "}
                    <button type="button" onClick={openReset}
                      className="underline underline-offset-2 hover:text-red-300 transition-colors">
                      Send reset email
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: loading ? "#4f46e5" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 24px rgba(99,102,241,0.3)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center">
          <p className="text-slate-600 text-xs">
            <button type="button" onClick={openReset}
              className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2">
              Forgot password?
            </button>
          </p>
          <p className="text-slate-700 text-xs">
            Don&apos;t have access?{" "}
            <a href="/enter/backdrop/register" className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2">
              Request access
            </a>
          </p>
        </div>
      </div>

      {/* ── Password reset modal ─────────────────────────────────────────────── */}
      {showReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReset(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.12)" }}>

            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">Reset Password</h2>
              <button onClick={() => setShowReset(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-slate-400 text-sm">
              Enter your account email. We&apos;ll send a password reset link.
            </p>

            <form onSubmit={handleReset} className="space-y-3">
              <input
                ref={resetRef} type="email" value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com" disabled={resetLoading}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", outline: "none" }}
              />

              {resetErr && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <span>⚠</span> {resetErr}
                </p>
              )}
              {resetMsg && (
                <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                  <span>✓</span> {resetMsg}
                </p>
              )}

              <button type="submit" disabled={resetLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                {resetLoading ? "Sending…" : "Send Reset Email"}
              </button>
            </form>

            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              <p className="text-slate-600 text-xs font-medium uppercase tracking-wider">Can&apos;t access your email?</p>
              <p className="text-slate-600 text-xs">
                Contact your administrator to reset your account via the{" "}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  Supabase Dashboard
                </a>
                {" "}→ Authentication → Users.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BackdropLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
        <svg className="animate-spin h-7 w-7 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    }>
      <BackdropLoginContent />
    </Suspense>
  );
}
