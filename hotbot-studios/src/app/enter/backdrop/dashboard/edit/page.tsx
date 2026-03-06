"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

const CATEGORIES = [
  "AI Automation", "Digital Marketing", "AI Products",
  "Content Strategy", "Public Relations", "SEO", "Social Media", "n8n",
];
const AD_TOPICS = ["general", "ai-automation", "ai-chatbot", "voice-ai", "n8n", "seo", "ppc", "social-media", "email-marketing", "analytics", "content", "video", "pr", "software-dev", "ui-ux", "consultancy"] as const;

function EditPostContent() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("slug") || "";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", category: CATEGORIES[0], tags: "",
    author: "", excerpt: "", content: "", adTopic: "general",
    featuredImage: "", readTime: "",
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
          adTopic: p.adTopic || "general", featuredImage: p.featuredImage || "",
          readTime: p.readTime || "",
        });
      })
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [slug, router]);

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent, status: "published" | "draft") {
    e.preventDefault();
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
        adTopic: form.adTopic, featuredImage: form.featuredImage || undefined,
        readTime: form.readTime || undefined, status,
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

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/enter/backdrop/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 text-sm font-medium truncate max-w-xs">{post?.title || "Edit Post"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "draft")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm text-slate-300 transition-colors hover:text-white disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "published")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            {saving ? "Saving…" : "Update Post"}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-3xl w-full mx-auto space-y-5">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="space-y-5">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Title *</label>
            <input className={inputClass} style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">/blog/</span>
              <input className={`${inputClass} flex-1`} style={inputStyle} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select className={inputClass} style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Ad Topic</label>
              <select className={inputClass} style={inputStyle} value={form.adTopic} onChange={(e) => set("adTopic", e.target.value)}>
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
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Content (HTML / Markdown) *</label>
            <textarea
              rows={20}
              className={inputClass}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "13px" }}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              required
            />
          </div>
        </div>
      </main>
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
