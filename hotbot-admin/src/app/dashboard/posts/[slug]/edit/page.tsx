"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { PostEditor, EMPTY_FORM } from "@/components/PostEditor";
import type { PostFormData } from "@/components/PostEditor";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface RawPost {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  adTopic?: string;
  tags?: string[];
  author?: string;
  status?: "published" | "draft";
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [initialForm, setInitialForm] = useState<Partial<PostFormData> | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/publish?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: { exists?: boolean; post?: RawPost; error?: string }) => {
        if (!data.exists || !data.post) {
          setLoadError(data.error || "Post not found.");
          return;
        }
        const post = data.post;
        setInitialForm({
          ...EMPTY_FORM,
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          category: post.category || "AI Automation",
          adTopic: (post.adTopic as PostFormData["adTopic"]) || "general",
          tags: (post.tags || []).join(", "),
          author: post.author || "HotBot Studios",
          status: post.status || "published",
        });
      })
      .catch(() => setLoadError("Could not load post. Check your admin server config."));
  }, [slug]);

  function handleSuccess({ slug: savedSlug }: { slug: string }) {
    setTimeout(() => router.push("/dashboard/posts"), 1500);
    void savedSlug;
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard/posts" className="text-slate-500 hover:text-white text-sm transition-colors">
                ← Posts
              </Link>
              <span className="text-slate-700 text-sm">/</span>
              <span className="text-slate-400 text-sm">Edit</span>
            </div>
            <h1 className="text-2xl font-black text-white">Edit Post</h1>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">/blog/{slug}</p>
          </div>
        </div>

        {/* Error state */}
        {loadError && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <p className="text-red-400 text-sm">⚠️ {loadError}</p>
            <Link href="/dashboard/posts" className="text-red-300 text-xs underline mt-2 block">
              Back to posts
            </Link>
          </div>
        )}

        {/* Loading state */}
        {!initialForm && !loadError && (
          <div className="py-20 text-center text-slate-500 text-sm">
            <svg className="animate-spin h-6 w-6 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading post...
          </div>
        )}

        {/* Editor */}
        {initialForm && !loadError && (
          <PostEditor
            initial={initialForm}
            mode="edit"
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
