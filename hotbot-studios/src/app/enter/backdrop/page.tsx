"use client";
import Image from "next/image";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function BackdropLoginPage() {
  const router = useRouter();
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [checking, setChecking]   = useState(true);
  const userRef = useRef<HTMLInputElement>(null);

  // Restore session from cookie if still valid, otherwise show login form.
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("backdrop_secret")) {
      router.replace("/enter/backdrop/dashboard");
      return;
    }

    fetch("/api/blog/auth")
      .then((r) => r.json() as Promise<{
        authenticated?: boolean;
        token?: string;
        role?: string;
        username?: string;
      }>)
      .then((data) => {
        if (data.authenticated && data.token) {
          sessionStorage.setItem("backdrop_secret", data.token);
          if (data.role)     sessionStorage.setItem("backdrop_role",     data.role);
          if (data.username) sessionStorage.setItem("backdrop_username", data.username);
          router.replace("/enter/backdrop/dashboard");
          return;
        }
        setChecking(false);
        setTimeout(() => userRef.current?.focus(), 50);
      })
      .catch(() => {
        setChecking(false);
        setTimeout(() => userRef.current?.focus(), 50);
      });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/blog/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      let data: { success: boolean; token?: string; role?: string; username?: string; error?: string };
      try {
        data = await res.json() as typeof data;
      } catch {
        setError(`Server error (${res.status}). Please try again.`);
        setPassword("");
        return;
      }

      if (!res.ok || !data.success || !data.token) {
        setError(data.error || "Something went wrong. Please try again.");
        setPassword("");
        return;
      }

      sessionStorage.setItem("backdrop_secret", data.token);
      if (data.role)     sessionStorage.setItem("backdrop_role", data.role);
      if (data.username) sessionStorage.setItem("backdrop_username", data.username);
      router.replace("/enter/backdrop/dashboard");
    } catch {
      setError("Connection error. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    transition: "border-color 0.15s",
  };
  const focusStyle = { borderColor: "rgba(99,102,241,0.6)" };
  const blurStyle  = { borderColor: "rgba(255,255,255,0.12)" };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
        <svg className="animate-spin h-7 w-7 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%), #0a0e1a" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo / brand */}
        <div className="text-center mb-5">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 mx-auto"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <Image
              src="/logos/hotbot-logo.svg"
              alt="HotBot Studios"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Backdrop</h1>
          <p className="text-slate-500 text-xs mt-0.5">HotBot Studios · Blog Admin</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
        >
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <input
              ref={userRef}
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
              style={inputStyle}
              placeholder="admin"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
              style={inputStyle}
              placeholder="••••••••"
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e)  => Object.assign(e.target.style, blurStyle)}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}
            >
              <span className="shrink-0 mt-0.5 text-xs">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: loading ? "#4f46e5" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-700 text-xs mt-4">
          Private access only ·{" "}
          <a href="/enter/backdrop/register" className="text-slate-600 hover:text-slate-400 transition-colors">Request access</a>
        </p>
      </div>
    </div>
  );
}
