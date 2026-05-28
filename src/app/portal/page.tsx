"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientInfo {
  name: string;
  company?: string;
  clientId: string;
  status: string;
}

interface Project {
  id: string;
  project_number?: string;
  name: string;
  description?: string;
  status: string;
  stage: string;
  priority: string;
  progress: number;
  start_date?: string;
  target_date?: string;
  meet_url?: string;
  meet_scheduled_at?: string;
  tags?: string[];
  updated_at: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  commentCount: number;
  hasStaffReply: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  dueDate?: string;
  currency: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

interface Whiteboard {
  id: string;
  title: string;
  shareToken: string;
  entityType: string;
  entityId: string;
  updatedAt: string;
}

interface PortalData {
  client:      ClientInfo;
  projects:    Project[];
  tickets:     Ticket[];
  invoices:    Invoice[];
  whiteboards: Whiteboard[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_STATUS_META: Record<string, { label: string; color: string }> = {
  discovery:   { label: "Discovery",   color: "#818cf8" },
  planning:    { label: "Planning",    color: "#a78bfa" },
  in_progress: { label: "In Progress", color: "#34d399" },
  review:      { label: "Review",      color: "#f59e0b" },
  done:        { label: "Done",        color: "#10b981" },
};

const TICKET_STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  open:        { label: "Open",        color: "#3b82f6", icon: "📬" },
  in_progress: { label: "In Progress", color: "#f59e0b", icon: "🔄" },
  waiting:     { label: "Waiting",     color: "#8b5cf6", icon: "⏳" },
  resolved:    { label: "Resolved",    color: "#22c55e", icon: "✅" },
  closed:      { label: "Closed",      color: "#475569", icon: "🔒" },
};

const INVOICE_STATUS_META: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "#64748b" },
  sent:      { label: "Sent",      color: "#3b82f6" },
  viewed:    { label: "Viewed",    color: "#8b5cf6" },
  paid:      { label: "Paid",      color: "#22c55e" },
  overdue:   { label: "Overdue",   color: "#ef4444" },
  cancelled: { label: "Cancelled", color: "#475569" },
};

const PRIORITY_META: Record<string, { color: string }> = {
  low:      { color: "#64748b" },
  medium:   { color: "#3b82f6" },
  high:     { color: "#f59e0b" },
  urgent:   { color: "#ef4444" },
  critical: { color: "#ef4444" },
};

const LS_KEY = "hotbot_portal_client_id";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {count !== undefined && (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ── Main Portal Page ──────────────────────────────────────────────────────────

export default function CustomerPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0f1a" }}>
        <p className="text-slate-400">Loading…</p>
      </div>
    }>
      <PortalInner />
    </Suspense>
  );
}

function PortalInner() {
  const searchParams = useSearchParams();
  const [clientId,   setClientId]   = useState("");
  const [verifying,  setVerifying]  = useState(false);
  const [error,      setError]      = useState("");
  const [data,       setData]       = useState<PortalData | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [activeTab,  setActiveTab]  = useState<"projects" | "tickets" | "invoices" | "whiteboards">("projects");

  // Restore saved client ID or use URL param
  useEffect(() => {
    const urlClientId = searchParams.get("clientId")?.toUpperCase();
    const saved = urlClientId || localStorage.getItem(LS_KEY);
    if (saved) {
      setClientId(saved);
      void loadPortal(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPortal = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/portal?clientId=${encodeURIComponent(id)}`);
      const json = await res.json() as { error?: string } & Partial<PortalData>;
      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to load portal.");
        setData(null);
        localStorage.removeItem(LS_KEY);
      } else {
        setData(json as PortalData);
        localStorage.setItem(LS_KEY, id);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  }, []);

  async function handleVerify() {
    const raw = clientId.trim().toUpperCase();
    if (!raw) { setError("Please enter your Client ID."); return; }
    setVerifying(true);
    await loadPortal(raw);
  }

  function handleLogout() {
    localStorage.removeItem(LS_KEY);
    setData(null);
    setClientId("");
    setError("");
  }

  // ── Login screen ─────────────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0f1a" }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold">Client Portal</h1>
            <p className="text-slate-400 text-sm mt-1">HotBot Studios</p>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <label className="block text-xs text-slate-400 mb-2 font-medium">Your Client ID</label>
            <input
              value={clientId}
              onChange={(e) => { setClientId(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="HBS-XXXXX"
              className="w-full px-4 py-3 rounded-xl font-mono text-sm text-white placeholder:text-slate-600 outline-none tracking-widest mb-3"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}` }}
            />
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={verifying || loading || !clientId.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              {verifying || loading ? "Loading…" : "Access Portal"}
            </button>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            Your Client ID was provided by your account manager.{" "}
            <a href="mailto:support@hotbotstudios.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">Need help?</a>
          </p>
        </div>
      </div>
    );
  }

  // ── Portal dashboard ──────────────────────────────────────────────────────────

  const { client, projects, tickets, invoices, whiteboards } = data;

  const openTickets    = tickets.filter((t) => !["resolved", "closed"].includes(t.status));
  const overdueInvoice = invoices.find((i) => i.status === "overdue");
  const activeProject  = projects.find((p) => p.status === "in_progress") ?? projects[0];
  const unpaidTotal    = invoices
    .filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + i.total, 0);

  const TABS: { key: typeof activeTab; label: string; count: number }[] = [
    { key: "projects",    label: "Projects",    count: projects.length    },
    { key: "tickets",     label: "Tickets",     count: tickets.length     },
    { key: "invoices",    label: "Invoices",    count: invoices.length    },
    { key: "whiteboards", label: "Whiteboards", count: whiteboards.length },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1a" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "rgba(10,15,26,0.95)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{client.name}</p>
            {client.company && <p className="text-slate-500 text-xs">{client.company}</p>}
          </div>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full ml-1"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            {client.clientId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/tickets" className="text-xs text-slate-400 hover:text-white transition-colors">
            + New Ticket
          </a>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Alert: overdue invoice */}
        {overdueInvoice && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-red-400 font-semibold">Invoice Overdue</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Invoice {overdueInvoice.invoiceNumber} is overdue. Please complete payment to avoid service interruption.{" "}
                <a href={`/invoice/${overdueInvoice.id}`} className="text-red-300 underline">View invoice →</a>
              </p>
            </div>
          </div>
        )}

        {/* Suspended account */}
        {client.status === "suspended" && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-6"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <span className="text-xl">🔒</span>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Account Suspended</p>
              <p className="text-slate-400 text-xs mt-0.5">Your account is currently suspended. Contact <a href="mailto:support@hotbotstudios.com" className="text-amber-300 underline">support@hotbotstudios.com</a> to resolve this.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Active Projects"
            value={projects.filter((p) => !["done"].includes(p.status)).length}
            icon="🚀"
            color="#818cf8"
          />
          <StatCard
            label="Open Tickets"
            value={openTickets.length}
            icon="🎯"
            color={openTickets.length > 0 ? "#f59e0b" : "#10b981"}
          />
          <StatCard
            label="Invoices"
            value={invoices.length}
            icon="🧾"
            color="#34d399"
          />
          <StatCard
            label="Amount Due"
            value={unpaidTotal > 0 ? fmtCurrency(unpaidTotal, invoices[0]?.currency) : "All Clear"}
            icon="💳"
            color={unpaidTotal > 0 ? "#f87171" : "#10b981"}
          />
        </div>

        {/* Active project spotlight */}
        {activeProject && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">Current Project</p>
                <h3 className="text-white font-bold text-lg truncate">{activeProject.name}</h3>
                {activeProject.description && (
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{activeProject.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {activeProject.status && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        color: PROJECT_STATUS_META[activeProject.status]?.color ?? "#94a3b8",
                        background: `${PROJECT_STATUS_META[activeProject.status]?.color ?? "#94a3b8"}18`,
                      }}
                    >
                      {PROJECT_STATUS_META[activeProject.status]?.label ?? activeProject.status}
                    </span>
                  )}
                  {activeProject.stage && (
                    <span className="text-xs text-slate-500 capitalize">{activeProject.stage}</span>
                  )}
                  {activeProject.target_date && (
                    <span className="text-xs text-slate-500">Due: {fmtDate(activeProject.target_date)}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                {/* Progress */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{activeProject.progress}%</p>
                  <p className="text-xs text-slate-500">Complete</p>
                  <div className="w-32 h-1.5 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${activeProject.progress}%`,
                        background: activeProject.progress === 100 ? "#10b981" : "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      }}
                    />
                  </div>
                </div>

                {/* Meet link */}
                {activeProject.meet_url && (
                  <a
                    href={activeProject.meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white"
                    style={{ background: "linear-gradient(135deg,#00832d,#34a853)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M15 8v8H9V8h6zm1.5-2H7.5C6.67 6 6 6.67 6 7.5v9C6 17.33 6.67 18 7.5 18h9c.83 0 1.5-.67 1.5-1.5v-9C18 6.67 17.33 6 16.5 6z" fill="white"/>
                      <path d="M19 10.5l-3 2v-1h-1V8h1V7l3 2v1.5z" fill="white"/>
                    </svg>
                    Join Meeting
                    {activeProject.meet_scheduled_at && (
                      <span className="opacity-75">
                        · {new Date(activeProject.meet_scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex items-center gap-1 mb-6 p-1 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: activeTab === tab.key ? "rgba(99,102,241,0.15)" : "transparent",
                color:      activeTab === tab.key ? "#818cf8" : "#64748b",
                fontWeight: activeTab === tab.key ? 600 : 400,
                border:     activeTab === tab.key ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              }}
            >
              {tab.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: activeTab === tab.key ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                  color:      activeTab === tab.key ? "#818cf8" : "#475569",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Projects tab ─────────────────────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div>
            <SectionHeader title="Your Projects" count={projects.length} />
            {projects.length === 0 ? (
              <EmptyState icon="🚀" message="No projects yet. Your account manager will set up your first project." />
            ) : (
              <div className="space-y-3">
                {projects.map((p) => {
                  const sm = PROJECT_STATUS_META[p.status] ?? { label: p.status, color: "#94a3b8" };
                  const wbs = whiteboards.filter((w) => w.entityId === p.id);
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl p-5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {p.project_number && (
                              <span className="text-[10px] font-mono text-slate-600">{p.project_number}</span>
                            )}
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ color: sm.color, background: `${sm.color}18` }}
                            >
                              {sm.label}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
                            >
                              {p.priority}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold">{p.name}</h3>
                          {p.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{p.description}</p>}

                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
                            <span className="capitalize">Stage: {p.stage}</span>
                            {p.start_date && <span>Started: {fmtDate(p.start_date)}</span>}
                            {p.target_date && <span>Due: {fmtDate(p.target_date)}</span>}
                          </div>

                          {/* Tags */}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {p.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">{p.progress}%</p>
                            <p className="text-[10px] text-slate-600">Complete</p>
                          </div>
                          <div className="w-24 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${p.progress}%`,
                                background: p.progress === 100 ? "#10b981" : `${sm.color}`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-4 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {p.meet_url && (
                          <a
                            href={p.meet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white"
                            style={{ background: "linear-gradient(135deg,#00832d,#34a853)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M15 8v8H9V8h6zm1.5-2H7.5C6.67 6 6 6.67 6 7.5v9C6 17.33 6.67 18 7.5 18h9c.83 0 1.5-.67 1.5-1.5v-9C18 6.67 17.33 6 16.5 6z" fill="white"/>
                              <path d="M19 10.5l-3 2v-1h-1V8h1V7l3 2v1.5z" fill="white"/>
                            </svg>
                            Join Meet
                            {p.meet_scheduled_at && (
                              <span className="opacity-75">
                                · {new Date(p.meet_scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </a>
                        )}
                        {wbs.map((wb) => (
                          <a
                            key={wb.id}
                            href={`/whiteboard?token=${wb.shareToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="3" width="20" height="14" rx="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            {wb.title}
                          </a>
                        ))}
                        <a
                          href="/tickets"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-white transition-colors ml-auto"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                          Report issue →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tickets tab ──────────────────────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Support Tickets" count={tickets.length} />
              <a
                href="/tickets"
                className="text-xs font-medium text-white px-3 py-1.5 rounded-xl"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                + New Ticket
              </a>
            </div>

            {tickets.length === 0 ? (
              <EmptyState icon="🎯" message="No support tickets yet. Submit one if you need help." />
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => {
                  const sm = TICKET_STATUS_META[t.status] ?? TICKET_STATUS_META.open;
                  const pm = PRIORITY_META[t.priority] ?? PRIORITY_META.medium;
                  return (
                    <a
                      key={t.id}
                      href={`/tickets/${t.id}`}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors hover:bg-white/5 block"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-500">{t.ticketNumber}</span>
                          {t.hasStaffReply && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                              Staff replied
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 text-sm font-medium truncate">{t.title}</p>
                        <p className="text-slate-600 text-xs mt-0.5 capitalize">
                          {t.category} · {fmtDate(t.createdAt)}
                          {t.commentCount > 0 && ` · ${t.commentCount} comment${t.commentCount !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ color: pm.color, background: `${pm.color}18` }}
                        >
                          {t.priority}
                        </span>
                        <span
                          className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                          style={{ color: sm.color, background: `${sm.color}15` }}
                        >
                          {sm.icon} {sm.label}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Invoices tab ─────────────────────────────────────────────────────── */}
        {activeTab === "invoices" && (
          <div>
            <SectionHeader title="Invoices" count={invoices.length} />
            {invoices.length === 0 ? (
              <EmptyState icon="🧾" message="No invoices yet." />
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const sm = INVOICE_STATUS_META[inv.status] ?? { label: inv.status, color: "#94a3b8" };
                  const isOverdue = inv.status === "overdue";
                  return (
                    <a
                      key={inv.id}
                      href={`/invoice/${inv.id}`}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors hover:bg-white/5 block"
                      style={{
                        background: isOverdue ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isOverdue ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-medium">{inv.invoiceNumber}</p>
                        <p className="text-slate-600 text-xs mt-0.5">
                          {inv.itemCount} item{inv.itemCount !== 1 ? "s" : ""} · Issued {fmtDate(inv.createdAt)}
                          {inv.dueDate && ` · Due ${fmtDate(inv.dueDate)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-white font-semibold text-sm">{fmtCurrency(inv.total, inv.currency)}</p>
                        <span
                          className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                          style={{ color: sm.color, background: `${sm.color}15` }}
                        >
                          {sm.label}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Whiteboards tab ──────────────────────────────────────────────────── */}
        {activeTab === "whiteboards" && (
          <div>
            <SectionHeader title="Shared Whiteboards" count={whiteboards.length} />
            {whiteboards.length === 0 ? (
              <EmptyState icon="🖊️" message="No whiteboards shared yet. Your account manager will share collaborative boards here." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whiteboards.map((wb) => (
                  <a
                    key={wb.id}
                    href={`/whiteboard?token=${wb.shareToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 p-5 rounded-2xl transition-all hover:border-indigo-500/30"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{wb.title}</p>
                      <p className="text-slate-600 text-xs mt-0.5 capitalize">
                        {wb.entityType} · Updated {fmtDate(wb.updatedAt)}
                      </p>
                    </div>
                    <div
                      className="text-xs text-indigo-400 font-medium mt-1"
                    >
                      Open Whiteboard →
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-500 text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}
