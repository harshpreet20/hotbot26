"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BackdropLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/publish?secret=${encodeURIComponent(secret)}`);
      if (res.ok) {
        // Store secret in sessionStorage for subsequent API calls
        sessionStorage.setItem("backdrop_secret", secret);
        router.push("/backdrop/dashboard");
      } else {
        setError("Invalid secret. Try again.");
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            ✦
          </div>
          <h1 className="text-xl font-bold text-white">Backdrop</h1>
          <p className="text-slate-400 text-sm mt-1">HotBot Studios Blog Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Publish Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your publish secret"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            {loading ? "Verifying…" : "Enter Backdrop"}
          </button>
        </form>
      </div>
    </div>
  );
}
