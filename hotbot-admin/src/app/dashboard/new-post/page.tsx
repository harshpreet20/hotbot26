"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { PostEditor, EMPTY_FORM } from "@/components/PostEditor";
import { useState } from "react";

export default function NewPostPage() {
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-white mb-1">New Blog Post</h1>
          <p className="text-slate-400 text-sm">
            Fill in the details below. Choose N8N + Claude for AI-enhanced content, or Direct Save to publish immediately.
          </p>
        </div>

        {lastUrl && (
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400">
            Last published:{" "}
            <a href={lastUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              {lastUrl} ↗
            </a>
          </div>
        )}

        <PostEditor
          initial={EMPTY_FORM}
          mode="new"
          onSuccess={({ url }) => {
            if (url) setLastUrl(url);
          }}
        />
      </div>
    </AdminLayout>
  );
}
