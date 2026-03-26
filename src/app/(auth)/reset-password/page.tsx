"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center">
        <h1 className="text-xl font-bold text-red-400 mb-2">Invalid Link</h1>
        <p className="text-sm text-slate-400 mb-6">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h1 className="text-xl font-bold text-green-400 mb-2">Password Reset</h1>
        <p className="text-sm text-slate-400 mb-6">Your password has been updated. You can now sign in.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
        <p className="text-sm text-slate-400">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            minLength={6}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
            placeholder="Min. 6 characters"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-300 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
            placeholder="Repeat password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
