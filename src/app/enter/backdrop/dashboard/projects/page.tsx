"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project, ProjectStatus } from "@/types/dashboard";

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

const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  discovery:   { label: "Discovery",   color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  design:      { label: "Design",      color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  development: { label: "Development", color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  qa:          { label: "QA",          color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  launch:      { label: "Launch",      color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  support:     { label: "Support",     color: "#14b8a6", bg: "rgba(20,184,166,0.12)"  },
};

const PRIORITY_META: Record<string, { label: string; icon: string; color: string }> = {
  urgent: { label: "Urgent", icon: "🔴", color: "#ef4444" },
  high:   { label: "High",   icon: "🟠", color: "#f97316" },
  medium: { label: "Medium", icon: "🟡", color: "#f59e0b" },
  low:    { label: "Low",    icon: "🟢", color: "#22c55e" },
};

interface ClientOption { id: string; client_id: string; name: string; }

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState("");
  const [clients, setClients]     = useState<ClientOption[]>([]);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const role = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
  const canDelete = role === "super_admin";

  const [form, setForm] = useState({
    client_id: "",
    name: "",
    description: "",
    stage: "discovery",
    priority: "medium",
    start_date: "",
    target_date: "",
    assigned_to: "",
    account_manager: "",
    budget: "",
    currency: "INR",
  });

  const load = useCallback(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    fetch("/api/dashboard/projects", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setProjects((d as { projects: Project[] }).projects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) return;
    fetch("/api/dashboard/clients", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d: { clients?: ClientOption[] } | null) => {
        if (d?.clients) setClients(d.clients);
      })
      .catch(() => {});
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [p.name, p.client_name ?? "", p.project_number ?? "", p.client_id].some(
      (v) => v.toLowerCase().includes(q)
    );
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchPriority = !priorityFilter || p.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.name) return;
    setCreating(true);
    setCreateError("");
    try {
      const secret = getSecret();
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? parseFloat(form.budget) : undefined,
          assigned_to: form.assigned_to ? form.assigned_to.split(",").map((s) => s.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json() as { error?: string; project?: Project };
      if (!res.ok) { setCreateError(data.error ?? "Failed to create project"); return; }
      setShowCreate(false);
      setForm({ client_id: "", name: "", description: "", stage: "discovery", priority: "medium", start_date: "", target_date: "", assigned_to: "", account_manager: "", budget: "", currency: "INR" });
      load();
    } catch { setCreateError("Network error"); }
    finally { setCreating(false); }
  }

  async function archiveProject(id: string, name: string) {
    if (!confirm(`Archive project "${name}"? This will set the project status to cancelled.`)) return;
    const secret = getSecret();
    setDeleting(id);
    try {
      await fetch(`/api/dashboard/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${secret}` },
      });
      load();
    } finally {
      setDeleting(null);
    }
  }

  const stats = {
    active: projects.filter((p) => p.status === "active").length,
    planning: projects.filter((p) => p.status === "planning").length,
    completed: projects.filter((p) => p.status === "completed").length,
    onHold: projects.filter((p) => p.status === "on_hold").length,
  };

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-wrap gap-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Projects</h1>
            <p className="text-slate-500 text-xs mt-0.5">Track and manage client projects</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-48"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All priorities</option>
              {Object.entries(PRIORITY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowCreate(true); setCreateError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              + New Project
            </button>
          </div>
        </header>

        {/* Stats */}
        {!loading && (
          <div className="flex gap-4 px-6 pt-5">
            {[
              { label: "Active", value: stats.active, color: "#34d399" },
              { label: "Planning", value: stats.planning, color: "#94a3b8" },
              { label: "On Hold", value: stats.onHold, color: "#f59e0b" },
              { label: "Completed", value: stats.completed, color: "#818cf8" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 flex-1" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search || statusFilter || priorityFilter
                ? "No matching projects."
                : "No projects yet. Create your first project →"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Project #", "Client", "Name", "Status", "Stage", "Progress", "Priority", "Target Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const sm = STATUS_META[p.status];
                    const stm = STAGE_META[p.stage] ?? STAGE_META.discovery;
                    const pm = PRIORITY_META[p.priority] ?? PRIORITY_META.medium;
                    return (
                      <tr key={p.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        {/* Project # */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Link href={`/enter/backdrop/dashboard/projects/${p.id}`} className="font-mono text-xs text-indigo-400 hover:text-indigo-300">
                            {p.project_number ?? "—"}
                          </Link>
                        </td>
                        {/* Client */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="text-white text-sm font-medium">{p.client_name ?? "—"}</p>
                          <span className="font-mono text-xs" style={{ color: "#818cf8" }}>{p.client_id}</span>
                        </td>
                        {/* Name */}
                        <td className="py-3 px-3 max-w-[200px]">
                          <p className="text-slate-200 truncate">{p.name}</p>
                          {p.description && <p className="text-slate-600 text-xs truncate">{p.description}</p>}
                        </td>
                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ color: sm.color, background: sm.bg }}>
                            {sm.label}
                          </span>
                        </td>
                        {/* Stage */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ color: stm.color, background: stm.bg }}>
                            {stm.label}
                          </span>
                        </td>
                        {/* Progress */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${p.progress ?? 0}%`, background: p.progress === 100 ? "#22c55e" : "#6366f1" }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 tabular-nums">{p.progress ?? 0}%</span>
                          </div>
                        </td>
                        {/* Priority */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-xs" style={{ color: pm.color }}>
                            {pm.icon} {pm.label}
                          </span>
                        </td>
                        {/* Target Date */}
                        <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                          {p.target_date
                            ? new Date(p.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        {/* Actions */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/enter/backdrop/dashboard/projects/${p.id}`}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              View
                            </Link>
                            {canDelete && (
                              <button
                                onClick={() => archiveProject(p.id, p.name)}
                                disabled={deleting === p.id}
                                className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-40 text-xs"
                                title="Archive project (sets status to cancelled)"
                              >
                                {deleting === p.id ? "…" : "✕"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <form
            onSubmit={handleCreate}
            className="w-full max-w-2xl rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[90vh]"
            style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">New Project</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
            </div>

            {createError && <p className="text-red-400 text-sm">{createError}</p>}

            <div className="grid grid-cols-2 gap-3">
              <F label="Client *" className="col-span-2">
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="fi"
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.client_id}>{c.name} ({c.client_id})</option>
                  ))}
                </select>
              </F>
              <F label="Project Name *" className="col-span-2">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Website Redesign"
                  className="fi"
                />
              </F>
              <F label="Description" className="col-span-2">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of the project…"
                  className="fi resize-none"
                />
              </F>
              <F label="Stage">
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="fi">
                  {Object.entries(STAGE_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </F>
              <F label="Priority">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="fi">
                  {Object.entries(PRIORITY_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </F>
              <F label="Start Date">
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="fi" />
              </F>
              <F label="Target Date">
                <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="fi" />
              </F>
              <F label="Assigned To (comma-separated emails)" className="col-span-2">
                <input
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="dev@hotbotstudios.com, design@hotbotstudios.com"
                  className="fi"
                />
              </F>
              <F label="Account Manager">
                <input
                  value={form.account_manager}
                  onChange={(e) => setForm({ ...form, account_manager: e.target.value })}
                  placeholder="manager@hotbotstudios.com"
                  className="fi"
                />
              </F>
              <F label="Currency">
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="fi">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </F>
              <F label="Budget" className="col-span-2">
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="0"
                  className="fi"
                />
              </F>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                {creating ? "Creating…" : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .fi {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0;
          font-size: 13px;
          outline: none;
        }
        .fi:focus { border-color: rgba(99,102,241,0.5); }
        option { background: #0f1626; color: #e2e8f0; }
      `}</style>
    </>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
