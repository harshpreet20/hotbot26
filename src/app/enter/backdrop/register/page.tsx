"use client";
import Image from "next/image";
import { useState, FormEvent } from "react";
import Link from "next/link";

const ROLES = [
  { value: "manager",      label: "Manager",      desc: "CRM data, reports, team oversight" },
  { value: "sales",        label: "Sales",         desc: "Lead management & pipeline" },
  { value: "crm_operator", label: "CRM Operator",  desc: "Manage contacts & deals" },
  { value: "finance",      label: "Finance",       desc: "Invoices & financial reports" },
  { value: "editor",       label: "Editor",        desc: "Create & publish blog posts" },
  { value: "contributor",  label: "Contributor",   desc: "Write drafts for review" },
  { value: "agent",        label: "Agent",         desc: "View chat logs & callbacks" },
] as const;

type RequestRole = typeof ROLES[number]["value"];

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  transition: "border-color 0.15s",
};
const focusStyle = { borderColor: "rgba(99,102,241,0.6)" };
const blurStyle  = { borderColor: "rgba(255,255,255,0.12)" };

export default function RegisterPage() {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole]   = useState<RequestRole>("contributor");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) { setError("All fields are required."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/blog/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), requestedRole: role }),
      });
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      if (!res.ok || !data.success) { setError(data.error || "Something went wrong."); return; }
      setSuccess(true);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%), #0a0e1a" }}
    >
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 mx-auto"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <Image src="/logos/hotbot-logo.svg" alt="HotBot Studios" width={40} height={40} className="object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Request Access</h1>
          <p className="text-slate-500 text-xs mt-0.5">HotBot Studios · Backdrop</p>
        </div>

        {success ? (
          <div className="rounded-2xl p-6 text-center space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <p className="text-white font-semibold text-sm">Request submitted!</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              The admin will review your request. Once approved, you&apos;ll receive an email at{" "}
              <strong className="text-slate-300">{email}</strong> with a link to set your password.
            </p>
            <Link href="/enter/backdrop" className="block mt-2 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>

            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input id="name" type="text" autoComplete="name" value={name}
                onChange={(e) => setName(e.target.value)} disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
                style={inputStyle} placeholder="Your name"
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e)  => Object.assign(e.target.style, blurStyle)} />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Work Email</label>
              <input id="email" type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 disabled:opacity-60"
                style={inputStyle} placeholder="you@hotbotstudios.com"
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e)  => Object.assign(e.target.style, blurStyle)} />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Requested Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)} disabled={loading}
                    className="px-3 py-2.5 rounded-xl text-left transition-all disabled:opacity-60"
                    style={{
                      background: role === r.value ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${role === r.value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}>
                    <p className="text-xs font-semibold" style={{ color: role === r.value ? "#a5b4fc" : "#94a3b8" }}>{r.label}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{r.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-2">Admin reviews and confirms your role before granting access.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <span className="shrink-0 mt-0.5 text-xs">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:-translate-y-0.5"
              style={{ background: loading ? "#4f46e5" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 24px rgba(99,102,241,0.3)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting…
                </span>
              ) : "Request Access"}
            </button>

            <p className="text-center text-slate-600 text-xs">
              Already have access?{" "}
              <Link href="/enter/backdrop" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
