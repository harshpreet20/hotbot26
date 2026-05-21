"use client";
import { useState, FormEvent } from "react";
import Image from "next/image";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json() as { error?: string };
        if (res.status === 404) {
          setError("No account found with this email address.");
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "48px 40px",
        maxWidth: "440px",
        width: "100%",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Image
            src="/logos/brand-logo.png"
            alt="HotBot Studios"
            width={160}
            height={40}
            style={{ objectFit: "contain", margin: "0 auto 20px" }}
          />
          <h1 style={{
            margin: "0 0 8px",
            fontSize: "22px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.3px",
          }}>
            Customer Invoice Portal
          </h1>
          <p style={{
            margin: 0,
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: 1.6,
          }}>
            Enter your email to receive a secure access link
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "#22c55e",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "22px",
            }}>
              ✓
            </div>
            <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#166534", fontSize: "16px" }}>
              Check your email
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#15803d", lineHeight: 1.6 }}>
              We&apos;ve sent a magic link to <strong>{email}</strong>. Click it to access your invoices. The link expires in 24 hours.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              style={{
                marginTop: "20px",
                background: "none",
                border: "none",
                color: "#6366f1",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
              }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: error ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "15px",
                  color: "#111827",
                  background: "#f9fafb",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                onBlur={(e) => { e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb"; }}
              />
            </div>

            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
              }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#dc2626", lineHeight: 1.5 }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "#a5b4fc" : "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                letterSpacing: "0.2px",
              }}
            >
              {loading ? "Sending..." : "Send Access Link"}
            </button>
          </form>
        )}

        <p style={{
          marginTop: "28px",
          fontSize: "12px",
          color: "#9ca3af",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          Your access link is valid for 24 hours and can only be used once.
          <br />
          <a
            href="/"
            style={{ color: "#6366f1", textDecoration: "none" }}
          >
            Return to HotBot Studios
          </a>
        </p>
      </div>
    </div>
  );
}
