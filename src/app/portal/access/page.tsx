"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function AccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("/api/portal/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.replace("/portal/dashboard"), 1200);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token, router]);

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
        textAlign: "center",
      }}>
        <Image
          src="/logos/brand-logo.png"
          alt="HotBot Studios"
          width={160}
          height={40}
          style={{ objectFit: "contain", margin: "0 auto 28px" }}
        />

        {status === "verifying" && (
          <>
            <div style={{
              width: "56px",
              height: "56px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#374151" }}>
              Verifying your link…
            </p>
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#9ca3af" }}>
              Please wait a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{
              width: "56px",
              height: "56px",
              background: "#22c55e",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "26px",
              color: "#fff",
            }}>
              ✓
            </div>
            <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#166534" }}>
              Access granted!
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              Redirecting you to your invoices…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{
              width: "56px",
              height: "56px",
              background: "#fef2f2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "26px",
            }}>
              ✕
            </div>
            <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#dc2626" }}>
              This link has expired
            </p>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>
              This access link is invalid or has already been used. Magic links can only be used once and expire after 24 hours.
            </p>
            <a
              href="/portal"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#6366f1",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Request a new link
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PortalAccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ color: "#fff", fontSize: "16px" }}>Loading…</div>
      </div>
    }>
      <AccessContent />
    </Suspense>
  );
}
