"use client";
import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SiteError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-4" style={{ background: "#0a0e1a" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="text-slate-400 max-w-sm">
        An unexpected error occurred. Please try again or contact us at{" "}
        <a href="mailto:info@hotbotstudios.com" className="text-blue-400 underline">
          info@hotbotstudios.com
        </a>
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
      >
        Try again
      </button>
    </div>
  );
}
