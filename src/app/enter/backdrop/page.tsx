// AUTH TEMPORARILY DISABLED — login screen bypassed, redirects straight to dashboard
// Restore by reverting this file
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BackdropLoginPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem("backdrop_secret",  "bypass");
    sessionStorage.setItem("backdrop_role",    "super_admin");
    sessionStorage.setItem("backdrop_username", "Admin");
    router.replace("/enter/backdrop/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
      <svg className="animate-spin h-7 w-7 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}
