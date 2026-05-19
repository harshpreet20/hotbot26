"use client";

import { AdminLayout } from "@/components/AdminLayout";
import Link from "next/link";
import { useEffect, useState } from "react";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotbotstudios.com";

interface PostMeta {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  publishedAt: string;
  readTime: string;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${MAIN_SITE}/api/blog/posts`)
      .then((r) => r.json())
      .then((data: { posts: PostMeta[] }) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load posts from the main site.");
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: "Published Posts", value: posts.filter((p) => p.status === "published").length, icon: "📝", color: "#3b82f6" },
    { label: "Categories", value: new Set(posts.map((p) => p.category)).size, icon: "🗂️", color: "#22c55e" },
    { label: "This Month", value: posts.filter((p) => new Date(p.publishedAt).getMonth() === new Date().getMonth()).length, icon: "📅", color: "#8b5cf6" },
    { label: "Total Views", value: "N/A", icon: "👁️", color: "#f59e0b" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage your HotBot Studios blog content.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{ background: `${stat.color}15` }}
              >
                {stat.icon}
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/new-post"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-blue-500/20 bg-blue-600/[0.06] hover:bg-blue-600/[0.1] hover:border-blue-500/40 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl">✏️</div>
            <div>
              <p className="text-white font-bold text-sm">Write New Post</p>
              <p className="text-slate-500 text-xs">Create and publish via N8N + Claude</p>
            </div>
            <span className="ml-auto text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <a
            href={`${MAIN_SITE}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl">🌐</div>
            <div>
              <p className="text-white font-bold text-sm">View Live Blog</p>
              <p className="text-slate-500 text-xs">hotbotstudios.com/blog ↗</p>
            </div>
            <span className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Recent posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Recent Posts</h2>
            <Link href="/dashboard/posts" className="text-xs text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>

          {loading && (
            <div className="text-slate-500 text-sm py-8 text-center">Loading posts...</div>
          )}

          {error && (
            <div className="text-red-400 text-sm py-4 px-4 rounded-xl bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{post.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{post.category} · {post.readTime}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                    {post.status}
                  </span>
                  <a
                    href={`${MAIN_SITE}/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-slate-500 hover:text-blue-400 transition-colors text-xs"
                  >
                    ↗
                  </a>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No posts yet. Create your first post!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
