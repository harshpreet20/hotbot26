"use client";
import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Project, ProjectUpdate, ProjectStatus, ProjectStage, ProjectUpdateType } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  planning:  { label: "Planning",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  on_hold:   { label: "On Hold",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  completed: { label: "Completed", color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const STAGE_CHIPS: { key: ProjectStage; label: string; color: string }[] = [
  { key: "discovery",   label: "Discovery",   color: "#818cf8" },
  { key: "design",      label: "Design",      color: "#a78bfa" },
  { key: "development", label: "Development", color: "#3b82f6" },
  { key: "qa",          label: "QA",          color: "#f59e0b" },
  { key: "launch",      label: "Launch",      color: "#22c55e" },
  { key: "support",     label: "Support",     color: "#14b8a6" },
];

const UPDATE_TYPES: ProjectUpdateType[] = [
  "update", "milestone", "deployment", "blocker", "sprint_summary", "design", "qa_pass", "launch",
];

const TYPE_ICON: Record<string, string> = {
  update:         "📝",
  milestone:      "🏆",
  deployment:     "🚀",
  approval_needed:"⚠️",
  blocker:        "🔴",
  sprint_summary: "📊",
  design:         "🎨",
  qa_pass:        "✅",
  launch:         "🎉",
  file:           "📎",
  note:           "💬",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(email: string) {
  return email.split("@")[0]?.slice(0, 2).toUpperCase() ?? "??";
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject]     = useState<Project & { client_info?: Record<string, unknown> } | null>(null);
  const [updates, setUpdates]     = useState<ProjectUpdate[]>([]);
  const [files, setFiles]         = useState<unknown[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Update feed filter
  const [visFilter, setVisFilter] = useState<"all" | "client" | "internal">("all");

  // Post update form
  const [postType, setPostType]   = useState<ProjectUpdateType>("update");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<"internal" | "client">("internal");
  const [postProgress, setPostProgress] = useState<number | "">("");
  const [postPinned, setPostPinned] = useState(false);
  const [posting, setPosting]     = useState(false);
  const [postError, setPostError] = useState("");

  // Inline edit state
  const [editingUpdate, setEditingUpdate] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVisibility, setEditVisibility] = useState<"internal" | "client">("internal");
  const [editPinned, setEditPinned] = useState(false);
  const [saving, setSaving]       = useState(false);

  // Progress inline edit
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  // Right panel edit
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm]   = useState({ name: "", description: "", start_date: "", target_date: "", budget: "", account_manager: "" });
  const [savingInfo, setSavingInfo] = useState(false);

  const load = useCallback(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    fetch(`/api/dashboard/projects/${id}`, { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) { ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k)); router.replace("/enter/backdrop"); return null; }
        if (r.status === 404) { setError("Project not found"); return null; }
        return r.json();
      })
      .then((d: { project?: Project & { client_info?: Record<string, unknown> }; updates?: ProjectUpdate[]; files?: unknown[] } | null) => {
        if (d) {
          setProject(d.project ?? null);
          setUpdates(d.updates ?? []);
          setFiles(d.files ?? []);
          setProgressValue(d.project?.progress ?? 0);
          if (d.project) {
            setInfoForm({
              name: d.project.name ?? "",
              description: d.project.description ?? "",
              start_date: d.project.start_date ?? "",
              target_date: d.project.target_date ?? "",
              budget: d.project.budget != null ? String(d.project.budget) : "",
              account_manager: d.project.account_manager ?? "",
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const realtimeClient = createClient(url, key);
    const channel = realtimeClient
      .channel(`project-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_updates", filter: `project_id=eq.${id}` },
        (payload) => {
          setUpdates((prev) => {
            const newUpdate = payload.new as ProjectUpdate;
            if (prev.some((u) => u.id === newUpdate.id)) return prev;
            return [newUpdate, ...prev];
          });
        }
      )
      .subscribe();

    return () => { void realtimeClient.removeChannel(channel); };
  }, [id]);

  async function patchProject(fields: Record<string, unknown>) {
    const secret = getSecret();
    const res = await fetch(`/api/dashboard/projects/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json() as { project?: Project };
    if (res.ok && data.project) {
      setProject((prev) => prev ? { ...prev, ...data.project! } : data.project ?? null);
    }
    return res.ok;
  }

  async function handleStageChange(stage: ProjectStage) {
    await patchProject({ stage });
  }

  async function handleStatusChange(status: ProjectStatus) {
    await patchProject({ status });
  }

  async function handleProgressSave() {
    await patchProject({ progress: progressValue });
    setEditingProgress(false);
  }

  async function handleInfoSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    const ok = await patchProject({
      name: infoForm.name,
      description: infoForm.description,
      start_date: infoForm.start_date || null,
      target_date: infoForm.target_date || null,
      budget: infoForm.budget ? parseFloat(infoForm.budget) : null,
      account_manager: infoForm.account_manager || null,
    });
    if (ok) setEditingInfo(false);
    setSavingInfo(false);
  }

  async function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPosting(true);
    setPostError("");
    try {
      const secret = getSecret();
      const res = await fetch(`/api/dashboard/projects/${id}/updates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: postType,
          title: postTitle || undefined,
          content: postContent,
          visibility: postVisibility,
          progress: postProgress !== "" ? Number(postProgress) : undefined,
          pinned: postPinned,
        }),
      });
      const data = await res.json() as { error?: string; update?: ProjectUpdate };
      if (!res.ok) { setPostError(data.error ?? "Failed to post update"); return; }
      if (data.update) {
        setUpdates((prev) => [data.update!, ...prev.filter((u) => u.id !== data.update!.id)]);
      }
      setPostTitle("");
      setPostContent("");
      setPostProgress("");
      setPostPinned(false);
    } catch { setPostError("Network error"); }
    finally { setPosting(false); }
  }

  async function deleteUpdate(updateId: string) {
    if (!confirm("Delete this update?")) return;
    const secret = getSecret();
    const res = await fetch(`/api/dashboard/projects/${id}/updates/${updateId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (res.ok) setUpdates((prev) => prev.filter((u) => u.id !== updateId));
  }

  function startEditUpdate(u: ProjectUpdate) {
    setEditingUpdate(u.id);
    setEditTitle(u.title ?? "");
    setEditContent(u.content);
    setEditVisibility(u.visibility);
    setEditPinned(u.pinned);
  }

  async function saveEditUpdate(updateId: string) {
    setSaving(true);
    const secret = getSecret();
    const res = await fetch(`/api/dashboard/projects/${id}/updates/${updateId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent, visibility: editVisibility, pinned: editPinned }),
    });
    const data = await res.json() as { update?: ProjectUpdate };
    if (res.ok && data.update) {
      setUpdates((prev) => prev.map((u) => u.id === updateId ? data.update! : u));
      setEditingUpdate(null);
    }
    setSaving(false);
  }

  const visibleUpdates = updates.filter((u) => {
    if (visFilter === "all") return true;
    if (visFilter === "client") return u.visibility === "client";
    if (visFilter === "internal") return u.visibility === "internal";
    return true;
  });

  const sortedUpdates = [
    ...visibleUpdates.filter((u) => u.pinned),
    ...visibleUpdates.filter((u) => !u.pinned),
  ];

  if (loading) {
    return (
      <>
        <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <div className="text-slate-500 text-sm py-20 text-center">
          {error || "Project not found"}
          <br />
          <Link href="/enter/backdrop/dashboard/projects" className="text-indigo-400 mt-2 inline-block">← Back to Projects</Link>
        </div>
      </>
    );
  }

  const sm = STATUS_META[project.status];

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <Link href="/enter/backdrop/dashboard/projects" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            ← Projects
          </Link>
          <span className="text-slate-700">/</span>
          <span className="font-mono text-indigo-400 text-sm">{project.project_number ?? "—"}</span>
          <span className="text-slate-500 text-sm">{project.client_name ?? project.client_id}</span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ color: sm.color, background: sm.bg }}
          >
            {sm.label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="px-3 py-1.5 rounded-xl text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Split layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel — updates feed */}
          <div className="flex flex-col flex-1 min-w-0 border-r overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {/* Project name + progress */}
            <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h1 className="text-white text-lg font-semibold mb-3">{project.name}</h1>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 rounded-full h-2 overflow-hidden cursor-pointer" style={{ background: "rgba(255,255,255,0.08)" }} onClick={() => setEditingProgress(true)}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${project.progress ?? 0}%`, background: project.progress === 100 ? "#22c55e" : "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
                  />
                </div>
                {editingProgress ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressValue}
                      onChange={(e) => setProgressValue(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg text-xs text-white outline-none text-center"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(99,102,241,0.5)" }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleProgressSave(); if (e.key === "Escape") setEditingProgress(false); }}
                      autoFocus
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <button onClick={handleProgressSave} className="text-xs text-indigo-400 hover:text-indigo-300">Save</button>
                    <button onClick={() => setEditingProgress(false)} className="text-xs text-slate-500 hover:text-slate-400">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingProgress(true)} className="text-xs text-slate-500 hover:text-slate-300 tabular-nums w-10 text-right">
                    {project.progress ?? 0}%
                  </button>
                )}
              </div>

              {/* Stage chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {STAGE_CHIPS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleStageChange(s.key)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={
                      project.stage === s.key
                        ? { background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55`, fontWeight: 600 }
                        : { background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.07)" }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Updates feed header + filter */}
            <div className="flex items-center gap-3 px-6 py-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-white text-sm font-medium">Updates</span>
              <span className="text-slate-600 text-xs">{updates.length} total</span>
              <div className="ml-auto flex items-center gap-1">
                {(["all", "client", "internal"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisFilter(v)}
                    className="px-2.5 py-1 rounded-lg text-xs transition-colors capitalize"
                    style={
                      visFilter === v
                        ? { background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }
                        : { color: "#475569", border: "1px solid transparent" }
                    }
                  >
                    {v === "all" ? "All" : v === "client" ? "Client" : "Internal"}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {sortedUpdates.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-10">No updates yet. Post one below.</p>
              )}
              {sortedUpdates.map((u) => (
                <div
                  key={u.id}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: u.pinned ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.03)",
                    border: u.pinned ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {editingUpdate === u.id ? (
                    <div className="space-y-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={editVisibility}
                          onChange={(e) => setEditVisibility(e.target.value as "internal" | "client")}
                          className="px-2 py-1 rounded-lg text-xs text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                        >
                          <option value="internal">Internal Only</option>
                          <option value="client">Client can see</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                          <input type="checkbox" checked={editPinned} onChange={(e) => setEditPinned(e.target.checked)} />
                          Pin
                        </label>
                        <div className="ml-auto flex items-center gap-2">
                          <button onClick={() => saveEditUpdate(u.id)} disabled={saving} className="px-3 py-1 rounded-lg text-xs font-medium text-white disabled:opacity-50" style={{ background: "rgba(99,102,241,0.6)" }}>
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingUpdate(null)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">{TYPE_ICON[u.type] ?? "📝"}</span>
                          <span className="text-xs font-medium capitalize" style={{ color: "#94a3b8" }}>{u.type.replace("_", " ")}</span>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={
                              u.visibility === "client"
                                ? { color: "#34d399", background: "rgba(52,211,153,0.12)" }
                                : { color: "#94a3b8", background: "rgba(148,163,184,0.1)" }
                            }
                          >
                            {u.visibility === "client" ? "👁 Client" : "🔒 Internal"}
                          </span>
                          {u.pinned && (
                            <span className="text-[10px] text-indigo-400 font-semibold">📌 Pinned</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEditUpdate(u)}
                            className="text-xs text-slate-600 hover:text-indigo-400 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUpdate(u.id)}
                            className="text-xs text-slate-700 hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {u.title && (
                        <h3 className="text-white font-medium text-sm mb-1">{u.title}</h3>
                      )}
                      <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">{u.content}</p>
                      {u.progress != null && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 rounded-full h-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full" style={{ width: `${u.progress}%`, background: "#6366f1" }} />
                          </div>
                          <span className="text-xs text-slate-500">{u.progress}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                          {initials(u.author_email)}
                        </div>
                        <span className="text-xs text-slate-600">{u.author_name ?? u.author_email}</span>
                        <span className="text-slate-700 text-xs">·</span>
                        <span className="text-xs text-slate-700">{fmtDate(u.created_at)}</span>
                        {Array.isArray(u.reactions) && u.reactions.length > 0 && (
                          <span className="text-xs text-slate-600 ml-1">
                            {[...new Set(u.reactions.map((r) => r.emoji))].join(" ")} {u.reactions.length}
                          </span>
                        )}
                        {Array.isArray(u.comments) && u.comments.length > 0 && (
                          <span className="text-xs text-slate-600">💬 {u.comments.length}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Post update form — sticky */}
            <div className="border-t p-4 shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
              <form onSubmit={postUpdate} className="space-y-3">
                {postError && <p className="text-red-400 text-xs">{postError}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  {UPDATE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPostType(t)}
                      className="px-2.5 py-1 rounded-lg text-xs transition-colors capitalize"
                      style={
                        postType === t
                          ? { background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }
                          : { background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.07)" }
                      }
                    >
                      {TYPE_ICON[t]} {t.replace("_", " ")}
                    </button>
                  ))}
                </div>
                <input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <textarea
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write an update…"
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPostVisibility((v) => v === "internal" ? "client" : "internal")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                    style={
                      postVisibility === "client"
                        ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
                        : { background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.1)" }
                    }
                  >
                    {postVisibility === "client" ? "👁 Client can see this" : "🔒 Internal only"}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={postProgress}
                      onChange={(e) => setPostProgress(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Progress %"
                      className="w-24 px-2 py-1.5 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={postPinned}
                      onChange={(e) => setPostPinned(e.target.checked)}
                      className="rounded"
                    />
                    Pin this update
                  </label>
                  <button
                    type="submit"
                    disabled={posting || !postContent.trim()}
                    className="ml-auto px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  >
                    {posting ? "Posting…" : "Post Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-80 shrink-0 overflow-y-auto p-4 space-y-4">
            {/* Project Info */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Project Info</span>
                <button
                  onClick={() => setEditingInfo((v) => !v)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {editingInfo ? "Cancel" : "Edit"}
                </button>
              </div>
              {editingInfo ? (
                <form onSubmit={handleInfoSave} className="space-y-2.5">
                  <InfoField label="Name">
                    <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} className="rfi" required />
                  </InfoField>
                  <InfoField label="Description">
                    <textarea value={infoForm.description} onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })} rows={2} className="rfi resize-none" />
                  </InfoField>
                  <InfoField label="Start Date">
                    <input type="date" value={infoForm.start_date} onChange={(e) => setInfoForm({ ...infoForm, start_date: e.target.value })} className="rfi" />
                  </InfoField>
                  <InfoField label="Target Date">
                    <input type="date" value={infoForm.target_date} onChange={(e) => setInfoForm({ ...infoForm, target_date: e.target.value })} className="rfi" />
                  </InfoField>
                  <InfoField label="Budget">
                    <input type="number" value={infoForm.budget} onChange={(e) => setInfoForm({ ...infoForm, budget: e.target.value })} className="rfi" />
                  </InfoField>
                  <InfoField label="Account Manager">
                    <input value={infoForm.account_manager} onChange={(e) => setInfoForm({ ...infoForm, account_manager: e.target.value })} className="rfi" />
                  </InfoField>
                  <button type="submit" disabled={savingInfo} className="w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: "rgba(99,102,241,0.7)" }}>
                    {savingInfo ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="space-y-2.5">
                  <InfoRow label="Name" value={project.name} />
                  {project.description && <InfoRow label="Description" value={project.description} />}
                  {project.start_date && <InfoRow label="Start" value={fmtDateShort(project.start_date)} />}
                  {project.target_date && <InfoRow label="Target" value={fmtDateShort(project.target_date)} />}
                  {project.budget && <InfoRow label="Budget" value={`${project.currency} ${project.budget.toLocaleString()}`} />}
                  {project.account_manager && <InfoRow label="Account Mgr" value={project.account_manager} />}
                  <InfoRow label="Priority" value={project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} />
                </div>
              )}
            </div>

            {/* Team */}
            {(project.assigned_to?.length > 0 || project.account_manager) && (
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Team</span>
                <div className="mt-3 space-y-2">
                  {project.assigned_to?.map((email) => (
                    <div key={email} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                        {initials(email)}
                      </div>
                      <span className="text-xs text-slate-400 truncate">{email}</span>
                    </div>
                  ))}
                  {project.account_manager && (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "rgba(20,184,166,0.2)", color: "#14b8a6" }}>
                        {initials(project.account_manager)}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 truncate block">{project.account_manager}</span>
                        <span className="text-[10px] text-teal-500">Account Mgr</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Client */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Client</span>
              <div className="mt-3 space-y-1.5">
                <p className="text-white text-sm font-medium">{project.client_name ?? "—"}</p>
                <span className="font-mono text-xs text-indigo-400">{project.client_id}</span>
                <br />
                <Link
                  href={`/enter/backdrop/dashboard/clients`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View client profile →
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Quick Stats</span>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xl font-bold text-white">{updates.length}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Total updates</p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xl font-bold text-white">{updates.filter((u) => u.visibility === "client").length}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Client-visible</p>
                </div>
                <div className="rounded-lg p-2.5 col-span-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xl font-bold text-white">{(files as unknown[]).length}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Files</p>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <span className="text-xs text-red-500 font-medium uppercase tracking-wider">Danger Zone</span>
              <div className="mt-3">
                <button
                  onClick={async () => {
                    if (!confirm("Archive this project? It will be set to cancelled status.")) return;
                    const secret = getSecret();
                    const res = await fetch(`/api/dashboard/projects/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${secret}` } });
                    if (res.ok) router.push("/enter/backdrop/dashboard/projects");
                  }}
                  className="w-full py-2 rounded-lg text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  style={{ border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  Archive Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rfi {
          width: 100%;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0;
          font-size: 12px;
          outline: none;
        }
        .rfi:focus { border-color: rgba(99,102,241,0.5); }
        option { background: #0f1626; color: #e2e8f0; }
      `}</style>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[11px] text-slate-600 shrink-0">{label}</span>
      <span className="text-xs text-slate-300 text-right break-all">{value}</span>
    </div>
  );
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
