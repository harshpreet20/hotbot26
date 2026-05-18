"use client";

import { useState, useRef } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface AnalysisResult {
  competitorUrl: string;
  yourUrl?: string;
  overallScore: number;
  keywordGaps: string[];
  contentOpportunities: string[];
  onPageFindings: string[];
  backlinksNote: string;
  quickWins: string[];
  summary: string;
}

export function CompetitorAnalysisTool() {
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [yourUrl, setYourUrl] = useState("");
  const [location, setLocation] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const { getToken } = useRecaptcha();

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!competitorUrl) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const recaptchaToken = await getToken("competitor_analysis");
      const res = await fetch("/api/seo/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorUrl, yourUrl, location, niche, recaptchaToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="analyze" className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
      <Reveal>
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-xl font-bold text-white mb-2">Run a Free Competitor Analysis</h2>
          <p className="text-slate-400 text-sm mb-8">
            Enter a competitor URL and let AI map their SEO strategy, surface keyword gaps, and
            generate your top 10 quick wins.
          </p>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Competitor URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Your Website URL <span className="text-slate-600 font-normal">(optional - for gap analysis)</span>
              </label>
              <input
                type="url"
                value={yourUrl}
                onChange={(e) => setYourUrl(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Target Location <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Niche / Industry <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. B2B SaaS, dental, HVAC"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !competitorUrl}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing competitor…
                </span>
              ) : (
                "🔍 Analyze Competitor - Free"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl text-sm text-red-400 border border-red-500/20 bg-red-500/5">
              {error}
            </div>
          )}
        </div>
      </Reveal>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-10 space-y-6">
          <Reveal>
            <div
              className="rounded-3xl p-8"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.04) 100%)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-white font-bold text-lg">Analysis Complete</h3>
                  <p className="text-slate-500 text-xs mt-1 break-all">{result.competitorUrl}</p>
                </div>
                <div className="text-center">
                  <div
                    className="text-3xl font-black"
                    style={{
                      color:
                        result.overallScore >= 70
                          ? "#22c55e"
                          : result.overallScore >= 40
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {result.overallScore}
                  </div>
                  <div className="text-xs text-slate-500">SEO Score</div>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ResultCard
              title="🎯 Keyword Gaps"
              subtitle="Keywords they rank for that you should target"
              items={result.keywordGaps}
              color="#8b5cf6"
            />
            <ResultCard
              title="✍️ Content Opportunities"
              subtitle="Topics and formats to create"
              items={result.contentOpportunities}
              color="#3b82f6"
            />
            <ResultCard
              title="🔍 On-Page Findings"
              subtitle="SEO signals observed on their site"
              items={result.onPageFindings}
              color="#06b6d4"
            />
            <Reveal>
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <h4 className="text-white font-semibold text-sm mb-1">🔗 Backlink Profile</h4>
                <p className="text-slate-500 text-xs mb-4">Link strategy assessment</p>
                <p className="text-slate-300 text-sm leading-relaxed">{result.backlinksNote}</p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(34,197,94,0.05)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <h4 className="text-white font-semibold text-sm mb-1">⚡ Top 10 Quick Wins</h4>
              <p className="text-slate-500 text-xs mb-5">Prioritized actions to outrank this competitor</p>
              <ol className="space-y-2">
                {result.quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                    >
                      {i + 1}
                    </span>
                    {win}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {/* Pro upsell */}
          <Reveal>
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <p className="text-white font-semibold mb-2">Want weekly monitoring + AI optimization playbooks?</p>
              <p className="text-slate-400 text-sm mb-5">
                Upgrade to Pro ($49/mo) to track 5 competitors continuously, get keyword gap alerts, and receive
                a monthly AI-generated content strategy.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                Get Pro Access - $49/month →
              </a>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}

function ResultCard({
  title,
  subtitle,
  items,
  color,
}: {
  title: string;
  subtitle: string;
  items: string[];
  color: string;
}) {
  return (
    <Reveal>
      <div
        className="rounded-2xl p-6 h-full"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
        <p className="text-slate-500 text-xs mb-4">{subtitle}</p>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span style={{ color }} className="mt-1 flex-shrink-0 text-xs">▪</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
