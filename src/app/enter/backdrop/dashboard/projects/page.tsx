"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Project, ProjectStatus, Client } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  planning:  { label: "Planning",  color: "#94a3b8", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)" },
  active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)"  },
  on_hold:   { label: "On Hold",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)"  },
  completed: { label: "Completed", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)"  },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
};

const KANBAN_COLS: ProjectStatus[] = ["planning", "active", "on_hold", "completed", "cancelled"];
type ViewMode = "list" | "kanban" | "gantt";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>
      {m.label}
    </span>
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", clientId: "", clientEmail: "", clientName: "",
    status: "planning" as ProjectStatus, startDate: "", endDate: "", color: "#6366f1",
    budget: "", currency: "USD",
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard/projects", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      const d = await res.json();
      setProjects(d.projects ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/dashboard/clients", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() as Promise<{ clients: Client[] }> : Promise.reject())
      .then(d => setClients(d.clients ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name:"", description:"", clientId:"", clientEmail:"", clientName:"", status:"planning", startDate:"", endDate:"", color:"#6366f1", budget:"", currency:"USD" });
    setClientSearch("");
    setShowForm(true);
    setError("");
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? "", clientId: p.clientId, clientEmail: p.clientEmail ?? "",
      clientName: p.clientName ?? "", status: p.status, startDate: p.startDate ?? "", endDate: p.endDate ?? "",
      color: p.color ?? "#6366f1", budget: p.budget ? String(p.budget / 100) : "", currency: p.currency ?? "USD",
    });
    setClientSearch(p.clientName || p.clientId);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Project name is required."); return; }
    if (!form.clientId.trim()) { setError("Client ID is required."); return; }
    setSaving(true); setError("");
    try {
      const method = editing ? "PATCH" : "POST";
      const body: Partial<Project> & { id?: string } = {
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(), description: form.description || undefined,
        clientId: form.clientId.trim(), clientEmail: form.clientEmail.trim() || undefined,
        clientName: form.clientName.trim() || undefined,
        status: form.status, startDate: form.startDate || undefined, endDate: form.endDate || undefined,
        color: form.color,
        budget: form.budget ? Math.round(parseFloat(form.budget) * 100) : undefined,
        currency: form.currency,
      };
      const res = await fetch("/api/dashboard/projects", {
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setShowForm(false);
      await load();
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/dashboard/projects?id=${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    await load();
  }

  // ─── Gantt ────────────────────────────────────────────────────────────────
  const withDates = projects.filter((p) => p.startDate && p.endDate);
  const ganttProjects = withDates.length > 0 ? withDates : projects.filter((p) => p.startDate);
  const ganttStart = ganttProjects.length > 0
    ? new Date(Math.min(...ganttProjects.map((p) => new Date(p.startDate!).getTime())))
    : new Date();
  const ganttEnd = ganttProjects.length > 0 && withDates.length > 0
    ? new Date(Math.max(...withDates.map((p) => new Date(p.endDate!).getTime())))
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const totalDays = Math.max((ganttEnd.getTime() - ganttStart.getTime()) / (1000 * 60 * 60 * 24), 30);

  function barStyle(p: Project) {
    if (!p.startDate) return null;
    const left = (new Date(p.startDate).getTime() - ganttStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration = p.endDate
      ? (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)
      : 14;
    return {
      left: `${(left / totalDays) * 100}%`,
      width: `${Math.max((duration / totalDays) * 100, 2)}%`,
    };
  }

  return (
    <DashboardShell>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
            <p className="text-sm text-slate-500">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
              {(["list","kanban","gantt"] as ViewMode[]).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-all"
                  style={{ background: view === v ? "rgba(99,102,241,0.2)" : "transparent", color: view === v ? "#a5b4fc" : "#64748b" }}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              + New Project
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-lg font-bold text-white mb-5">{editing ? "Edit Project" : "New Project"}</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 mb-1 block">Project Name *</label>
                    <input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="e.g. Website Redesign"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="col-span-2" ref={clientDropdownRef}>
                    <label className="text-xs text-slate-400 mb-1 block">Client *</label>
                    <div className="relative">
                      <input
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setShowClientDropdown(true);
                          if (!e.target.value) setForm({...form, clientId:"", clientEmail:"", clientName:""});
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        placeholder="Search by name, email or ID…"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                      />
                      {form.clientId && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                          {form.clientId}
                        </span>
                      )}
                      {showClientDropdown && (
                        <div className="absolute z-50 top-full mt-1 w-full rounded-xl overflow-hidden shadow-xl" style={{ background:"#0f1729", border:"1px solid rgba(255,255,255,0.1)", maxHeight:200, overflowY:"auto" }}>
                          {clients
                            .filter(c => {
                              const q = clientSearch.toLowerCase();
                              return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.clientId?.toLowerCase().includes(q);
                            })
                            .slice(0, 10)
                            .map(c => (
                              <button key={c.id} type="button"
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                onClick={() => {
                                  setForm({...form, clientId: c.clientId, clientEmail: c.email, clientName: c.name});
                                  setClientSearch(c.name);
                                  setShowClientDropdown(false);
                                }}>
                                <div className="text-white font-medium">{c.name}</div>
                                <div className="text-slate-500 text-xs">{c.email} · {c.clientId}</div>
                              </button>
                            ))
                          }
                          {clients.filter(c => {
                            const q = clientSearch.toLowerCase();
                            return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.clientId?.toLowerCase().includes(q);
                          }).length === 0 && (
                            <div className="px-3 py-2.5 text-xs text-slate-500">No matching clients</div>
                          )}
                        </div>
                      )}
                    </div>
                    {form.clientEmail && <p className="text-xs text-slate-500 mt-1">{form.clientEmail}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => setForm({...form,status:e.target.value as ProjectStatus})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" style={{background:"#0f1729"}}>
                      {KANBAN_COLS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({...form,startDate:e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" style={{colorScheme:"dark"}} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({...form,endDate:e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" style={{colorScheme:"dark"}} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.color} onChange={(e) => setForm({...form,color:e.target.value})}
                        className="w-10 h-8 rounded cursor-pointer border border-white/10" style={{background:"transparent"}} />
                      <input value={form.color} onChange={(e) => setForm({...form,color:e.target.value})}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 mb-1 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none" />
                  </div>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/10">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: saving ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm gap-2">
            <p>No projects yet.</p>
            <button onClick={openCreate} className="text-indigo-400 underline text-xs">Create your first project</button>
          </div>
        ) : view === "list" ? (
          /* ─── List View ─────────────────────────────────────────────── */
          <div className="rounded-2xl overflow-hidden border border-white/7">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/7" style={{ background: "rgba(255,255,255,0.025)" }}>
                  {["Project", "Client", "Status", "Start", "End", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < projects.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => router.push(`/enter/backdrop/dashboard/projects/${p.id}`)}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color ?? "#6366f1" }} />
                        <span className="text-white font-medium hover:text-indigo-300 transition-colors">{p.name}</span>
                      </div>
                      {p.description && <p className="text-xs text-slate-500 mt-0.5 ml-4.5">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      <div>{p.clientName || p.clientId}</div>
                      {p.clientEmail && <div className="text-slate-600">{p.clientEmail}</div>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.startDate)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.endDate)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(p)} className="text-xs text-slate-500 hover:text-indigo-400 mr-3 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === "kanban" ? (
          /* ─── Kanban View ────────────────────────────────────────────── */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLS.map((col) => {
              const colProjects = projects.filter((p) => p.status === col);
              const m = STATUS_META[col];
              return (
                <div key={col} className="flex-shrink-0 w-64">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                    <span className="ml-auto text-xs text-slate-600">{colProjects.length}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {colProjects.map((p) => (
                      <div key={p.id} className="rounded-2xl p-4 cursor-pointer transition-all hover:border-white/15"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        onClick={() => router.push(`/enter/backdrop/dashboard/projects/${p.id}`)}>
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: p.color ?? "#6366f1" }} />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white leading-snug">{p.name}</div>
                            {p.clientName && <div className="text-xs text-slate-500 mt-0.5">{p.clientName}</div>}
                          </div>
                        </div>
                        {p.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>}
                        {(p.startDate || p.endDate) && (
                          <div className="text-xs text-slate-600 mt-2">
                            {formatDate(p.startDate)} — {formatDate(p.endDate)}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEdit(p)} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Gantt View ─────────────────────────────────────────────── */
          <div className="rounded-2xl overflow-hidden border border-white/7" style={{ background: "rgba(255,255,255,0.02)" }}>
            {ganttProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Add start dates to projects to see the Gantt chart.</div>
            ) : (
              <>
                {/* Timeline header */}
                <div className="flex border-b border-white/7" style={{ background: "rgba(255,255,255,0.025)" }}>
                  <div className="w-48 flex-shrink-0 px-4 py-2 text-xs font-semibold text-slate-500 border-r border-white/7">Project</div>
                  <div className="flex-1 relative h-8">
                    {Array.from({ length: Math.ceil(totalDays / 30) }).map((_, i) => {
                      const d = new Date(ganttStart.getTime() + i * 30 * 24 * 60 * 60 * 1000);
                      return (
                        <div key={i} className="absolute top-0 h-full flex items-center text-xs text-slate-600 pl-1"
                          style={{ left: `${(i * 30 / totalDays) * 100}%` }}>
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Rows */}
                {ganttProjects.map((p) => {
                  const bar = barStyle(p);
                  return (
                    <div key={p.id} className="flex items-center border-b border-white/4 hover:bg-white/1" style={{ minHeight: 44 }}>
                      <div className="w-48 flex-shrink-0 px-4 py-2 border-r border-white/7">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.color ?? "#6366f1" }} />
                          <span className="text-xs font-medium text-white truncate">{p.name}</span>
                        </div>
                        {p.clientName && <p className="text-xs text-slate-600 ml-4 truncate">{p.clientName}</p>}
                      </div>
                      <div className="flex-1 relative h-8">
                        {bar && (
                          <div className="absolute top-1 h-6 rounded-full flex items-center px-2 text-xs text-white font-medium truncate"
                            style={{ left: bar.left, width: bar.width, background: p.color ?? "#6366f1", opacity: 0.85 }}>
                            {p.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
