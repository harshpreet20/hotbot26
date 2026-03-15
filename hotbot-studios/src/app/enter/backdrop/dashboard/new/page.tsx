"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogAdTopic, AdSlot } from "@/types/blog";
import Link from "next/link";
import { SeoPanel } from "@/components/backdrop/SeoPanel";
import dynamic from "next/dynamic";

// Load the rich editor client-side only (Tiptap is browser-only)
const RichEditor = dynamic(
  () => import("@/components/backdrop/RichEditor").then((m) => m.RichEditor),
  { ssr: false, loading: () => <div className="h-64 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} /> },
);

const CATEGORIES = [
  "AI Automation", "Digital Marketing", "AI Products",
  "Content Strategy", "Public Relations", "SEO", "Social Media", "n8n",
];
const AD_TOPICS: BlogAdTopic[] = [
  "general", "ai-automation", "ai-chatbot", "voice-ai", "n8n", "seo", "ppc",
  "social-media", "email-marketing", "analytics", "content", "video", "pr",
  "software-dev", "ui-ux", "consultancy",
];

function newSlotId() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const secret = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: CATEGORIES[0],
    tags: "",
    author: "HotBot Studios",
    excerpt: "",
    content: "",
    adTopic: "general" as BlogAdTopic,
    featuredImage: "",
    readTime: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    featuredImageAlt: "",
  });

  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "title") {
        if (!prev.slug) next.slug = slugify(v);
        if (!prev.metaTitle) next.metaTitle = v;
      }
      if (k === "excerpt" && !prev.metaDescription) next.metaDescription = v;
      return next;
    });
  }

  async function handleSubmit(status: "published" | "draft") {
    setError("");
    const s = sessionStorage.getItem("backdrop_secret");
    if (!s) { router.replace("/enter/backdrop"); return; }
    if (!form.title || !form.slug || !form.content) {
      setError("Title, slug, and content are required."); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: s,
          post: {
            ...form,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            author: form.author || "HotBot Studios",
            featuredImage: form.featuredImage || undefined,
            featuredImageAlt: form.featuredImageAlt || undefined,
            readTime: form.readTime || undefined,
            status,
            metaTitle: form.metaTitle || form.title,
            metaDescription: form.metaDescription || form.excerpt,
            adSlots,
          },
        }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; throw new Error(d.error || "Failed"); }
      router.push("/enter/backdrop/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-colors";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
  const words = form.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,10,20,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/enter/backdrop/dashboard/blog" className="text-slate-400 hover:text-white transition-colors text-sm">← Blog</Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 text-sm font-medium">New Post</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSubmit("draft")} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm text-slate-300 transition-colors hover:text-white disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Save Draft
          </button>
          <button onClick={() => handleSubmit("published")} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Main editor */}
        <main className="flex-1 p-6 min-w-0 space-y-5 overflow-y-auto">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <textarea
            rows={2}
            className="w-full px-0 py-2 bg-transparent text-2xl font-bold text-white outline-none resize-none placeholder:text-slate-600 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
            placeholder="Post title…"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
            <select className={inputClass} style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* ── Ad Slots Manager ─────────────────────────────────────── */}
          <div className="rounded-2xl p-4 space-y-3" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">Ad Slots</p>
                <p className="text-slate-500 text-xs mt-0.5">Place <code className="text-indigo-400">[ad:1]</code>, <code className="text-indigo-400">[ad:2]</code> … anywhere in your content to position ads.</p>
              </div>
              <button
                type="button"
                onClick={() => setAdSlots((prev) => [...prev, { id: newSlotId(), type: "contextual", topic: "general" }])}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
              >
                + Add Slot
              </button>
            </div>
            {adSlots.length === 0 && (
              <p className="text-slate-600 text-xs">No ad slots yet. Add one and place <code className="text-indigo-400">[ad:1]</code> in the content where you want it to appear.</p>
            )}
            {adSlots.map((slot, idx) => (
              <div key={slot.id} className="rounded-xl p-3 space-y-2" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-indigo-400 shrink-0">[ad:{idx + 1}]</span>
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={slot.type}
                      onChange={(e) => setAdSlots((prev) => prev.map((s, i) => i === idx ? { ...s, type: e.target.value as "contextual" | "code", code: "", topic: "general" } : s))}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <option value="contextual">Contextual (HotBot branded)</option>
                      <option value="code">Custom Code (HTML / AdSense / any)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(`[ad:${idx + 1}]`); setCopied(slot.id); setTimeout(() => setCopied(null), 1500); }}
                      className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white shrink-0 transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {copied === slot.id ? "Copied!" : "Copy shortcode"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdSlots((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-400 text-xs px-1 shrink-0 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {slot.type === "contextual" ? (
                  <select
                    value={slot.topic ?? "general"}
                    onChange={(e) => setAdSlots((prev) => prev.map((s, i) => i === idx ? { ...s, topic: e.target.value as BlogAdTopic } : s))}
                    className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {AD_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <textarea
                    rows={3}
                    placeholder="Paste ad HTML or script tag here…"
                    value={slot.code ?? ""}
                    onChange={(e) => setAdSlots((prev) => prev.map((s, i) => i === idx ? { ...s, code: e.target.value } : s))}
                    className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 font-mono outline-none resize-y"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Author</label>
              <input className={inputClass} style={inputStyle} placeholder="HotBot Studios" value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Read Time</label>
              <input className={inputClass} style={inputStyle} placeholder="5 min read" value={form.readTime} onChange={(e) => set("readTime", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Tags (comma-separated)</label>
              <input className={inputClass} style={inputStyle} placeholder="AI, automation, n8n" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
              <input className={inputClass} style={inputStyle} placeholder="https://… or use uploader →" value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Excerpt</label>
            <textarea rows={2} className={inputClass} style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Short summary for listing pages and meta description"
              value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Content *</label>
              <span className="text-xs text-slate-600">{words} words</span>
            </div>
            <RichEditor
              value={form.content}
              onChange={(html) => set("content", html)}
              secret={secret}
              placeholder="Write your post here — use the toolbar to format text, insert images, tables, code blocks and more…"
            />
          </div>
        </main>

        {/* SEO Sidebar */}
        <aside
          className="w-[340px] shrink-0 p-4 overflow-y-auto border-l"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
        >
          <SeoPanel
            title={form.title}
            slug={form.slug}
            content={form.content}
            excerpt={form.excerpt}
            featuredImageAlt={form.featuredImageAlt}
            metaTitle={form.metaTitle}
            metaDescription={form.metaDescription}
            focusKeyword={form.focusKeyword}
            onMetaTitle={(v) => set("metaTitle", v)}
            onMetaDescription={(v) => set("metaDescription", v)}
            onFocusKeyword={(v) => set("focusKeyword", v)}
            onFeaturedImageAlt={(v) => set("featuredImageAlt", v)}
            onSlug={(v) => set("slug", v)}
            onFeaturedImage={(url) => set("featuredImage", url)}
          />
        </aside>
      </div>
    </div>
  );
}
