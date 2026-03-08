"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { SeoCheck, SeoCheckStatus } from "@/types/blog";
import type { FullAnalysis, AnalysisTab } from "@/lib/seo-analyzer";
import type { ContentIntelligenceResult } from "@/lib/content-intelligence";

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
  onFeaturedImage: (url: string) => void;
}

const STATUS_COLOR: Record<SeoCheckStatus, string> = {
  good: "#22c55e",
  improvement: "#f59e0b",
  error: "#ef4444",
};

const TAB_META: Record<AnalysisTab, { label: string; desc: string; color: string }> = {
  seo: { label: "SEO", desc: "Google search ranking", color: "#3b82f6" },
  aeo: { label: "AEO", desc: "AI answer engines", color: "#8b5cf6" },
  geo: { label: "GEO", desc: "GenAI citations", color: "#06b6d4" },
  local: { label: "Local", desc: "Maps & local pack", color: "#22c55e" },
  readability: { label: "Read", desc: "Readability & style", color: "#f97316" },
};

const TABS: AnalysisTab[] = ["seo", "aeo", "geo", "local", "readability"];

function ScoreRing({ score, grade, size = 56 }: { score: number; grade: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = grade === "good" ? "#22c55e" : grade === "ok" ? "#f59e0b" : "#ef4444";
  const cx = size / 2;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }} />
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={size < 48 ? "11" : "13"} fontWeight="700">{score}</text>
    </svg>
  );
}

function CheckItem({ check }: { check: SeoCheck }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="w-full text-left flex items-start gap-2 py-1.5 hover:bg-white/[0.02] rounded-lg px-1 transition-colors"
      onClick={() => setOpen((p) => !p)}
    >
      <span className="mt-0.5 text-xs shrink-0 leading-none" style={{ color: STATUS_COLOR[check.status] }}>●</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-300 leading-snug">{check.label}</p>
        {open && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{check.message}</p>}
      </div>
      <span className="text-slate-600 text-xs shrink-0">{open ? "▲" : "▼"}</span>
    </button>
  );
}

function CharBar({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const pct = Math.min((len / max) * 100, 100);
  const color = len === 0 ? "#334155" : len >= min && len <= max ? "#22c55e" : len < min ? "#f59e0b" : "#ef4444";
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs mb-0.5" style={{ color }}>
        <span>{len} chars</span>
        <span>{min}–{max}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
const inputClass = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors";

function ImageUploader({ onUploaded, secret }: { onUploaded: (url: string, alt: string) => void; secret: string }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; originalSizeKb: number; optimizedSizeKb: number; savedPercent: number } | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/blog/upload-image", {
        method: "POST",
        headers: { "x-backdrop-secret": secret },
        body: fd,
      });
      const data = await res.json() as typeof result & { error?: string };
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {!result ? (
        <div
          className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:border-blue-500/50"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {uploading ? (
            <p className="text-xs text-slate-400">Optimizing image…</p>
          ) : (
            <>
              <p className="text-xs text-slate-400">Drop image or click to upload</p>
              <p className="text-xs text-slate-600 mt-0.5">Auto-converts to WebP · Max 1200px · Compressed</p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <img src={result.url} alt="Uploaded" className="w-full h-28 object-cover" />
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{result.originalSizeKb}KB → {result.optimizedSizeKb}KB</span>
              <span className="text-green-400">−{result.savedPercent}% saved</span>
            </div>
            <input
              className={inputClass} style={inputStyle}
              placeholder="Alt text for this image…"
              value={altDraft}
              onChange={(e) => setAltDraft(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onUploaded(result.url, altDraft)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                Use as Featured Image
              </button>
              <button
                onClick={() => { setResult(null); setAltDraft(""); }}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function SeoPanel({
  title, slug, content, excerpt, featuredImageAlt,
  metaTitle, metaDescription, focusKeyword,
  onMetaTitle, onMetaDescription, onFocusKeyword, onFeaturedImageAlt, onSlug, onFeaturedImage,
}: SeoPanelProps) {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("seo");
  const [openSection, setOpenSection] = useState<"seo-fields" | "image" | "checks" | null>("seo-fields");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const secret = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";

  const runAnalysis = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/seo/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, metaTitle, metaDescription, focusKeyword, slug, content, excerpt, featuredImageAlt }),
        });
        const data = await res.json() as FullAnalysis;
        setAnalysis(data);
      } catch { /* silent */ }
    }, 500);
  }, [title, metaTitle, metaDescription, focusKeyword, slug, content, excerpt, featuredImageAlt]);

  useEffect(() => { runAnalysis(); }, [runAnalysis]);

  function slugify(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function section(id: typeof openSection, label: string, children: React.ReactNode) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-semibold text-slate-300 hover:bg-white/[0.02] transition-colors uppercase tracking-wider"
          onClick={() => setOpenSection((p) => p === id ? null : id)}
        >
          {label}
          <span className="text-slate-600 font-normal">{openSection === id ? "▲" : "▼"}</span>
        </button>
        {openSection === id && <div className="px-3 pb-3 space-y-3">{children}</div>}
      </div>
    );
  }

  const currentChecks = analysis ? analysis[activeTab].checks : [];
  const good = currentChecks.filter((c) => c.status === "good").length;
  const improvement = currentChecks.filter((c) => c.status === "improvement").length;
  const error = currentChecks.filter((c) => c.status === "error").length;

  // ── Intelligence state ────────────────────────────────────────────────────
  const [aiOpen, setAiOpen]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult]   = useState<ContentIntelligenceResult | null>(null);
  const [aiError, setAiError]     = useState("");

  async function runIntelligence() {
    if (!content.trim()) { setAiError("Add some content before running analysis."); return; }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/content/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ title, slug, content, excerpt, metaTitle, metaDescription, focusKeyword, featuredImageAlt }),
      });
      const data = await res.json() as ContentIntelligenceResult & { error?: string };
      if (!res.ok) { setAiError(data.error || "Analysis failed."); return; }
      setAiResult(data);
      setAiOpen(true);
    } catch {
      setAiError("Connection error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Overall score bar */}
      <div
        className="rounded-2xl p-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          {analysis && <ScoreRing score={analysis.overall.score} grade={analysis.overall.grade} />}
          <div>
            <p className="text-white font-semibold text-sm">Content Score</p>
            <p className="text-xs text-slate-500">SEO · AEO · GEO · Local · Readability</p>
          </div>
        </div>

        {/* 4 mini rings */}
        {analysis && (
          <div className="grid grid-cols-5 gap-1">
            {TABS.map((tab) => {
              const meta = TAB_META[tab];
              const a = analysis[tab];
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setOpenSection("checks"); }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors hover:bg-white/[0.04]"
                  style={{
                    background: activeTab === tab ? `${meta.color}18` : "transparent",
                    border: activeTab === tab ? `1px solid ${meta.color}40` : "1px solid transparent",
                  }}
                >
                  <ScoreRing score={a.score} grade={a.grade} size={38} />
                  <span className="text-[10px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Focus keyword */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Focus Keyword</label>
        <input className={inputClass} style={inputStyle} placeholder="e.g. ai automation agency usa"
          value={focusKeyword} onChange={(e) => onFocusKeyword(e.target.value)} />
      </div>

      {/* SEO fields section */}
      {section("seo-fields", "SEO Fields", <>
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">URL Slug</label>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 text-xs shrink-0">/blog/</span>
            <input className={`${inputClass} flex-1`} style={inputStyle} value={slug}
              onChange={(e) => onSlug(slugify(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">
            Meta Title
          </label>
          <input className={inputClass} style={inputStyle} maxLength={80}
            placeholder={title || "SEO title (50–60 chars)"}
            value={metaTitle} onChange={(e) => onMetaTitle(e.target.value)} />
          <CharBar value={metaTitle} min={50} max={60} />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Meta Description</label>
          <textarea rows={3} className={inputClass} style={{ ...inputStyle, resize: "vertical" }} maxLength={200}
            placeholder={excerpt || "Meta description (120–160 chars)"}
            value={metaDescription} onChange={(e) => onMetaDescription(e.target.value)} />
          <CharBar value={metaDescription} min={120} max={160} />
        </div>

        {/* SERP preview */}
        {(metaTitle || title) && (
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">SERP Preview</p>
            <p className="text-blue-400 text-sm font-medium leading-snug truncate">{metaTitle || title}</p>
            <p className="text-green-700 text-xs mt-0.5">hotbotstudios.com/blog/{slug || "your-slug"}</p>
            {(metaDescription || excerpt) && (
              <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{metaDescription || excerpt}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Featured Image Alt Text</label>
          <input className={inputClass} style={inputStyle}
            placeholder="Descriptive alt text for accessibility & SEO"
            value={featuredImageAlt} onChange={(e) => onFeaturedImageAlt(e.target.value)} />
        </div>
      </>)}

      {/* Image upload section */}
      {section("image", "Upload & Optimize Image", <>
        <p className="text-xs text-slate-500">Auto-converts to WebP, resizes to max 1200px, compresses. Use the URL in your content or as featured image.</p>
        <ImageUploader
          secret={secret}
          onUploaded={(url, alt) => {
            onFeaturedImage(url);
            if (alt) onFeaturedImageAlt(alt);
          }}
        />
      </>)}

      {/* Checklist section */}
      {section("checks", "Analysis Checklist", <>
        {/* Tab selector */}
        <div className="grid grid-cols-5 gap-1">
          {TABS.map((tab) => {
            const meta = TAB_META[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: activeTab === tab ? `${meta.color}20` : "rgba(255,255,255,0.03)",
                  color: activeTab === tab ? meta.color : "#64748b",
                  border: activeTab === tab ? `1px solid ${meta.color}40` : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Tab description */}
        <p className="text-xs text-slate-500">{TAB_META[activeTab].desc} — {good} good · {improvement} to improve · {error} issues</p>

        {/* Checks */}
        <div className="space-y-0.5">
          {currentChecks.map((c) => <CheckItem key={c.id} check={c} />)}
          {!currentChecks.length && (
            <p className="text-xs text-slate-600 py-2 text-center">Start writing to see analysis…</p>
          )}
        </div>
      </>)}

      {/* ── Content Intelligence Section ────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.25)" }}>
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
          onClick={() => setAiOpen((p) => !p)}
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Content Intelligence</span>
          </div>
          <span className="text-slate-600 font-normal text-xs">{aiOpen ? "▲" : "▼"}</span>
        </button>

        {aiOpen && (
          <div className="px-3 pb-3 space-y-3">
            {/* Run button */}
            <button
              onClick={runIntelligence}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: aiLoading ? "#4f46e5" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analysing…
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  {aiResult ? "Re-run Analysis" : "Run Intelligence Analysis"}
                </>
              )}
            </button>

            {/* Error */}
            {aiError && (
              <p className="text-xs text-red-400 px-1">{aiError}</p>
            )}

            {/* Results */}
            {aiResult && !aiLoading && (
              <div className="space-y-3">
                {/* Score + assessment */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <div className="shrink-0">
                    <ScoreRing
                      score={aiResult.total_score}
                      grade={aiResult.total_score >= 70 ? "good" : aiResult.total_score >= 40 ? "ok" : "poor"}
                      size={48}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{aiResult.quality_assessment}</p>
                </div>

                {/* Strengths */}
                {aiResult.strengths.length > 0 && (
                  <AiList label="Strengths" items={aiResult.strengths} color="#22c55e" icon="✓" />
                )}

                {/* Weaknesses */}
                {aiResult.weaknesses.length > 0 && (
                  <AiList label="Weaknesses" items={aiResult.weaknesses} color="#f59e0b" icon="!" />
                )}

                {/* Content improvements */}
                {aiResult.content_improvement_suggestions.length > 0 && (
                  <AiList label="Content Improvements" items={aiResult.content_improvement_suggestions} color="#3b82f6" icon="→" />
                )}

                {/* Context expansion */}
                {aiResult.context_expansion_suggestions.length > 0 && (
                  <AiList label="Expand Context" items={aiResult.context_expansion_suggestions} color="#06b6d4" icon="+" />
                )}

                {/* Authority boosts */}
                {aiResult.authority_boost_recommendations.length > 0 && (
                  <AiList label="Authority Signals" items={aiResult.authority_boost_recommendations} color="#8b5cf6" icon="★" />
                )}

                {/* Structure upgrades */}
                {aiResult.structure_upgrade_suggestions.length > 0 && (
                  <AiList label="Structure Upgrades" items={aiResult.structure_upgrade_suggestions} color="#ec4899" icon="⊞" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AiList({ label, items, color, icon }: { label: string; items: string[]; color: string; icon: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold" style={{ color }}>{icon}</span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
          <span className="text-[10px] text-slate-600">({items.length})</span>
        </div>
        <span className="text-slate-700 text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="px-2.5 pb-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[10px] mt-0.5 shrink-0 font-bold" style={{ color }}>{icon}</span>
              <span className="text-[11px] text-slate-400 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
