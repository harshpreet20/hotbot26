"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";

const N8N_BASE = (process.env.NEXT_PUBLIC_N8N_BASE_URL || "").replace(/\/$/, "");
const N8N_CREATE_PATH = (process.env.NEXT_PUBLIC_N8N_WEBHOOK_BLOG_CREATE || "hotbotstudios-blog-create").replace(/^\//, "");
const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotbotstudios.com";

type AdTopic =
  | "seo" | "ppc" | "social-media" | "email-marketing" | "analytics"
  | "content" | "video" | "ai-automation" | "ai-chatbot" | "voice-ai"
  | "n8n" | "pr" | "software-dev" | "ui-ux" | "consultancy" | "general";

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  customCategory: string;
  adTopic: AdTopic;
  tags: string;
  author: string;
  status: "published" | "draft";
  writingInstructions: string;
}

const CATEGORIES = [
  "AI Automation", "Digital Marketing", "SEO", "Social Media", "Content Strategy",
  "Public Relations", "Software Development", "UI/UX Design", "AI Products",
  "Consultancy", "Voice AI", "n8n", "Other",
];

const AD_TOPICS: { value: AdTopic; label: string }[] = [
  { value: "seo", label: "SEO Services" },
  { value: "ppc", label: "PPC / Google Ads" },
  { value: "social-media", label: "Social Media" },
  { value: "email-marketing", label: "Email Marketing" },
  { value: "analytics", label: "Analytics" },
  { value: "content", label: "Content / Copywriting" },
  { value: "video", label: "Video Production" },
  { value: "ai-automation", label: "AI Automation" },
  { value: "ai-chatbot", label: "AI Chatbots" },
  { value: "voice-ai", label: "Voice AI (Heka)" },
  { value: "n8n", label: "n8n Automation" },
  { value: "pr", label: "Public Relations" },
  { value: "software-dev", label: "Software Development" },
  { value: "ui-ux", label: "UI/UX Design" },
  { value: "consultancy", label: "Consultancy" },
  { value: "general", label: "General (all services)" },
];

type Status = "idle" | "sending" | "success" | "error";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewPostPage() {
  const [form, setForm] = useState<PostForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "AI Automation",
    customCategory: "",
    adTopic: "general",
    tags: "",
    author: "HotBot Studios",
    status: "published",
    writingInstructions: "",
  });

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ url?: string; message?: string; error?: string } | null>(null);

  function updateField<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !prev.slug ? { slug: slugify(value as string) } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim() || !form.slug.trim()) {
      alert("Title and slug are required.");
      return;
    }

    if (!form.content.trim() && !form.writingInstructions.trim()) {
      alert("Please provide either content or writing instructions for Claude to generate the post.");
      return;
    }

    const token = localStorage.getItem("hb_admin_token");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    setStatus("sending");
    setResult(null);

    const payload = {
      token,
      post: {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(), // if empty, Claude fills it
        category: form.category === "Other" ? form.customCategory.trim() : form.category,
        adTopic: form.adTopic,
        tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
        author: form.author.trim() || "HotBot Studios",
        status: form.status,
      },
      // Instructions passed to Claude in N8N
      writingInstructions: form.writingInstructions.trim(),
      mainSitePublishUrl: `${MAIN_SITE}/api/blog/publish`,
    };

    try {
      const res = await fetch(`${N8N_BASE}/${N8N_CREATE_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as { success?: boolean; url?: string; message?: string; error?: string };

      if (!res.ok || !data.success) {
        setStatus("error");
        setResult({ error: data.error || data.message || "Something went wrong in the N8N workflow." });
        return;
      }

      setStatus("success");
      setResult({
        url: data.url || `${MAIN_SITE}/blog/${form.slug}`,
        message: data.message || "Post published successfully!",
      });

      // Reset form
      setForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "AI Automation",
        customCategory: "",
        adTopic: "general",
        tags: "",
        author: "HotBot Studios",
        status: "published",
        writingInstructions: "",
      });
    } catch {
      setStatus("error");
      setResult({ error: "Could not reach N8N. Check your connection or webhook URL." });
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-white mb-1">New Blog Post</h1>
          <p className="text-slate-400 text-sm">
            Fill in the details below. The post will be sent to N8N → Claude AI for enhancement → published live.
          </p>
        </div>

        {/* Success banner */}
        {status === "success" && result && (
          <div className="mb-6 p-5 rounded-2xl bg-green-500/10 border border-green-500/25">
            <p className="text-green-400 font-bold text-sm mb-2">✓ {result.message}</p>
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 text-sm underline"
              >
                {result.url} ↗
              </a>
            )}
          </div>
        )}

        {/* Error banner */}
        {status === "error" && result && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">⚠️ {result.error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Field label="Post Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. How AI is Transforming US E-commerce in 2026"
              className={inputClass}
              required
            />
          </Field>

          {/* Slug */}
          <Field label="URL Slug *" hint={`hotbotstudios.com/blog/${form.slug || "your-slug"}`}>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", slugify(e.target.value))}
              placeholder="how-ai-is-transforming-ecommerce-2026"
              className={inputClass}
              required
            />
          </Field>

          {/* Category + Ad Topic (2-col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Inline Ad Topic" hint="Which HotBot service should the inline ads promote?">
              <select
                value={form.adTopic}
                onChange={(e) => updateField("adTopic", e.target.value as AdTopic)}
                className={inputClass}
              >
                {AD_TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>

          {form.category === "Other" && (
            <Field label="Custom Category">
              <input
                type="text"
                value={form.customCategory}
                onChange={(e) => updateField("customCategory", e.target.value)}
                placeholder="Enter custom category"
                className={inputClass}
              />
            </Field>
          )}

          {/* Excerpt */}
          <Field label="Excerpt / Meta Description" hint="1-2 sentences for SEO and blog cards.">
            <textarea
              value={form.excerpt}
              onChange={(e) => updateField("excerpt", e.target.value)}
              placeholder="A compelling 1-2 sentence summary of what this post covers..."
              rows={3}
              className={inputClass}
              style={{ minHeight: "80px" }}
            />
          </Field>

          {/* Writing Instructions for Claude */}
          <Field
            label="Writing Instructions for Claude"
            hint="Tell Claude what to write about, tone, target audience, keywords to include, length, structure, etc. If you provide full content below, Claude will enhance it instead."
          >
            <textarea
              value={form.writingInstructions}
              onChange={(e) => updateField("writingInstructions", e.target.value)}
              placeholder={`Example:\nWrite a 1200-word blog post about local SEO for US dentists in 2026.\nTone: authoritative but approachable.\nInclude: Google Business Profile tips, review strategies, and local content.\nTarget keywords: "dental SEO 2026", "local SEO for dentists"\nEnd with a CTA to book a free SEO audit with HotBot Studios.`}
              rows={8}
              className={inputClass}
            />
          </Field>

          {/* Content (optional if using Claude) */}
          <Field
            label="Content (HTML) — Optional"
            hint="If provided, Claude will enhance and format this. If left blank, Claude generates from your instructions above."
          >
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="<p>Your HTML content here, or leave blank to let Claude generate it...</p>"
              rows={10}
              className={`${inputClass} font-mono text-xs`}
            />
          </Field>

          {/* Tags + Author (2-col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tags" hint="Comma-separated, e.g: seo, google, marketing">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                placeholder="ai, automation, n8n, marketing"
                className={inputClass}
              />
            </Field>

            <Field label="Author">
              <input
                type="text"
                value={form.author}
                onChange={(e) => updateField("author", e.target.value)}
                placeholder="HotBot Studios"
                className={inputClass}
              />
            </Field>
          </div>

          {/* Status */}
          <Field label="Publish Status">
            <div className="flex gap-3">
              {(["published", "draft"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateField("status", s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    form.status === s
                      ? s === "published"
                        ? "bg-green-600/20 border-green-500/30 text-green-400"
                        : "bg-yellow-600/20 border-yellow-500/30 text-yellow-400"
                      : "bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-white"
                  }`}
                >
                  {s === "published" ? "✓ Publish" : "◎ Draft"}
                </button>
              ))}
            </div>
          </Field>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-4 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/20"
            >
              {status === "sending" ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending to N8N → Claude is writing...
                </span>
              ) : (
                "🚀 Send to N8N & Publish"
              )}
            </button>
            <p className="text-center text-slate-600 text-xs mt-3">
              N8N will validate your session → pass to Claude API → publish to hotbotstudios.com/blog
            </p>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

// ── Helpers ──────────────────────────────────────────────
const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
      {hint && <p className="text-slate-600 text-xs mb-2">{hint}</p>}
      {children}
    </div>
  );
}
