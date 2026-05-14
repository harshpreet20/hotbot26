"use client";
import { useEffect } from "react";

export default function BackdropError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BackdropError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-3" style={{ background: "#0f172a", color: "white" }}>
      <h2 className="text-xl font-bold">Dashboard error</h2>
      <p className="text-slate-400 text-sm max-w-xs">
        Something went wrong in the dashboard. Your data is safe.
      </p>
      <button
        onClick={reset}
        className="mt-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
      >
        Reload
      </button>
    </div>
  );
}
