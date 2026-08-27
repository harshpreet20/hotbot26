"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ImpersonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams.get("t");
    if (!t) {
      router.replace("/portal/login?error=expired");
      return;
    }

    fetch(`/api/portal/impersonate?t=${encodeURIComponent(t)}`)
      .then((res) => {
        if (res.ok) {
          router.replace("/portal/dashboard");
        } else {
          router.replace("/portal/login?error=expired");
        }
      })
      .catch(() => {
        router.replace("/portal/login?error=expired");
      });
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.2)",
            borderTopColor: "#ffffff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ margin: 0, fontSize: 16, opacity: 0.8 }}>Signing in…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
