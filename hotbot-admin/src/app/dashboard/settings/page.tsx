"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useState } from "react";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotbotstudios.com";
const N8N_BASE = (process.env.NEXT_PUBLIC_N8N_BASE_URL || "").replace(/\/$/, "");
const N8N_AUTH_PATH = (process.env.NEXT_PUBLIC_N8N_WEBHOOK_BLOG_AUTH || "hotbotstudios-blog-auth").replace(/^\//, "");
const N8N_CREATE_PATH = (process.env.NEXT_PUBLIC_N8N_WEBHOOK_BLOG_CREATE || "hotbotstudios-blog-create").replace(/^\//, "");

type CheckStatus = "pending" | "ok" | "error" | "unconfigured";

interface Check {
  label: string;
  status: CheckStatus;
  detail: string;
}

export default function SettingsPage() {
  const [checks, setChecks] = useState<Check[]>([
    { label: "Main Site — Blog API", status: "pending", detail: `${MAIN_SITE}/api/blog/posts` },
    { label: "Server-Side Publish Proxy", status: "pending", detail: "/api/publish (server-side)" },
    { label: "N8N Auth Webhook", status: "pending", detail: N8N_BASE ? `${N8N_BASE}/${N8N_AUTH_PATH}` : "Not configured" },
    { label: "N8N Create Webhook", status: "pending", detail: N8N_BASE ? `${N8N_BASE}/${N8N_CREATE_PATH}` : "Not configured" },
  ]);
  const [running, setRunning] = useState(false);

  const envRows: { label: string; value: string; secret?: boolean }[] = [
    { label: "NEXT_PUBLIC_MAIN_SITE_URL", value: MAIN_SITE },
    { label: "NEXT_PUBLIC_N8N_BASE_URL", value: N8N_BASE || "(not set)" },
    { label: "NEXT_PUBLIC_N8N_WEBHOOK_BLOG_AUTH", value: N8N_AUTH_PATH },
    { label: "NEXT_PUBLIC_N8N_WEBHOOK_BLOG_CREATE", value: N8N_CREATE_PATH },
    { label: "BLOG_PUBLISH_SECRET", value: "(server-side only — not exposed in browser)", secret: true },
    { label: "MAIN_SITE_URL", value: "(server-side only — not exposed in browser)", secret: true },
  ];

  async function runChecks() {
    setRunning(true);
    const updated = [...checks];

    // 1. Main site blog API
    try {
      const r = await fetch(`${MAIN_SITE}/api/blog/posts?limit=1`);
      updated[0] = { ...updated[0], status: r.ok ? "ok" : "error", detail: `${MAIN_SITE}/api/blog/posts — HTTP ${r.status}` };
    } catch {
      updated[0] = { ...updated[0], status: "error", detail: `${MAIN_SITE}/api/blog/posts — Network error` };
    }
    setChecks([...updated]);

    // 2. Server-side proxy (GET with no slug just returns count)
    try {
      const r = await fetch("/api/publish");
      if (r.status === 500) {
        const d = await r.json() as { error?: string };
        updated[1] = { ...updated[1], status: "error", detail: d.error || "HTTP 500" };
      } else if (r.ok) {
        updated[1] = { ...updated[1], status: "ok", detail: "/api/publish — Connected to main site" };
      } else {
        updated[1] = { ...updated[1], status: "error", detail: `/api/publish — HTTP ${r.status}` };
      }
    } catch {
      updated[1] = { ...updated[1], status: "error", detail: "/api/publish — Network error" };
    }
    setChecks([...updated]);

    // 3. N8N auth webhook — just check reachability (HEAD or OPTIONS)
    if (!N8N_BASE) {
      updated[2] = { ...updated[2], status: "unconfigured", detail: "NEXT_PUBLIC_N8N_BASE_URL not set" };
      updated[3] = { ...updated[3], status: "unconfigured", detail: "NEXT_PUBLIC_N8N_BASE_URL not set" };
    } else {
      for (const [idx, path] of [[2, N8N_AUTH_PATH], [3, N8N_CREATE_PATH]] as [number, string][]) {
        try {
          // N8N webhooks return 404/405 on GET when they expect POST — that's expected
          const r = await fetch(`${N8N_BASE}/${path}`, { method: "GET", signal: AbortSignal.timeout(5000) });
          // 404 = path doesn't exist; 405 = exists but wrong method (good!)
          updated[idx] = {
            ...updated[idx],
            status: r.status === 405 || r.status === 200 ? "ok" : r.status === 404 ? "error" : "ok",
            detail: `${N8N_BASE}/${path} — HTTP ${r.status}`,
          };
        } catch {
          updated[idx] = { ...updated[idx], status: "error", detail: `${N8N_BASE}/${path} — Unreachable` };
        }
      }
    }
    setChecks([...updated]);
    setRunning(false);
  }

  useEffect(() => { runChecks(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white mb-0.5">Settings</h1>
            <p className="text-slate-400 text-sm">Environment configuration and connection health.</p>
          </div>
          <button
            onClick={runChecks}
            disabled={running}
            className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {running ? "Checking..." : "↺ Re-check"}
          </button>
        </div>

        {/* Connection checks */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Connection Health</h2>
          <div className="space-y-2">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="flex-shrink-0 text-base">
                  {c.status === "pending" && <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />}
                  {c.status === "ok" && "✅"}
                  {c.status === "error" && "❌"}
                  {c.status === "unconfigured" && "⚠️"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{c.label}</p>
                  <p className="text-slate-600 text-xs mt-0.5 font-mono truncate">{c.detail}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  c.status === "ok" ? "bg-green-500/10 text-green-400" :
                  c.status === "error" ? "bg-red-500/10 text-red-400" :
                  c.status === "unconfigured" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-slate-500/10 text-slate-500"
                }`}>
                  {c.status === "pending" ? "checking" : c.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Env vars */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Environment Variables</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {envRows.map((row, i) => (
              <div
                key={i}
                className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3 ${
                  i < envRows.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <code className="text-blue-400 text-xs font-mono flex-shrink-0 sm:w-72">{row.label}</code>
                <span className={`text-xs font-mono truncate ${row.secret ? "text-slate-600 italic" : "text-slate-300"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Setup guide */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Setup Guide</h2>
          <div className="space-y-3">
            <SetupStep
              num={1}
              title="Create .env.local in hotbot-admin/"
              code={`NEXT_PUBLIC_MAIN_SITE_URL=https://hotbotstudios.com
NEXT_PUBLIC_N8N_BASE_URL=https://your-n8n.com/webhook
NEXT_PUBLIC_N8N_WEBHOOK_BLOG_AUTH=hotbotstudios-blog-auth
NEXT_PUBLIC_N8N_WEBHOOK_BLOG_CREATE=hotbotstudios-blog-create
BLOG_PUBLISH_SECRET=your-secret-from-main-site
MAIN_SITE_URL=https://hotbotstudios.com`}
            />
            <SetupStep
              num={2}
              title="Set BLOG_PUBLISH_SECRET on the main site (hotbot-studios)"
              code={`# In hotbot-studios/.env.local\nBLOG_PUBLISH_SECRET=your-secret`}
            />
            <SetupStep
              num={3}
              title="Import N8N workflows"
              body="Import all JSON files from n8n-workflows/ into your N8N instance. Set environment variables for ADMIN_TOKEN, BLOG_PUBLISH_SECRET, MAIN_SITE_URL, and TELEGRAM_CHAT_ID."
            />
            <SetupStep
              num={4}
              title="Deploy admin panel"
              body="Deploy hotbot-admin/ to Vercel (separate project). Set the domain to admin.hotbotstudios.com or /admin subdirectory. Copy all env vars from .env.local to Vercel environment settings."
            />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function SetupStep({
  num,
  title,
  code,
  body,
}: {
  num: number;
  title: string;
  code?: string;
  body?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {num}
        </span>
        <p className="text-white text-sm font-semibold">{title}</p>
      </div>
      {body && <p className="text-slate-500 text-xs leading-relaxed">{body}</p>}
      {code && (
        <div className="relative">
          <pre className="bg-black/40 rounded-xl p-4 text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap">
            {code}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] bg-white/[0.07] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
