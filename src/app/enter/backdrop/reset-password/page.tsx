"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash: #access_token=...&type=recovery
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    const type  = params.get("type");
    if (token && type === "recovery") {
      setAccessToken(token);
    } else if (token) {
      // Some Supabase configs don't include type — accept any token
      setAccessToken(token);
    } else {
      setTokenMissing(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/blog/auth/set-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body:    JSON.stringify({ accessToken, newPassword: password }),
      });
      const data = await res.json() as { success?: boolean; error?: string; token?: string; role?: string; username?: string };
      if (!res.ok || !data.success) { setError(data.error || "Failed to update password. The link may have expired."); return; }
      if (data.token) {
        sessionStorage.setItem("backdrop_secret",  data.token);
        if (data.role)     sessionStorage.setItem("backdrop_role",     data.role);
        if (data.username) sessionStorage.setItem("backdrop_username", data.username);
      }
      setSuccess(true);
      setTimeout(() => router.replace("/enter/backdrop/dashboard"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
  };
  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 14,
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#070b17", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <Image src="/logos/brand-logo.png" alt="HotBot Studios" width={48} height={48} style={{ borderRadius: 12, marginBottom: 12 }} />
        <p style={{ color: "#475569", fontSize: 13 }}>Backdrop Dashboard</p>
      </div>

      <div style={cardStyle}>
        {tokenMissing ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 16 }}>This reset link is invalid or has already been used.</p>
            <a href="/enter/backdrop" style={{ color: "#3b82f6", fontSize: 14 }}>Back to login</a>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#22c55e18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
            <p style={{ color: "#22c55e", fontWeight: 600, marginBottom: 8 }}>Password updated!</p>
            <p style={{ color: "#475569", fontSize: 13 }}>Redirecting to dashboard…</p>
          </div>
        ) : (
          <>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Set new password</h1>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 28 }}>Enter a new password for your account.</p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 6 }}>New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 6 }}>Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  style={inputStyle}
                />
              </div>
              {error && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading || !accessToken}
                style={{
                  marginTop: 4,
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "none",
                  background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
