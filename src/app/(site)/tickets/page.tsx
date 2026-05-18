"use client";
import { useState } from "react";
import type { TicketCategory, TicketPriority } from "@/types/dashboard";

const CATEGORIES: { value: TicketCategory; label: string; icon: string }[] = [
  { value: "support",  label: "Support",        icon: "🎯" },
  { value: "bug",      label: "Bug Report",      icon: "🐛" },
  { value: "feature",  label: "Feature Request", icon: "✨" },
  { value: "billing",  label: "Billing",         icon: "💳" },
  { value: "general",  label: "General",         icon: "💬" },
];

const PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
  { value: "low",      label: "Low",      color: "#64748b" },
  { value: "medium",   label: "Medium",   color: "#3b82f6" },
  { value: "high",     label: "High",     color: "#f59e0b" },
  { value: "critical", label: "Critical", color: "#ef4444" },
];

export default function SubmitTicketPage() {
  const [clientId,     setClientId]     = useState("");
  const [clientValid,  setClientValid]  = useState<null | { name: string; status: string }>(null);
  const [clientError,  setClientError]  = useState("");
  const [verifying,    setVerifying]    = useState(false);

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState<TicketCategory>("general");
  const [priority,    setPriority]    = useState<TicketPriority>("medium");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState<{ id: string; ticketNumber: string } | null>(null);
  const [error,       setError]       = useState("");

  // Lookup form
  const [lookupId,   setLookupId]   = useState("");
  const [lookupMode, setLookupMode] = useState(false);

  async function verifyClientId() {
    const raw = clientId.trim().toUpperCase();
    if (!raw) { setClientError("Please enter your Client ID."); return; }
    setVerifying(true); setClientError(""); setClientValid(null);
    try {
      const res = await fetch("/api/clients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: raw }),
      });
      const data = await res.json() as { valid: boolean; clientName?: string; status?: string };
      if (data.valid) {
        setClientValid({ name: data.clientName ?? "", status: data.status ?? "" });
      } else {
        setClientError("Client ID not recognised. Please check your ID or contact us at support@hotbotstudios.com");
      }
    } catch {
      setClientError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientValid) return;
    setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, requesterName: name, requesterEmail: email, category, priority, clientId: clientId.trim().toUpperCase() }),
      });
      const data = await res.json() as { error?: string; ticket?: { id: string; ticketNumber: string } };
      if (!res.ok) { setError(data.error ?? "Submission failed."); return; }
      setSubmitted(data.ticket!);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0e1a" }}>
        <div className="max-w-md w-full text-center rounded-3xl p-8" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-white text-2xl font-bold mb-2">Ticket Submitted!</h1>
          <p className="text-slate-400 mb-6">Your ticket has been received. We'll get back to you as soon as possible.</p>
          <div className="bg-indigo-500/10 rounded-2xl px-6 py-4 mb-6 border border-indigo-500/20">
            <p className="text-slate-400 text-sm mb-1">Your ticket number</p>
            <p className="text-indigo-300 text-3xl font-mono font-bold">{submitted.ticketNumber}</p>
            <p className="text-slate-500 text-xs mt-2">Save this number to track your ticket status</p>
          </div>
          <a
            href={`/tickets/${submitted.id}`}
            className="inline-block px-6 py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: "rgba(99,102,241,0.8)" }}
          >
            Track ticket status →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: "#0a0e1a" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-bold mb-3">Submit a Support Ticket</h1>
          <p className="text-slate-400">Available exclusively to HotBot Studios clients.</p>
          <button
            onClick={() => setLookupMode(!lookupMode)}
            className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {lookupMode ? "← Submit new ticket" : "Already have a ticket? Track status →"}
          </button>
        </div>

        {lookupMode ? (
          /* Lookup form */
          <div className="rounded-3xl p-8" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <h2 className="text-white font-semibold mb-4">Track Existing Ticket</h2>
            <div className="flex gap-3">
              <input
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter ticket number (e.g. TKT-0042)"
                className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-slate-600 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <a
                href={lookupId.trim() ? `/tickets/${lookupId.trim()}` : "#"}
                className="px-5 py-3 rounded-xl text-sm font-medium text-white"
                style={{ background: "rgba(99,102,241,0.8)" }}
              >
                Look up
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-8 space-y-6" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            {/* Step 1: Client ID verification */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: clientValid ? "rgba(52,211,153,0.2)" : "rgba(99,102,241,0.2)", color: clientValid ? "#34d399" : "#818cf8" }}>
                  {clientValid ? "✓" : "1"}
                </span>
                <h2 className="text-white font-semibold text-sm">Verify Your Client ID</h2>
              </div>

              {clientValid ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-400 text-sm font-medium">Verified — {clientValid.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Client ID: <span className="font-mono text-indigo-400">{clientId.toUpperCase()}</span></p>
                  </div>
                  <button
                    onClick={() => { setClientValid(null); setClientId(""); }}
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Ticket submission is available to HotBot Studios clients only. Enter the Client ID provided to you by your account manager.
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={clientId}
                      onChange={(e) => { setClientId(e.target.value.toUpperCase()); setClientError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), verifyClientId())}
                      placeholder="e.g. HBS-A1B2C"
                      className="flex-1 px-4 py-3 rounded-xl font-mono text-sm text-white placeholder:text-slate-600 outline-none tracking-widest"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${clientError ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}` }}
                    />
                    <button
                      type="button"
                      onClick={verifyClientId}
                      disabled={verifying || !clientId.trim()}
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                      style={{ background: "rgba(99,102,241,0.8)" }}
                    >
                      {verifying ? "…" : "Verify"}
                    </button>
                  </div>
                  {clientError && (
                    <p className="text-red-400 text-xs">{clientError}</p>
                  )}
                </>
              )}
            </div>

            {/* Step 2: Ticket form — shown only after client verification */}
            {clientValid && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
                  <h2 className="text-white font-semibold text-sm">Describe Your Issue</h2>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Your Name *">
                    <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Smith" className="input-field" />
                  </Field>
                  <Field label="Email Address *">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" className="input-field" />
                  </Field>
                </div>

                <Field label="Subject *">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief summary of your issue" className="input-field" />
                </Field>

                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Describe your issue in detail. Include steps to reproduce if it's a bug."
                    className="input-field resize-none"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <div className="grid grid-cols-1 gap-1.5">
                      {CATEGORIES.map((c) => (
                        <label key={c.value} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors" style={{ background: category === c.value ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${category === c.value ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                          <input type="radio" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} className="sr-only" />
                          <span>{c.icon}</span>
                          <span className="text-sm" style={{ color: category === c.value ? "#e2e8f0" : "#64748b" }}>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Priority">
                    <div className="grid grid-cols-1 gap-1.5">
                      {PRIORITIES.map((p) => (
                        <label key={p.value} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors" style={{ background: priority === p.value ? `${p.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${priority === p.value ? `${p.color}40` : "rgba(255,255,255,0.07)"}` }}>
                          <input type="radio" value={p.value} checked={priority === p.value} onChange={() => setPriority(p.value)} className="sr-only" />
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                          <span className="text-sm" style={{ color: priority === p.value ? "#e2e8f0" : "#64748b" }}>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "rgba(99,102,241,0.8)" }}
                >
                  {submitting ? "Submitting…" : "Submit Ticket"}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          Not a client yet?{" "}
          <a href="/#contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">Get in touch</a>
          {" "}to get started.
        </p>
      </div>

      <style jsx>{`
        .input-field { width: 100%; padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 14px; outline: none; }
        .input-field:focus { border-color: rgba(99,102,241,0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
