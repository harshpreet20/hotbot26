"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#e2e8f0",
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
      } else {
        router.push("/portal/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.3px",
              marginBottom: 6,
            }}
          >
            HotBot Studios
          </div>
          <div style={{ fontSize: 14, color: "#94a3b8" }}>Client Portal</div>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "32px 28px",
          }}
        >
          <h1
            style={{
              margin: "0 0 24px 0",
              fontSize: 18,
              fontWeight: 600,
              color: "#f1f5f9",
            }}
          >
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                style={{
                  ...inputStyle,
                  borderColor: focusedField === "email" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                style={{
                  ...inputStyle,
                  borderColor: focusedField === "password" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "11px 20px",
                background: loading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                borderRadius: 10,
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
          Need access? Contact your account manager.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
