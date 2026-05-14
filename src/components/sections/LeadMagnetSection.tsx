"use client";
import { useState } from "react";
import { Reveal } from "@/components/shared/Reveal";

const DELIVERABLES = [
  "Full marketing channel audit (where your budget is leaking)",
  "Top 3 quick-win revenue opportunities we spot immediately",
  "AI automation gaps costing you hours every week",
  "Competitor benchmark - where you stand vs. your top 3 rivals",
  "Custom 90-day growth roadmap with prioritised action items",
];

export function LeadMagnetSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/forms/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "lead-magnet-audit" }),
      });
    } catch {
      // best-effort
    }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section className="relative z-10 py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.04) 100%)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12">
              <Reveal>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                  style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}
                >
                  Free - No Pitch, No Obligation
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Get Your Free AI Growth Audit<br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Delivered in 24 Hours
                  </span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Drop your email. We&apos;ll analyse your business, identify exactly where growth is stalling, and send you a custom action plan - free, in 24 hours.
                </p>
                <ul className="space-y-3">
                  {DELIVERABLES.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div
              className="p-8 md:p-12 flex flex-col justify-center"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Reveal direction="left">
                {submitted ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">You&apos;re on the list!</h3>
                    <p className="text-slate-400 text-sm">
                      Expect your personalised growth audit within 24 hours. Check your inbox.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-300 font-semibold mb-2">Where should we send your audit?</p>
                    <p className="text-slate-500 text-xs mb-6">
                      We review max 5 businesses per week. First come, first served.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none focus:ring-1 focus:ring-blue-500/50"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                      >
                        {loading ? "Sending…" : "Send Me the Free Audit →"}
                      </button>
                    </form>
                    <p className="text-slate-600 text-xs mt-4 text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
