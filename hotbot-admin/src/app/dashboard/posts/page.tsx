"use client";

import { AdminLayout } from "@/components/AdminLayout";
import Link from "next/link";
import { useEffect, useState } from "react";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotbotstudios.com";

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  publishedAt: string;
  readTime: string;
  adTopic: string;
  tags: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "AI Automation": "#3b82f6",
  "Digital Marketing": "#22c55e",
  "AI Products": "#8b5cf6",
  "Content Strategy": "#ec4899",
  "Public Relations": "#f59e0b",
  "SEO": "#22c55e",
  "Social Media": "#ec4899",
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${MAIN_SITE}/api/blog/posts`)
      .then((r) => r.json())
      .then((data: { posts: Post[] }) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">All Posts</h1>
            <p className="text-slate-400 text-sm">{posts.length} post{posts.length !== 1 ? "s" : ""} published</p>
          </div>
          <Link
            href="/dashboard/new-post"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
          >
            + New Post
          </Link>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search posts by title, category, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>

        {loading && <p className="text-slate-500 text-sm py-12 text-center">Loading posts...</p>}

        {!loading && (
          <div className="space-y-2">
            {filtered.map((post) => {
              const color = CATEGORY_COLORS[post.category] || "#3b82f6";
              return (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: `${color}15`,
                          color,
                          border: `1px solid ${color}25`,
                        }}
                      >
                        {post.category}
                      </span>
                      <span className="text-slate-600 text-[10px]">Ad: {post.adTopic}</span>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{post.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })} · {post.readTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                      {post.status}
                    </span>
                    <a
                      href={`${MAIN_SITE}/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2] transition-colors"
                    >
                      View ↗
                    </a>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-12">
                {search ? "No posts match your search." : "No posts yet."}
              </p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
