"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import { WhiteboardModal } from "@/components/backdrop/WhiteboardModal";
import { GoogleMeetButton } from "@/components/backdrop/GoogleMeetButton";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProjectStatus   = "discovery" | "planning" | "in_progress" | "review" | "done";
type ProjectPriority = "low" | "medium" | "high" | "urgent";
type ProjectStage    = "discovery" | "planning" | "design" | "development" | "testing" | "launch" | "maintenance";

interface Project {
  id: string;
  project_number?: string | null;
  client_id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  stage: ProjectStage;
  priority: ProjectPriority;
  progress: number;
  start_date?: string | null;
  target_date?: string | null;
  completed_date?: string | null;
  assigned_to?: string[] | null;
  account_manager?: string | null;
  budget?: number | null;
  currency: string;
  tags?: string[] | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  meet_url?: string | null;
  meet_scheduled_at?: string | null;
  whiteboard_data?: Record<string, unknown> | null;
}

interface Client {
  id: string;
  client_id: string;
  name: string;
  company?: string;
  status?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS: { status: ProjectStatus; label: string; color: string; bg: string }[] = [
  { status: "discovery",   label: "Discovery",   color: "#818cf8", bg: "rgba(129,140,248,0.08)" },
  { status: "planning",    label: "Planning",    color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  { status: "in_progress", label: "In Progress", color: "#34d399", bg: "rgba(52,211,153,0.08)"  },
  { status: "review",      label: "Review",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  { status: "done",        label: "Done",        color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
];

const PRIORITY_META: Record<ProjectPriority, { label: string; color: string; bg: string }> = {
  low:    { label: "Low",    color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  high:   { label: "High",   color: "#f97316", bg: "rgba(249,115,22,0.15)"  },
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
};

const STAGE_OPTIONS: ProjectStage[] = ["discovery", "planning", "design", "development", "testing", "launch", "maintenance"];
const STATUS_OPTIONS: ProjectStatus[] = ["discovery", "planning", "in_progress", "review", "done"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  const m = PRIORITY_META[priority];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: m.color, background: m.bg }}
    >
      {m.label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct === 100 ? "#10b981" : pct >= 60 ? "#6366f1" : pct >= 30 ? "#f59e0b" : "#94a3b8";
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-slate-500">Progress</span>
        <span className="text-[10px] font-medium" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  clientName,
  onEdit,
  onDelete,
  onWhiteboard,
  onMeetUpdate,
  canWrite,
  isAdmin,
}: {
  project: Project;
  clientName: string;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onWhiteboard: (p: Project) => void;
  onMeetUpdate: (projectId: string, url: string | null, scheduledAt?: string | null) => void;
  canWrite: boolean;
  isAdmin: boolean;
}) {
  const assigned = project.assigned_to?.filter(Boolean) ?? [];

  return (
    <div
      className="rounded-xl p-3.5 mb-2 group transition-all duration-150 hover:translate-y-[-1px]"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Name + priority */}
      <div
        className="flex items-start justify-between gap-2 mb-1.5 cursor-pointer"
        onClick={() => canWrite && onEdit(project)}
      >
        <p className="text-slate-100 text-sm font-medium leading-snug flex-1 min-w-0 truncate">{project.name}</p>
        <PriorityBadge priority={project.priority} />
      </div>

      {/* Client */}
      <p className="text-xs text-slate-500 mb-2 truncate">
        <span className="font-mono text-indigo-400/80">{project.client_id}</span>
        {clientName && <span className="ml-1">· {clientName}</span>}
      </p>

      {/* Progress bar */}
      <ProgressBar value={project.progress} />

      {/* Collab actions */}
      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        {/* Whiteboard */}
        <button
          onClick={(e) => { e.stopPropagation(); onWhiteboard(project); }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          title="Open Whiteboard"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Whiteboard
        </button>

        {/* Google Meet */}
        <div onClick={(e) => e.stopPropagation()}>
          <GoogleMeetButton
            entityType="project"
            entityId={project.id}
            meetUrl={project.meet_url}
            scheduledAt={project.meet_scheduled_at}
            onUpdate={(url, sat) => onMeetUpdate(project.id, url, sat)}
            compact
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {assigned.slice(0, 3).map((u) => (
            <span
              key={u}
              className="inline-flex items-center justify-center rounded-full text-[9px] font-bold uppercase"
              style={{ width: 20, height: 20, background: "rgba(99,102,241,0.25)", color: "#818cf8" }}
              title={u}
            >
              {u.slice(0, 2)}
            </span>
          ))}
          {assigned.length > 3 && (
            <span className="text-[9px] text-slate-600">+{assigned.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {project.target_date && (
            <span className="text-[10px] text-slate-600 whitespace-nowrap">{fmtDate(project.target_date)}</span>
          )}
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project); }}
              className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all text-[10px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty form factory ────────────────────────────────────────────────────────

function emptyForm() {
  return {
    name: "",
    description: "",
    client_id: "",
    status: "discovery" as ProjectStatus,
    stage: "discovery" as ProjectStage,
    priority: "medium" as ProjectPriority,
    progress: 0,
    start_date: "",
    target_date: "",
    assigned_to: [] as string[],
    account_manager: "",
    budget: "",
    currency: "INR",
    tags: "",
    project_number: "",
  };
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [clients, setClients]     = useState<Client[]>([]);
  const [users, setUsers]         = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<Project | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");

  // Whiteboard & Meet state
  const [whiteboardProject, setWhiteboardProject] = useState<Project | null>(null);

  const [form, setForm] = useState(emptyForm());

  const role = getRole();
  const isAdmin  = ["admin", "super_admin"].includes(role);
  const canWrite = ["admin", "super_admin", "manager"].includes(role);

  // ── Loaders ─────────────────────────────────────────────────────────────

  const loadProjects = useCallback(() => {
    const token = getToken();
    if (!token) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    fetch("/api/dashboard/projects", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret", "backdrop_role", "backdrop_username"].forEach((k) => sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setProjects((d as { projects: Project[] }).projects ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const loadClients = useCallback(() => {
    const token = getToken();
    if (!token) return;
    fetch("/api/dashboard/clients", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          // clients API returns camelCase clientId; map to snake_case for our use
          const raw = (d as { clients: Array<Record<string, string>> }).clients ?? [];
          setClients(raw.map((c) => ({
            id:       c.id,
            client_id: c.clientId ?? c.client_id ?? "",
            name:     c.name,
            company:  c.company,
            status:   c.status,
          })));
        }
      })
      .catch(console.error);
  }, []);

  const loadUsers = useCallback(() => {
    const token = getToken();
    if (!token) return;
    fetch("/api/dashboard/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          const raw = (d as { users?: Array<{ username: string }> }).users ?? [];
          setUsers(raw.map((u) => u.username));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadProjects();
    loadClients();
    loadUsers();
  }, [loadProjects, loadClients, loadUsers]);

  // ── Client name lookup ───────────────────────────────────────────────────

  function clientName(clientId: string) {
    const c = clients.find((x) => x.client_id === clientId);
    return c?.name ?? "";
  }

  // ── Kanban columns ───────────────────────────────────────────────────────

  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [p.name, p.client_id, clientName(p.client_id)].some((v) => v?.toLowerCase().includes(q));
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  function openNew() {
    setForm(emptyForm());
    setError("");
    setShowNew(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name:            p.name,
      description:     p.description ?? "",
      client_id:       p.client_id,
      status:          p.status,
      stage:           p.stage,
      priority:        p.priority,
      progress:        p.progress,
      start_date:      p.start_date ?? "",
      target_date:     p.target_date ?? "",
      assigned_to:     p.assigned_to ?? [],
      account_manager: p.account_manager ?? "",
      budget:          p.budget?.toString() ?? "",
      currency:        p.currency,
      tags:            (p.tags ?? []).join(", "),
      project_number:  p.project_number ?? "",
    });
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())      { setError("Project name is required"); return; }
    if (!form.client_id.trim()) { setError("Please select a client"); return; }
    setSaving(true); setError("");
    try {
      const body = buildPayload();
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to create project"); return; }
      setShowNew(false);
      setForm(emptyForm());
      loadProjects();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setError("");
    try {
      const body = { id: editing.id, ...buildPayload() };
      const res = await fetch("/api/dashboard/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to update project"); return; }
      setEditing(null);
      loadProjects();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(p: Project) {
    if (!confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
    await fetch(`/api/dashboard/projects?id=${p.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
  }

  async function handleStatusChange(projectId: string, newStatus: ProjectStatus) {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status: newStatus } : p));
    await fetch("/api/dashboard/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id: projectId, status: newStatus }),
    });
  }

  function handleMeetUpdate(projectId: string, url: string | null, scheduledAt?: string | null) {
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, meet_url: url, meet_scheduled_at: scheduledAt ?? p.meet_scheduled_at } : p
    ));
  }

  function buildPayload() {
    return {
      name:            form.name.trim(),
      description:     form.description.trim() || undefined,
      client_id:       form.client_id.trim(),
      status:          form.status,
      stage:           form.stage,
      priority:        form.priority,
      progress:        Number(form.progress) || 0,
      start_date:      form.start_date  || undefined,
      target_date:     form.target_date || undefined,
      assigned_to:     form.assigned_to.filter(Boolean),
      account_manager: form.account_manager.trim() || undefined,
      budget:          form.budget ? parseFloat(form.budget) : undefined,
      currency:        form.currency || "INR",
      tags:            form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      project_number:  form.project_number.trim() || undefined,
    };
  }

  function toggleAssignee(username: string) {
    setForm((prev) => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(username)
        ? prev.assigned_to.filter((u) => u !== username)
        : [...prev.assigned_to, username],
    }));
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const modal = showNew || !!editing;

  return (
    <DashboardShell>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 flex items-center justify-between px-6 py-4 border-b gap-3 flex-wrap"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1 className="text-white font-semibold">Projects</h1>
            <p className="text-slate-500 text-xs mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-52"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            {canWrite && (
              <button
                onClick={openNew}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Project
              </button>
            )}
          </div>
        </header>

        {/* Kanban board */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
        ) : (
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
            <div className="flex h-full gap-3 p-4 min-w-max">
              {COLUMNS.map((col) => {
                const cards = filtered.filter((p) => p.status === col.status);
                return (
                  <div
                    key={col.status}
                    className="flex flex-col rounded-2xl w-72 shrink-0"
                    style={{ background: col.bg, border: `1px solid ${col.color}22` }}
                  >
                    {/* Column header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-t-2xl border-b shrink-0"
                      style={{ borderColor: `${col.color}22` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                        <span className="text-sm font-semibold" style={{ color: col.color }}>{col.label}</span>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: col.color, background: `${col.color}18` }}
                      >
                        {cards.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-0">
                      {cards.map((p) => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          clientName={clientName(p.client_id)}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onWhiteboard={setWhiteboardProject}
                          onMeetUpdate={handleMeetUpdate}
                          canWrite={canWrite}
                          isAdmin={isAdmin}
                        />
                      ))}
                      {cards.length === 0 && (
                        <p className="text-slate-700 text-xs text-center py-8">No projects</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal — New / Edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <form
            onSubmit={editing ? handleUpdate : handleCreate}
            className="w-full max-w-2xl rounded-2xl p-6 space-y-4 overflow-y-auto"
            style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh" }}
          >
            {/* Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{editing ? "Edit Project" : "New Project"}</h2>
                {editing && <p className="text-xs text-slate-500 mt-0.5">ID: <span className="font-mono text-indigo-400">{editing.id.slice(0, 8)}…</span></p>}
              </div>
              <button type="button" onClick={() => { setShowNew(false); setEditing(null); }} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
            </div>

            {error && <p className="text-red-400 text-sm rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.08)" }}>{error}</p>}

            {/* Row 1: name + project_number */}
            <div className="grid grid-cols-3 gap-3">
              <F label="Project Name *" cls="col-span-2">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Website Redesign" className="fi" />
              </F>
              <F label="Project #">
                <input value={form.project_number} onChange={(e) => setForm({ ...form, project_number: e.target.value })} placeholder="PRJ-001" className="fi" />
              </F>
            </div>

            {/* Row 2: client */}
            <F label="Client * (select to link FK)">
              <select
                required
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="fi"
              >
                <option value="">— Select a client —</option>
                {clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.name}{c.company ? ` · ${c.company}` : ""} [{c.client_id}]
                  </option>
                ))}
              </select>
            </F>

            {/* Row 3: description */}
            <F label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="What is this project about?"
                className="fi resize-none"
              />
            </F>

            {/* Row 4: status + stage + priority */}
            <div className="grid grid-cols-3 gap-3">
              <F label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })} className="fi">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </F>
              <F label="Stage">
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as ProjectStage })} className="fi">
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </F>
              <F label="Priority">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ProjectPriority })} className="fi">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </F>
            </div>

            {/* Row 5: dates + progress */}
            <div className="grid grid-cols-3 gap-3">
              <F label="Start Date">
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="fi" />
              </F>
              <F label="Target Date">
                <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="fi" />
              </F>
              <F label={`Progress: ${form.progress}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 mt-2"
                />
              </F>
            </div>

            {/* Row 6: budget + currency + account_manager */}
            <div className="grid grid-cols-3 gap-3">
              <F label="Budget">
                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0" className="fi" />
              </F>
              <F label="Currency">
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="fi">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </F>
              <F label="Account Manager">
                <select value={form.account_manager} onChange={(e) => setForm({ ...form, account_manager: e.target.value })} className="fi">
                  <option value="">— None —</option>
                  {users.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </F>
            </div>

            {/* Row 7: assigned_to (multi-select pills) */}
            <F label="Assigned Team Members">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {users.map((u) => {
                  const sel = form.assigned_to.includes(u);
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => toggleAssignee(u)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={sel
                        ? { background: "rgba(99,102,241,0.25)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.4)" }
                        : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }
                      }
                    >
                      {u}
                    </button>
                  );
                })}
                {users.length === 0 && <span className="text-slate-600 text-xs">No team members found</span>}
              </div>
            </F>

            {/* Row 8: tags */}
            <F label="Tags (comma-separated)">
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="web, design, branding" className="fi" />
            </F>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                {saving ? (editing ? "Saving…" : "Creating…") : (editing ? "Save Changes" : "Create Project")}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    const newStatus = prompt(
                      "Move to status:",
                      editing.status
                    ) as ProjectStatus | null;
                    if (newStatus && STATUS_OPTIONS.includes(newStatus)) {
                      handleStatusChange(editing.id, newStatus).then(() => setEditing(null));
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  Move Status
                </button>
              )}
              <button
                type="button"
                onClick={() => { setShowNew(false); setEditing(null); }}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Whiteboard Modal */}
      {whiteboardProject && (
        <WhiteboardModal
          entityType="project"
          entityId={whiteboardProject.id}
          entityLabel={whiteboardProject.name}
          onClose={() => setWhiteboardProject(null)}
        />
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
    </DashboardShell>
  );
}

function F({ label, children, cls }: { label: string; children: React.ReactNode; cls?: string }) {
  return (
    <div className={cls}>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
