"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { BlogPost, BlogAdTopic } from "@/types/blog";
import { SeoPanel } from "@/components/backdrop/SeoPanel";

const CATEGORIES = [
  "AI Automation", "Digital Marketing", "AI Products",
  "Content Strategy", "Public Relations", "SEO", "Social Media", "n8n",
];
const AD_TOPICS = ["general", "ai-automation", "ai-chatbot", "voice-ai", "n8n", "seo", "ppc", "social-media", "email-marketing", "analytics", "content", "video", "pr", "software-dev", "ui-ux", "consultancy"] as const;

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function EditPostContent() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("slug") || "";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", category: CATEGORIES[0], tags: "",
    author: "", excerpt: "", content: "", adTopic: "general" as BlogAdTopic,
    featuredImage: "", readTime: "",
    // SEO
    metaTitle: "", metaDescription: "", focusKeyword: "", featuredImageAlt: "",
  });

  useEffect(() => {
    if (!slug) { router.replace("/enter/backdrop/dashboard"); return; }
    const secret = sessionStorage.getItem("backdrop_secret");
    if (!secret) { router.replace("/enter/backdrop"); return; }

    fetch(`/api/blog/publish?secret=${encodeURIComponent(secret)}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d: { exists: boolean; post: BlogPost | null }) => {
        if (!d.exists || !d.post) { router.replace("/enter/backdrop/dashboard"); return; }
        const p = d.post;
        setPost(p);
        setForm({
          title: p.title, slug: p.slug, category: p.category,
          tags: (p.tags || []).join(", "), author: p.author || "",
          excerpt: p.excerpt || "", content: p.content || "",
          adTopic: (p.adTopic as BlogAdTopic) || "general",
          featuredImage: p.featuredImage || "", readTime: p.readTime || "",
          // SEO
          metaTitle: p.metaTitle || p.title || "",
          metaDescription: p.metaDescription || p.excerpt || "",
          focusKeyword: p.focusKeyword || "",
          featuredImageAlt: p.featuredImageAlt || "",
        });
      })
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [slug, router]);

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(status: "published" | "draft") {
    setError("");
    const secret = sessionStorage.getItem("backdrop_secret");
    if (!secret) { router.replace("/enter/backdrop"); return; }
    setSaving(true);
    try {
      const updatedPost = {
        ...(post || {}),
        title: form.title, slug: form.slug, category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        author: form.author || "HotBot Studios",
        excerpt: form.excerpt, content: form.content,
        adTopic: form.adTopic,
        featuredImage: form.featuredImage || undefined,
        featuredImageAlt: form.featuredImageAlt || undefined,
        readTime: form.readTime || undefined,
        status,
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription || form.excerpt,
        focusKeyword: form.focusKeyword,
      };
      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, post: updatedPost }),
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
  const wordCount = form.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,10,20,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/enter/backdrop/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 text-sm font-medium truncate max-w-xs">{post?.title || "Edit Post"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm text-slate-300 transition-colors hover:text-white disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            {saving ? "Saving…" : "Update Post"}
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
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select className={inputClass} style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Ad Topic</label>
              <select className={inputClass} style={inputStyle} value={form.adTopic} onChange={(e) => set("adTopic", e.target.value as BlogAdTopic)}>
                {AD_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Author</label>
              <input className={inputClass} style={inputStyle} value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Read Time</label>
              <input className={inputClass} style={inputStyle} value={form.readTime} onChange={(e) => set("readTime", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Tags (comma-separated)</label>
            <input className={inputClass} style={inputStyle} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
            <input className={inputClass} style={inputStyle} value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Excerpt</label>
            <textarea rows={2} className={inputClass} style={{ ...inputStyle, resize: "vertical" }} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Content *</label>
              <span className="text-xs text-slate-600">{wordCount} words</span>
            </div>
            {preview ? (
              <div
                className="prose prose-invert prose-sm max-w-none px-5 py-5 rounded-xl min-h-[400px]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            ) : (
              <textarea
                rows={24}
                className={inputClass}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.7" }}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
              />
            )}
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
            onSlug={(v) => set("slug", slugify(v))}
          />
        </aside>
      </div>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>}>
      <EditPostContent />
    </Suspense>
  );
}
