"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function VerifyPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setErrMsg("No token found. Please check your email link.");
      setStatus("error");
      return;
    }
    // Redirect to the API route which sets the cookie and redirects
    window.location.href = `/api/customers/auth/verify?token=${encodeURIComponent(token)}`;
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%), #0a0a0f",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <Image src="/logos/brand-logo.png" alt="HotBot Studios" width={140} height={36} style={{ objectFit: "contain", marginBottom: 32 }} />

        {status === "loading" ? (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(99,102,241,0.3)",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Signing you in…</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Just a moment while we verify your link.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Link expired</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{errMsg}</p>
            <a
              href="/customers"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: "#6366f1",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Request a new sign-in link
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0a0a0f", minHeight: "100vh" }} />}>
      <VerifyPageInner />
    </Suspense>
  );
}
