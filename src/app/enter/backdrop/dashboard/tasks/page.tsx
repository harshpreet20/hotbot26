"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  CRMTask, TaskPriority, TaskStatus, LinkedEntityType,
  Lead, Ticket, Client, Invoice, CallbackRequest, NewsletterSubscriber,
} from "@/types/dashboard";

// ── helpers ───────────────────────────────────────────────────────────────────

function getSecret()   { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret")   || "" : ""; }
function getUsername() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_username") || "" : ""; }
function authH()       { return { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" }; }

// ── entity metadata ───────────────────────────────────────────────────────────

const ENTITY_META: Record<LinkedEntityType, { label: string; icon: string; color: string; href: (id: string) => string }> = {
  lead:       { label: "Lead",        icon: "🎯", color: "#818cf8", href: (id) => `/enter/backdrop/dashboard/leads/${id}` },
  invoice:    { label: "Invoice",     icon: "🧾", color: "#34d399", href: (id) => `/enter/backdrop/dashboard/invoices/${id}` },
  ticket:     { label: "Ticket",      icon: "🎫", color: "#f59e0b", href: ()   => `/enter/backdrop/dashboard/tickets` },
  client:     { label: "Client",      icon: "🏢", color: "#60a5fa", href: ()   => `/enter/backdrop/dashboard/clients` },
  blog:       { label: "Blog Post",   icon: "📝", color: "#a78bfa", href: ()   => `/enter/backdrop/dashboard/blog` },
  callback:   { label: "Callback",    icon: "📞", color: "#fb923c", href: ()   => `/enter/backdrop/dashboard/callbacks` },
  newsletter: { label: "Newsletter",  icon: "📬", color: "#e879f9", href: ()   => `/enter/backdrop/dashboard/newsletter` },
};

const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#64748b" },
  medium: { label: "Medium", color: "#3b82f6" },
  high:   { label: "High",   color: "#f59e0b" },
  urgent: { label: "Urgent", color: "#ef4444" },
};

const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  done:        { label: "Done",        color: "#22c55e" },
  cancelled:   { label: "Cancelled",   color: "#475569" },
};

// ── entity search result shape ────────────────────────────────────────────────

interface EntityOption { id: string; label: string; sub?: string }

function entityIdField(type: LinkedEntityType): keyof CRMTask {
  const map: Record<LinkedEntityType, keyof CRMTask> = {
    lead: "leadId", invoice: "invoiceId", ticket: "ticketId",
    client: "clientId", blog: "blogId", callback: "callbackId", newsletter: "newsletterId",
  };
  return map[type];
}

// ── profile panel content ─────────────────────────────────────────────────────

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-xs">
      <span className="text-slate-600 shrink-0 w-24">{label}</span>
      <span className="text-slate-300 break-all">{value}</span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function TasksPage() {
  const router = useRouter();

  const [tasks,   setTasks]   = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<TaskStatus | "">("");
  const [showNew, setShowNew] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Team members for assignee dropdowns + internal issue modal
  const [team, setTeam] = useState<{ username: string; role: string }[]>([]);
  const [showIssue, setShowIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: "", description: "", priority: "medium" as "low"|"medium"|"high"|"critical", raisedAgainst: "", assignedTo: "" });
  const [issueSaving, setIssueSaving] = useState(false);

  // entity context cache keyed by taskId
  const [ctxCache, setCtxCache] = useState<Record<string, Record<string, unknown> | null>>({});

  // New-task form state
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium" as TaskPriority,
    dueDate: "", assignedTo: "",
    linkType: "" as LinkedEntityType | "",
    linkId: "", linkLabel: "",
  });

  // entity search state (for link picker)
  const [entityOpts,    setEntityOpts]    = useState<EntityOption[]>([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entitySearch,  setEntitySearch]  = useState("");

  // ── load tasks ──────────────────────────────────────────────────────────────

  const taskIdsRef = useRef<Set<string>>(new Set());

  // Request browser notification permission on first load
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  const loadTasks = useCallback((silent = false) => {
    const secret = getSecret();
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
    if (!silent) setLoading(true);
    fetch("/api/dashboard/tasks", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) { ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k)); router.replace("/enter/backdrop"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const incoming = (d as { tasks: CRMTask[] }).tasks;
        // Fire browser notification for any new tasks added since last poll
        if (silent && taskIdsRef.current.size > 0) {
          for (const t of incoming) {
            if (!taskIdsRef.current.has(t.id)) {
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("New task assigned", {
                  body: t.title,
                  icon: "/logos/brand-logo.png",
                });
              }
            }
          }
        }
        taskIdsRef.current = new Set(incoming.map((t) => t.id));
        setTasks(incoming);
      })
      .catch(console.error)
      .finally(() => { if (!silent) setLoading(false); });
  }, [router]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Silent background poll every 30 s with browser notification on new tasks
  useEffect(() => {
    const id = setInterval(() => loadTasks(true), 30_000);
    return () => clearInterval(id);
  }, [loadTasks]);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) return;
    fetch("/api/dashboard/team", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => r.json())
      .then((d) => setTeam((d as { members?: { username: string; role: string }[] }).members ?? []))
      .catch(() => {});
  }, []);

  // ── load entity options for link picker ─────────────────────────────────────

  const loadEntityOptions = useCallback(async (type: LinkedEntityType, q: string) => {
    setEntityLoading(true);
    const h = { Authorization: `Bearer ${getSecret()}` };
    try {
      let opts: EntityOption[] = [];
      switch (type) {
        case "lead": {
          const d = await fetch("/api/dashboard/leads",          { headers: h }).then((r) => r.json()) as { leads?: Lead[] };
          opts = (d.leads ?? []).map((l) => ({ id: l.id, label: l.name, sub: l.email || l.service || undefined }));
          break;
        }
        case "invoice": {
          const d = await fetch("/api/dashboard/invoices",        { headers: h }).then((r) => r.json()) as { invoices?: Invoice[] };
          opts = (d.invoices ?? []).map((i) => ({ id: i.id, label: `${i.invoiceNumber} — ${i.clientName}`, sub: `$${i.total} · ${i.status}` }));
          break;
        }
        case "ticket": {
          const d = await fetch("/api/dashboard/tickets",         { headers: h }).then((r) => r.json()) as { tickets?: Ticket[] };
          opts = (d.tickets ?? []).map((t) => ({ id: t.id, label: `${t.ticketNumber}: ${t.title}`, sub: `${t.status} · ${t.requesterName}` }));
          break;
        }
        case "client": {
          const d = await fetch("/api/dashboard/clients",         { headers: h }).then((r) => r.json()) as { clients?: Client[] };
          opts = (d.clients ?? []).map((c) => ({ id: c.id, label: c.name, sub: `${c.clientId} · ${c.status}` }));
          break;
        }
        case "blog": {
          const d = await fetch("/api/dashboard/posts",           { headers: h }).then((r) => r.json()) as { posts?: Array<{ id: string; title: string; status?: string }> };
          opts = (d.posts ?? []).map((p) => ({ id: p.id, label: p.title, sub: p.status }));
          break;
        }
        case "callback": {
          const d = await fetch("/api/dashboard/callbacks",       { headers: h }).then((r) => r.json()) as { callbacks?: CallbackRequest[] };
          opts = (d.callbacks ?? []).map((c) => ({ id: c.id, label: c.name, sub: c.phone }));
          break;
        }
        case "newsletter": {
          const d = await fetch("/api/dashboard/newsletter",      { headers: h }).then((r) => r.json()) as { subscribers?: NewsletterSubscriber[] };
          opts = (d.subscribers ?? []).map((s) => ({ id: s.id, label: s.email, sub: s.name || s.source }));
          break;
        }
      }
      if (q) {
        const ql = q.toLowerCase();
        opts = opts.filter((o) => o.label.toLowerCase().includes(ql) || o.sub?.toLowerCase().includes(ql));
      }
      setEntityOpts(opts.slice(0, 30));
    } catch {
      setEntityOpts([]);
    } finally {
      setEntityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!form.linkType) { setEntityOpts([]); return; }
    loadEntityOptions(form.linkType, entitySearch);
  }, [form.linkType, entitySearch, loadEntityOptions]);

  // ── load entity context for expanded task ───────────────────────────────────

  async function loadContext(task: CRMTask) {
    if (ctxCache[task.id] !== undefined) return;
    const h = { Authorization: `Bearer ${getSecret()}` };
    let ctx: Record<string, unknown> | null = null;
    try {
      if (task.leadId) {
        const d = await fetch(`/api/dashboard/leads?id=${task.leadId}`, { headers: h }).then((r) => r.json()) as { lead?: Record<string, unknown> };
        ctx = d.lead ?? null;
      } else if (task.invoiceId) {
        const d = await fetch(`/api/dashboard/invoices?id=${task.invoiceId}`, { headers: h }).then((r) => r.json()) as { invoice?: Record<string, unknown> };
        ctx = d.invoice ?? null;
      } else if (task.ticketId) {
        const d = await fetch(`/api/dashboard/tickets?id=${task.ticketId}`, { headers: h }).then((r) => r.ok ? r.json() : {}) as { ticket?: Record<string, unknown> };
        ctx = d.ticket ?? null;
      } else if (task.clientId) {
        const allClients = await fetch("/api/dashboard/clients", { headers: h }).then((r) => r.json()) as { clients?: Client[] };
        ctx = (allClients.clients ?? []).find((c) => c.id === task.clientId) as unknown as Record<string, unknown> ?? null;
      } else if (task.blogId) {
        const d = await fetch(`/api/dashboard/posts?id=${task.blogId}`, { headers: h }).then((r) => r.json()) as { post?: Record<string, unknown> };
        ctx = d.post ?? null;
      } else if (task.callbackId) {
        const all = await fetch("/api/dashboard/callbacks", { headers: h }).then((r) => r.json()) as { callbacks?: CallbackRequest[] };
        ctx = (all.callbacks ?? []).find((c) => c.id === task.callbackId) as unknown as Record<string, unknown> ?? null;
      } else if (task.newsletterId) {
        const all = await fetch("/api/dashboard/newsletter", { headers: h }).then((r) => r.json()) as { subscribers?: NewsletterSubscriber[] };
        ctx = (all.subscribers ?? []).find((s) => s.id === task.newsletterId) as unknown as Record<string, unknown> ?? null;
      }
    } catch { /* context is optional */ }
    setCtxCache((prev) => ({ ...prev, [task.id]: ctx }));
  }

  function toggleExpand(task: CRMTask) {
    if (expanded === task.id) { setExpanded(null); return; }
    setExpanded(task.id);
    loadContext(task);
  }

  // ── create task ─────────────────────────────────────────────────────────────

  async function createTask() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: Partial<CRMTask> = {
        title: form.title.trim(),
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo.trim() || undefined,
        linkedEntityType: form.linkType || undefined,
        linkedEntityLabel: form.linkLabel || undefined,
        ...(form.linkType && form.linkId ? { [entityIdField(form.linkType)]: form.linkId } : {}),
      };
      const res = await fetch("/api/dashboard/tasks", { method: "POST", headers: authH(), body: JSON.stringify(payload) });
      if (res.ok) {
        const data = await res.json() as { task: CRMTask };
        setTasks((p) => [data.task, ...p]);
        setForm({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "", linkType: "", linkId: "", linkLabel: "" });
        setEntitySearch(""); setEntityOpts([]);
        setShowNew(false);
      }
    } finally { setSaving(false); }
  }

  // ── update status ────────────────────────────────────────────────────────────

  async function updateStatus(id: string, status: TaskStatus) {
    const res = await fetch("/api/dashboard/tasks", { method: "PATCH", headers: authH(), body: JSON.stringify({ id, status }) });
    if (res.ok) {
      const data = await res.json() as { task: CRMTask };
      setTasks((p) => p.map((t) => t.id === id ? data.task : t));
    }
  }

  // ── raise internal issue ────────────────────────────────────────────────────

  async function createInternalIssue() {
    if (!issueForm.title.trim()) return;
    setIssueSaving(true);
    try {
      await fetch("/api/dashboard/tickets", {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          title:         issueForm.title.trim(),
          description:   issueForm.description,
          priority:      issueForm.priority,
          category:      "general",
          status:        "open",
          requesterName: getUsername(),
          requesterEmail: "",
          isInternal:    true,
          raisedAgainst: issueForm.raisedAgainst || undefined,
          raisedBy:      getUsername(),
          assignedTo:    issueForm.assignedTo || undefined,
        }),
      });
      setShowIssue(false);
      setIssueForm({ title: "", description: "", priority: "medium", raisedAgainst: "", assignedTo: "" });
    } finally { setIssueSaving(false); }
  }

  // ── delete task ─────────────────────────────────────────────────────────────

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/dashboard/tasks?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getSecret()}` } });
    if (res.ok) setTasks((p) => p.filter((t) => t.id !== id));
  }

  // ── filtered list ────────────────────────────────────────────────────────────

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [t.title, t.description ?? "", t.assignedTo ?? "", t.linkedEntityLabel ?? ""].some((v) => v.toLowerCase().includes(q));
    const matchFilter = !filter || t.status === filter;
    return matchSearch && matchFilter;
  });

  const openCount    = tasks.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const doneCount    = tasks.filter((t) => t.status === "done").length;
  const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !["done","cancelled"].includes(t.status)).length;

  return (
    <>
      <div className="flex flex-col min-h-full">

        {/* ── header ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-wrap gap-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Tasks</h1>
            <p className="text-slate-500 text-xs mt-0.5">{tasks.length} total · {openCount} open{overdueCount > 0 && <span style={{ color: "#ef4444" }}> · {overdueCount} overdue</span>}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-44"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select value={filter} onChange={(e) => setFilter(e.target.value as TaskStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={() => setShowIssue(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Raise Issue
            </button>
            <button onClick={() => setShowNew(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Task
            </button>
          </div>
        </header>

        {/* ── summary cards ── */}
        {!loading && (
          <div className="grid grid-cols-4 gap-3 px-6 pt-5">
            {([["Open", tasks.filter((t)=>t.status==="open").length,"#3b82f6"],["In Progress",tasks.filter((t)=>t.status==="in_progress").length,"#f59e0b"],["Done",doneCount,"#22c55e"],["Overdue",overdueCount,"#ef4444"]] as const).map(([l,v,c])=>(
              <div key={l} className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs text-slate-500 mb-1">{l}</p>
                <p className="text-xl font-bold tabular-nums" style={{ color: c }}>{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── new task modal ── */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
            <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[90vh]" style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">New Task</h2>
                <button onClick={() => setShowNew(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>

              <F label="Title *">
                <input autoFocus value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="What needs to be done?" className="fi" />
              </F>
              <F label="Description">
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} placeholder="Optional context or instructions…" className="fi resize-none" />
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Priority">
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value as TaskPriority})} className="fi">
                    {Object.entries(PRIORITY_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </F>
                <F label="Due Date">
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="fi" />
                </F>
              </div>
              <F label="Assign To">
                <select value={form.assignedTo} onChange={(e) => setForm({...form, assignedTo: e.target.value})} className="fi">
                  <option value="">— Self ({getUsername()}) —</option>
                  {team.map((m) => <option key={m.username} value={m.username}>{m.username} ({m.role})</option>)}
                </select>
              </F>

              {/* ── Link to entity ── */}
              <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Link to an entity (optional)</p>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {(["","lead","invoice","ticket","client","blog","callback","newsletter"] as const).map((t) => {
                    const meta = t ? ENTITY_META[t] : null;
                    const active = form.linkType === t;
                    return (
                      <button key={t ?? "none"} type="button"
                        onClick={() => { setForm({...form, linkType: t, linkId: "", linkLabel: ""}); setEntitySearch(""); }}
                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-center"
                        style={{
                          background: active ? (meta ? `${meta.color}20` : "rgba(99,102,241,0.15)") : "rgba(255,255,255,0.04)",
                          border: `1px solid ${active ? (meta?.color ?? "rgba(99,102,241,0.5)") + "60" : "rgba(255,255,255,0.08)"}`,
                          color: active ? (meta?.color ?? "#818cf8") : "#64748b",
                        }}>
                        {meta ? `${meta.icon} ${meta.label}` : "None"}
                      </button>
                    );
                  })}
                </div>

                {form.linkType && (
                  <div className="space-y-2">
                    {form.linkId ? (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: `${ENTITY_META[form.linkType].color}12`, border: `1px solid ${ENTITY_META[form.linkType].color}30` }}>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{ENTITY_META[form.linkType].icon}</span>
                          <span style={{ color: ENTITY_META[form.linkType].color }}>{form.linkLabel}</span>
                        </div>
                        <button type="button" onClick={() => setForm({...form, linkId:"", linkLabel:""})} className="text-slate-600 hover:text-white text-xs">✕</button>
                      </div>
                    ) : (
                      <>
                        <input
                          value={entitySearch}
                          onChange={(e) => setEntitySearch(e.target.value)}
                          placeholder={`Search ${ENTITY_META[form.linkType].label.toLowerCase()}s…`}
                          className="fi text-sm"
                        />
                        {entityLoading ? (
                          <p className="text-slate-600 text-xs px-1">Loading…</p>
                        ) : entityOpts.length === 0 ? (
                          <p className="text-slate-600 text-xs px-1">No results.</p>
                        ) : (
                          <div className="rounded-xl overflow-hidden max-h-44 overflow-y-auto" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                            {entityOpts.map((opt) => (
                              <button key={opt.id} type="button"
                                onClick={() => setForm({...form, linkId: opt.id, linkLabel: opt.label})}
                                className="w-full px-3 py-2 text-left hover:bg-white/[0.04] transition-colors border-b last:border-b-0"
                                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                <p className="text-sm text-white truncate">{opt.label}</p>
                                {opt.sub && <p className="text-xs text-slate-600 truncate">{opt.sub}</p>}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button onClick={createTask} disabled={saving || !form.title.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  {saving ? "Creating…" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── task list ── */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search || filter ? "No matching tasks." : "No tasks yet. Click \"New Task\" to create the first one."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => {
                const pm = PRIORITY_META[task.priority];
                const sm = STATUS_META[task.status];
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !["done","cancelled"].includes(task.status);
                const hasLink = !!task.linkedEntityType;
                const meta = hasLink ? ENTITY_META[task.linkedEntityType!] : null;
                const isOpen = expanded === task.id;
                const ctx = ctxCache[task.id];

                return (
                  <div key={task.id} className="rounded-2xl overflow-hidden transition-all"
                    style={{ border: `1px solid ${isOpen ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}` }}>

                    {/* ── task row ── */}
                    <div className="p-4 flex items-start gap-3 hover:bg-white/[0.01] transition-colors">
                      {/* checkbox */}
                      <input type="checkbox"
                        checked={task.status === "done"}
                        onChange={(e) => updateStatus(task.id, e.target.checked ? "done" : "open")}
                        className="mt-0.5 w-4 h-4 rounded accent-indigo-500 shrink-0"
                      />

                      {/* main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-medium ${task.status==="done" ? "line-through text-slate-600" : "text-white"}`}>{task.title}</p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background:`${pm.color}18`, color:pm.color }}>{pm.label}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background:`${sm.color}18`, color:sm.color }}>{sm.label}</span>
                        </div>
                        {task.description && <p className="text-slate-500 text-xs mt-1 line-clamp-1">{task.description}</p>}

                        {/* meta row */}
                        <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-slate-600">
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              {task.assignedTo}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1" style={{ color: isOverdue ? "#ef4444" : undefined }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              {new Date(task.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                              {isOverdue && " · Overdue"}
                            </span>
                          )}
                          <span className="text-slate-700">by {task.createdBy}</span>

                          {/* entity link badge */}
                          {hasLink && meta && (
                            <button onClick={() => toggleExpand(task)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors hover:opacity-80"
                              style={{ background:`${meta.color}15`, color:meta.color, border:`1px solid ${meta.color}30` }}>
                              {meta.icon} {meta.label}: {task.linkedEntityLabel || "View"}
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* status + delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                          className="px-2 py-1 rounded-lg text-xs outline-none"
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:sm.color }}>
                          {Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-700 hover:text-red-400 text-xs transition-colors">✕</button>
                      </div>
                    </div>

                    {/* ── context profile panel ── */}
                    {isOpen && hasLink && meta && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background:`${meta.color}06` }}>
                        <div className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{meta.icon}</span>
                              <p className="text-xs font-semibold text-white uppercase tracking-wider">{meta.label} Profile</p>
                              <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background:`${meta.color}15`, color:meta.color }}>{task.linkedEntityLabel}</span>
                            </div>
                            <Link href={meta.href(task[entityIdField(task.linkedEntityType!)] as string ?? "")}
                              className="text-xs transition-colors hover:opacity-80"
                              style={{ color: meta.color }}>
                              Open full record →
                            </Link>
                          </div>

                          {ctx === undefined ? (
                            <p className="text-slate-600 text-xs">Loading context…</p>
                          ) : ctx === null ? (
                            <p className="text-slate-600 text-xs">Entity details not available.</p>
                          ) : (
                            <div className="rounded-xl p-4 space-y-2" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                              {task.linkedEntityType === "lead" && (
                                <>
                                  <ProfileRow label="Name"    value={ctx.name as string} />
                                  <ProfileRow label="Email"   value={ctx.email as string} />
                                  <ProfileRow label="Phone"   value={ctx.phone as string} />
                                  <ProfileRow label="Service" value={ctx.service as string} />
                                  <ProfileRow label="Status"  value={ctx.status as string} />
                                  <ProfileRow label="Source"  value={ctx.source as string} />
                                  {ctx.notes && <ProfileRow label="Notes" value={ctx.notes as string} />}
                                </>
                              )}
                              {task.linkedEntityType === "ticket" && (
                                <>
                                  <ProfileRow label="Ticket #"  value={ctx.ticketNumber as string} />
                                  <ProfileRow label="Title"     value={ctx.title as string} />
                                  <ProfileRow label="Status"    value={ctx.status as string} />
                                  <ProfileRow label="Priority"  value={ctx.priority as string} />
                                  <ProfileRow label="Requester" value={ctx.requesterName as string} />
                                  <ProfileRow label="Email"     value={ctx.requesterEmail as string} />
                                  <ProfileRow label="Category"  value={ctx.category as string} />
                                </>
                              )}
                              {task.linkedEntityType === "client" && (
                                <>
                                  <ProfileRow label="Client ID" value={ctx.clientId as string} />
                                  <ProfileRow label="Name"      value={ctx.name as string} />
                                  <ProfileRow label="Company"   value={ctx.company as string} />
                                  <ProfileRow label="Email"     value={ctx.email as string} />
                                  <ProfileRow label="Phone"     value={ctx.phone as string} />
                                  <ProfileRow label="Status"    value={ctx.status as string} />
                                  {ctx.notes && <ProfileRow label="Notes" value={ctx.notes as string} />}
                                </>
                              )}
                              {task.linkedEntityType === "invoice" && (
                                <>
                                  <ProfileRow label="Invoice #" value={ctx.invoiceNumber as string} />
                                  <ProfileRow label="Client"    value={ctx.clientName as string} />
                                  <ProfileRow label="Amount"    value={ctx.total !== undefined ? `${ctx.currency ?? "$"}${ctx.total}` : undefined} />
                                  <ProfileRow label="Status"    value={ctx.status as string} />
                                  <ProfileRow label="Due"       value={ctx.dueDate as string} />
                                </>
                              )}
                              {task.linkedEntityType === "blog" && (
                                <>
                                  <ProfileRow label="Title"    value={ctx.title as string} />
                                  <ProfileRow label="Status"   value={ctx.status as string} />
                                  <ProfileRow label="Author"   value={ctx.author as string} />
                                  <ProfileRow label="Category" value={ctx.category as string} />
                                </>
                              )}
                              {task.linkedEntityType === "callback" && (
                                <>
                                  <ProfileRow label="Name"   value={ctx.name as string} />
                                  <ProfileRow label="Phone"  value={ctx.phone as string} />
                                  <ProfileRow label="Status" value={ctx.status as string} />
                                  <ProfileRow label="Source" value={ctx.source as string} />
                                </>
                              )}
                              {task.linkedEntityType === "newsletter" && (
                                <>
                                  <ProfileRow label="Email"    value={ctx.email as string} />
                                  <ProfileRow label="Name"     value={ctx.name as string} />
                                  <ProfileRow label="Source"   value={ctx.source as string} />
                                  <ProfileRow label="WhatsApp" value={ctx.whatsapp as string} />
                                </>
                              )}

                              {/* Task description as the brief for the team */}
                              {task.description && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
                                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Task Brief</p>
                                  <p className="text-slate-300 text-xs leading-relaxed">{task.description}</p>
                                </div>
                              )}

                              {/* Accountability footer */}
                              <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor:"rgba(255,255,255,0.07)" }}>
                                <div className="flex items-center gap-4 text-[10px] text-slate-600">
                                  <span>Created by <span className="text-slate-400">{task.createdBy}</span></span>
                                  {task.assignedTo && <span>Assigned to <span className="text-indigo-400 font-medium">{task.assignedTo}</span></span>}
                                  {task.dueDate && <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== "done" ? "#ef4444" : undefined }}>
                                    Due {new Date(task.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                                  </span>}
                                </div>
                                <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-semibold outline-none"
                                  style={{ background:`${sm.color}15`, border:`1px solid ${sm.color}30`, color:sm.color }}>
                                  {Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Internal Issue Modal ── */}
      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#0f1626", border: "1px solid rgba(239,68,68,0.25)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Raise Internal Issue</h2>
                <p className="text-slate-500 text-xs mt-0.5">Flag a problem or concern with a teammate</p>
              </div>
              <button onClick={() => setShowIssue(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Issue Title *</label>
              <input autoFocus value={issueForm.title} onChange={(e) => setIssueForm({...issueForm, title: e.target.value})}
                placeholder="Brief summary of the issue" className="fi" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea value={issueForm.description} onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                rows={3} placeholder="What happened? What's the impact?" className="fi resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Priority</label>
                <select value={issueForm.priority} onChange={(e) => setIssueForm({...issueForm, priority: e.target.value as typeof issueForm.priority})} className="fi">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Raised Against</label>
                <select value={issueForm.raisedAgainst} onChange={(e) => setIssueForm({...issueForm, raisedAgainst: e.target.value})} className="fi">
                  <option value="">— Nobody specific —</option>
                  {team.map((m) => <option key={m.username} value={m.username}>{m.username}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Assign To (for resolution)</label>
              <select value={issueForm.assignedTo} onChange={(e) => setIssueForm({...issueForm, assignedTo: e.target.value})} className="fi">
                <option value="">— Unassigned —</option>
                {team.map((m) => <option key={m.username} value={m.username}>{m.username}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowIssue(false)} className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={createInternalIssue} disabled={issueSaving || !issueForm.title.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "rgba(239,68,68,0.7)" }}>
                {issueSaving ? "Raising…" : "Raise Issue"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .fi { width:100%; padding:9px 13px; border-radius:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#e2e8f0; font-size:13px; outline:none; }
        .fi:focus { border-color:rgba(99,102,241,0.5); }
        option { background:#0f1626; color:#e2e8f0; }
      `}</style>
    </>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
