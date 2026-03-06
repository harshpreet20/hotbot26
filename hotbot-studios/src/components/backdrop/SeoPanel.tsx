"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { SeoAnalysis, SeoCheck, SeoCheckStatus } from "@/types/blog";

interface SeoPanelProps {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  onMetaTitle: (v: string) => void;
  onMetaDescription: (v: string) => void;
  onFocusKeyword: (v: string) => void;
  onFeaturedImageAlt: (v: string) => void;
  onSlug: (v: string) => void;
}

const STATUS_COLOR: Record<SeoCheckStatus, string> = {
  good: "#22c55e",
  improvement: "#f59e0b",
  error: "#ef4444",
};

const STATUS_ICON: Record<SeoCheckStatus, string> = {
  good: "●",
  improvement: "●",
  error: "●",
};

function ScoreCircle({ score, grade }: { score: number; grade: string }) {
  const color = grade === "good" ? "#22c55e" : grade === "ok" ? "#f59e0b" : "#ef4444";
  const label = grade === "good" ? "Good" : grade === "ok" ? "Needs Work" : "Poor";
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="72" className="shrink-0">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="14" fontWeight="700">{score}</text>
      </svg>
      <div>
        <p className="text-white font-semibold text-sm">SEO Score</p>
        <p className="text-xs" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

function CheckItem({ check }: { check: SeoCheck }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="mt-0.5 text-xs shrink-0" style={{ color: STATUS_COLOR[check.status] }}>
        {STATUS_ICON[check.status]}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-300">{check.label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{check.message}</p>
      </div>
    </div>
  );
}

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const color = len === 0 ? "#64748b" : len >= min && len <= max ? "#22c55e" : len < min ? "#f59e0b" : "#ef4444";
  return (
    <span className="text-xs ml-1" style={{ color }}>
      {len}/{max}
    </span>
  );
}

const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
const inputClass = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors";

export function SeoPanel({
  title, slug, content, excerpt, featuredImageAlt,
  metaTitle, metaDescription, focusKeyword,
  onMetaTitle, onMetaDescription, onFocusKeyword, onFeaturedImageAlt, onSlug,
}: SeoPanelProps) {
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"seo" | "readability">("seo");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const runLocalAnalysis = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/seo/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title, metaTitle, metaDescription, focusKeyword,
            slug, content, excerpt, featuredImageAlt, aiAnalysis: false,
          }),
        });
        const data = await res.json() as SeoAnalysis;
        setAnalysis((prev) => ({ ...data, aiSuggestions: prev?.aiSuggestions }));
      } catch { /* silent */ }
    }, 600);
  }, [title, metaTitle, metaDescription, focusKeyword, slug, content, excerpt, featuredImageAlt]);

  useEffect(() => { runLocalAnalysis(); }, [runLocalAnalysis]);

  async function runAiAnalysis() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, metaTitle, metaDescription, focusKeyword,
          slug, content, excerpt, featuredImageAlt, aiAnalysis: true,
        }),
      });
      const data = await res.json() as SeoAnalysis;
      setAnalysis(data);
    } catch { /* silent */ } finally {
      setAiLoading(false);
    }
  }

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  const seoChecks = analysis?.checks ?? [];
  const readabilityChecks = seoChecks.filter((c) =>
    ["content-length", "subheadings", "links"].includes(c.id)
  );
  const seoOnlyChecks = seoChecks.filter((c) =>
    !["content-length", "subheadings", "links"].includes(c.id)
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">SEO Analysis</span>
          {analysis && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: analysis.grade === "good" ? "rgba(34,197,94,0.15)" : analysis.grade === "ok" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                color: analysis.grade === "good" ? "#22c55e" : analysis.grade === "ok" ? "#f59e0b" : "#ef4444",
              }}
            >
              {analysis.score}/100
            </span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-5">
          {/* Score circle */}
          {analysis && (
            <ScoreCircle score={analysis.score} grade={analysis.grade} />
          )}

          {/* Focus keyword */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
              Focus Keyword
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. ai automation agency"
              value={focusKeyword}
              onChange={(e) => onFocusKeyword(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs shrink-0">/blog/</span>
              <input
                className={`${inputClass} flex-1`}
                style={inputStyle}
                value={slug}
                onChange={(e) => onSlug(slugify(e.target.value))}
                placeholder="my-post-slug"
              />
            </div>
          </div>

          {/* Meta title */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
              Meta Title
              <CharCounter value={metaTitle} min={50} max={60} />
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder={title || "SEO page title (50–60 chars)"}
              value={metaTitle}
              onChange={(e) => onMetaTitle(e.target.value)}
              maxLength={80}
            />
            {/* Google SERP preview */}
            {(metaTitle || title) && (
              <div className="mt-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs text-slate-500 mb-1">Search preview</p>
                <p className="text-blue-400 text-xs font-medium truncate">{metaTitle || title}</p>
                <p className="text-green-600 text-xs">hotbotstudios.com/blog/{slug || "your-slug"}</p>
                {(metaDescription || excerpt) && (
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{metaDescription || excerpt}</p>
                )}
              </div>
            )}
          </div>

          {/* Meta description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
              Meta Description
              <CharCounter value={metaDescription} min={120} max={160} />
            </label>
            <textarea
              rows={3}
              className={inputClass}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder={excerpt || "SEO meta description (120–160 chars)"}
              value={metaDescription}
              onChange={(e) => onMetaDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Featured image alt */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
              Featured Image Alt Text
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="Describe the image for accessibility & SEO"
              value={featuredImageAlt}
              onChange={(e) => onFeaturedImageAlt(e.target.value)}
            />
          </div>

          {/* Checklist tabs */}
          {analysis && (
            <div>
              <div className="flex gap-1 mb-3">
                {(["seo", "readability"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: activeTab === tab ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                      color: activeTab === tab ? "#60a5fa" : "#94a3b8",
                      border: activeTab === tab ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {tab === "seo" ? "SEO" : "Readability"}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5">
                {(activeTab === "seo" ? seoOnlyChecks : readabilityChecks).map((check) => (
                  <CheckItem key={check.id} check={check} />
                ))}
              </div>
            </div>
          )}

          {/* AI suggestions */}
          {analysis?.aiSuggestions && analysis.aiSuggestions.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-xs font-medium text-purple-400 mb-2">AI Suggestions</p>
              <ul className="space-y-1.5">
                {analysis.aiSuggestions.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-purple-400 shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI analyze button */}
          <button
            onClick={runAiAnalysis}
            disabled={aiLoading}
            className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {aiLoading ? "Analyzing with AI…" : "✦ AI Deep Analysis"}
          </button>
        </div>
      )}
    </div>
  );
}
