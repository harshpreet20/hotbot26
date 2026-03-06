"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

function getSecret() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("backdrop_secret") || "";
}

export default function BackdropDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/publish?secret=${encodeURIComponent(secret)}`);
      if (res.status === 401) { router.replace("/enter/backdrop"); return; }
      // publish endpoint returns { count, slugs } — load full posts via posts endpoint
      const allRes = await fetch(`/api/blog/posts?status=published&limit=500`);
      const data = await allRes.json() as { posts: BlogPost[] };
      setPosts(data.posts || []);
    } catch {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    const secret = getSecret();
    setDeleting(slug);
    try {
      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, action: "delete", post: { slug, title: slug } }),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      alert("Failed to delete post.");
    } finally {
      setDeleting(null);
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    "AI Automation": "#3b82f6",
    "Digital Marketing": "#22c55e",
    "AI Products": "#8b5cf6",
    "Content Strategy": "#ec4899",
    "Public Relations": "#f59e0b",
    SEO: "#22c55e",
    "Social Media": "#ec4899",
    n8n: "#f97316",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            ✦
          </div>
          <span className="font-semibold text-white">Backdrop</span>
          <span className="text-slate-500 text-sm">/</span>
          <span className="text-slate-400 text-sm">All Posts</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
          <Link
            href="/enter/backdrop/dashboard/new"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            + New Post
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem("backdrop_secret"); router.push("/enter/backdrop"); }}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">No published posts yet.</p>
            <Link href="/enter/backdrop/dashboard/new" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const color = CATEGORY_COLORS[post.category] || "#64748b";
              return (
                <div
                  key={post.slug}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-white/[0.02]"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Category dot */}
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{post.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-slate-500 text-xs">{post.category}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      View ↗
                    </a>
                    <Link
                      href={`/enter/backdrop/dashboard/edit?slug=${post.slug}`}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      disabled={deleting === post.slug}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.06)" }}
                    >
                      {deleting === post.slug ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
