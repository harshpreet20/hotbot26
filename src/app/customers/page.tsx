"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function CustomerLoginPageInner() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const [mode, setMode]         = useState<"password" | "magic">("password");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "expired")       setError("This link has expired. Request a new one below.");
    if (err === "invalid_token") setError("Invalid or already-used link. Request a new one below.");
    if (err === "inactive")      setError("Your account is inactive. Contact your account manager.");
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/customers/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Sign in failed"); return; }
      router.replace("/customers/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/customers/auth/magic", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to send link"); return; }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%), #0a0a0f",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "36px 32px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Image
            src="/logos/brand-logo.png"
            alt="HotBot Studios"
            width={140}
            height={36}
            style={{ objectFit: "contain", margin: "0 auto" }}
          />
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#fff" }}>
              Check your email
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
              We sent a sign-in link to <strong style={{ color: "#e2e8f0" }}>{email}</strong>.
              Click the link in your email to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); setMode("password"); }}
              style={{
                fontSize: 13,
                color: "#6366f1",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" }}>
              Welcome back
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#64748b", textAlign: "center" }}>
              Sign in to your client portal
            </p>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            {mode === "password" ? (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 20, position: "relative" }}>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>
                    Password
                  </label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 32,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: loading ? "rgba(99,102,241,0.5)" : "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                    marginBottom: 16,
                  }}
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>

                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setMode("magic"); setError(""); setPassword(""); }}
                    style={{ fontSize: 13, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Sign in with magic link instead
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("magic"); setError(""); setPassword(""); }}
                    style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMagic}>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>
                  Enter your email and we will send you a one-click sign-in link.
                </p>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: loading ? "rgba(99,102,241,0.5)" : "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    marginBottom: 16,
                  }}
                >
                  {loading ? "Sending…" : "Send Magic Link"}
                </button>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => { setMode("password"); setError(""); }}
                    style={{ fontSize: 13, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Sign in with password instead
                  </button>
                </div>
              </form>
            )}

            <p style={{ marginTop: 28, fontSize: 12, color: "#475569", textAlign: "center" }}>
              Access is by invitation only.{" "}
              <a href="https://hotbotstudios.com" style={{ color: "#6366f1", textDecoration: "none" }}>
                hotbotstudios.com
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0a0a0f", minHeight: "100vh" }} />}>
      <CustomerLoginPageInner />
    </Suspense>
  );
}
