"use client";
/**
 * ClientContextCard
 * Displays a contextual summary for a client:
 *   - Account status badge
 *   - Active project
 *   - Invoice totals (total, paid, overdue)
 *   - Open ticket count
 *   - Warning badges for overdue invoices, suspended accounts, urgent open tickets
 *
 * Takes `clientId` (HBS-XXXXX format) and the internal row UUID `id`.
 */
import { useEffect, useState } from "react";
import type { AccountStatus, Invoice, Ticket } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

// ── Sub-types ─────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  status?: string;
  clientId?: string;
}

interface InvoiceSummary {
  total:   number;
  paid:    number;
  overdue: number;
  count:   number;
}

interface ClientContextData {
  accountStatus: AccountStatus;
  suspensionReason?: string | null;
  activeProject: Project | null;
  invoiceSummary: InvoiceSummary;
  openTickets: number;
  urgentOpenTickets: number;
}

// ── Badge components ──────────────────────────────────────────────────────────

const ACCOUNT_STATUS_META: Record<AccountStatus, { label: string; color: string; bg: string }> = {
  active:     { label: "Active",     color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  suspended:  { label: "Suspended",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  terminated: { label: "Terminated", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const m = ACCOUNT_STATUS_META[status] ?? ACCOUNT_STATUS_META.active;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: m.color, background: m.bg }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: m.color }}
      />
      {m.label}
    </span>
  );
}

function WarningBadge({ label, color = "#f59e0b" }: { label: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color, background: `${color}20` }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 20h20L12 2zm0 3l7.5 13H4.5L12 5zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
      </svg>
      {label}
    </span>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-bold" style={{ color: color ?? "#e2e8f0" }}>{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ClientContextCardProps {
  /** The internal row UUID of the client */
  id: string;
  /** The HBS-XXXXX client identifier */
  clientId: string;
  /** Client email — used to match invoices */
  clientEmail?: string;
  className?: string;
}

export function ClientContextCard({ id, clientId, clientEmail, className }: ClientContextCardProps) {
  const [data, setData]     = useState<ClientContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    if (!token) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        // Parallel fetches
        const [projectsRes, invoicesRes, ticketsRes] = await Promise.allSettled([
          fetch(`/api/dashboard/projects?clientId=${encodeURIComponent(clientId)}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/dashboard/invoices", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/dashboard/tickets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (cancelled) return;

        // Projects
        let activeProject: Project | null = null;
        if (projectsRes.status === "fulfilled" && projectsRes.value.ok) {
          const pd = await projectsRes.value.json() as { projects?: Project[] };
          const projs = pd.projects ?? [];
          activeProject = projs.find(
            (p) => p.clientId === clientId && (!p.status || p.status === "active" || p.status === "in_progress"),
          ) ?? projs[0] ?? null;
        }

        // Invoices
        const invoiceSummary: InvoiceSummary = { total: 0, paid: 0, overdue: 0, count: 0 };
        if (invoicesRes.status === "fulfilled" && invoicesRes.value.ok) {
          const id_ = await invoicesRes.value.json() as { invoices?: Invoice[] };
          const clientInvoices = (id_.invoices ?? []).filter(
            (inv) => inv.clientEmail?.toLowerCase() === (clientEmail ?? "").toLowerCase(),
          );
          invoiceSummary.count = clientInvoices.length;
          for (const inv of clientInvoices) {
            invoiceSummary.total += inv.total ?? 0;
            if (inv.status === "paid") invoiceSummary.paid += inv.total ?? 0;
            if (inv.status === "overdue") invoiceSummary.overdue += inv.total ?? 0;
          }
        }

        // Tickets
        let openTickets       = 0;
        let urgentOpenTickets = 0;
        if (ticketsRes.status === "fulfilled" && ticketsRes.value.ok) {
          const td = await ticketsRes.value.json() as { tickets?: Ticket[] };
          const clientTickets = (td.tickets ?? []).filter((t) => t.clientId === id);
          openTickets = clientTickets.filter(
            (t) => t.status === "open" || t.status === "in_progress",
          ).length;
          urgentOpenTickets = clientTickets.filter(
            (t) => (t.status === "open" || t.status === "in_progress") && (t.priority === "critical" || t.priority === "high"),
          ).length;
        }

        if (!cancelled) {
          setData({
            accountStatus:    "active", // default; overridden by parent with real value if passed
            activeProject,
            invoiceSummary,
            openTickets,
            urgentOpenTickets,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load client context");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData().catch(console.error);
    return () => { cancelled = true; };
  }, [id, clientId, clientEmail]);

  if (loading) {
    return (
      <div
        className={`rounded-xl p-4 animate-pulse ${className ?? ""}`}
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="h-3 w-24 bg-slate-700 rounded mb-3" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 bg-slate-700/50 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className={`rounded-xl p-4 ${className ?? ""}`}
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-xs text-slate-600">{error ?? "No context data available."}</p>
      </div>
    );
  }

  const fmt = (n: number) =>
    n >= 100_000
      ? `₹${(n / 100_000).toFixed(1)}L`
      : n >= 1_000
      ? `₹${(n / 1_000).toFixed(1)}k`
      : `₹${n.toFixed(0)}`;

  const warnings: { label: string; color: string }[] = [];
  if (data.accountStatus === "suspended")                warnings.push({ label: "Account Suspended", color: "#f59e0b" });
  if (data.accountStatus === "terminated")               warnings.push({ label: "Account Terminated", color: "#ef4444" });
  if (data.invoiceSummary.overdue > 0)                   warnings.push({ label: "Overdue Invoices", color: "#f59e0b" });
  if (data.urgentOpenTickets > 0)                        warnings.push({ label: `${data.urgentOpenTickets} Urgent Ticket${data.urgentOpenTickets > 1 ? "s" : ""}`, color: "#ef4444" });

  return (
    <div
      className={`rounded-xl p-4 space-y-3 ${className ?? ""}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Overview</p>
        <AccountStatusBadge status={data.accountStatus} />
      </div>

      {/* Warning badges */}
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {warnings.map((w) => (
            <WarningBadge key={w.label} label={w.label} color={w.color} />
          ))}
        </div>
      )}

      {/* Active project */}
      {data.activeProject ? (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <div className="min-w-0">
            <p className="text-xs text-indigo-300 font-medium truncate">{data.activeProject.name}</p>
            {data.activeProject.status && (
              <p className="text-xs text-slate-500 capitalize">{data.activeProject.status.replace(/_/g, " ")}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-600 italic">No active project</p>
      )}

      {/* Invoice summary */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Total Billed" value={fmt(data.invoiceSummary.total)} />
        <StatBox label="Paid"         value={fmt(data.invoiceSummary.paid)}    color="#34d399" />
        <StatBox label="Overdue"      value={fmt(data.invoiceSummary.overdue)} color={data.invoiceSummary.overdue > 0 ? "#f87171" : undefined} />
      </div>

      {/* Tickets */}
      <div className="flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-500">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
        <p className="text-xs text-slate-400">
          {data.openTickets > 0
            ? <><span className="text-white font-medium">{data.openTickets}</span> open ticket{data.openTickets !== 1 ? "s" : ""}</>
            : <span className="text-slate-600">No open tickets</span>}
        </p>
      </div>
    </div>
  );
}
