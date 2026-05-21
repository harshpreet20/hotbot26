"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function SetupPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!token) setError("Missing invitation token. Please use the link from your email.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/customers/auth/setup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password, name: name.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Setup failed"); return; }
      router.replace("/customers/dashboard");
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Image src="/logos/brand-logo.png" alt="HotBot Studios" width={140} height={36} style={{ objectFit: "contain", margin: "0 auto" }} />
        </div>

        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" }}>
          Set up your account
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "#64748b", textAlign: "center" }}>
          Create a password to access your client portal.
        </p>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              autoComplete="name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14, position: "relative" }}>
            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, padding: 0 }}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Confirm Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
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
            }}
          >
            {loading ? "Setting up…" : "Create Account & Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0a0a0f", minHeight: "100vh" }} />}>
      <SetupPageInner />
    </Suspense>
  );
}
