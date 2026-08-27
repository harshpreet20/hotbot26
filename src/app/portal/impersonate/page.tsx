"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ImpersonateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    const t = searchParams.get("t");
    if (!t) {
      router.replace("/portal/login?error=expired");
      return;
    }
    hasFired.current = true;

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

  return null;
}

const spinnerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0a0e1a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontFamily: "sans-serif",
};

function Spinner() {
  return (
    <div style={spinnerStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width:40, height:40, border:"3px solid rgba(255,255,255,0.2)", borderTopColor:"#ffffff", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ margin:0, fontSize:16, opacity:0.8 }}>Signing in…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Spinner />
      <ImpersonateInner />
    </Suspense>
  );
}
