"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ClientStatus = "active" | "old" | "reactivation_needed";
type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type Priority = "low" | "medium" | "high" | "urgent";

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  company: string;
  status: ClientStatus;
  onboarding_stage?: string;
  account_manager?: string;
  created_at: string;
  tags?: string[];
}

interface Summary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  outstandingBalance: number;
  openTickets: number;
  resolvedTickets: number;
  healthScore: number;
}

interface Project {
  id: string;
  project_number: string;
  name: string;
  status: ProjectStatus;
  stage: string;
  priority: Priority;
  progress: number;
  start_date?: string;
  target_date?: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  resolvedAt?: string;
}

interface CRMReport {
  client: ClientDetail;
  summary: Summary;
  projects: Project[];
  invoices: Invoice[];
  tickets: Ticket[];
}

// ── Meta maps ──────────────────────────────────────────────────────────────────

const CLIENT_STATUS_META: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  active:              { label: "Active",              color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  old:                 { label: "Old",                 color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  reactivation_needed: { label: "Reactivation Needed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  planning:  { label: "Planning",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  on_hold:   { label: "On Hold",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  completed: { label: "Completed", color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: "Draft",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  sent:    { label: "Sent",    color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  paid:    { label: "Paid",    color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  overdue: { label: "Overdue", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const TICKET_STATUS_META: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "#60a5fa", bg: "rgba(96,165,250,0.12)"   },
  in_progress: { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"   },
  resolved:    { label: "Resolved",    color: "#34d399", bg: "rgba(52,211,153,0.12)"   },
  closed:      { label: "Closed",      color: "#94a3b8", bg: "rgba(148,163,184,0.12)"  },
};

const PRIORITY_DOT: Record<Priority, string> = {
  low:    "#94a3b8",
  medium: "#60a5fa",
  high:   "#f59e0b",
  urgent: "#ef4444",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtShort(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtFull(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtCurrency(amount?: number, currency = "INR") {
  if (amount == null) return "—";
  try {
    return amount.toLocaleString("en-IN", { style: "currency", currency: currency || "INR", minimumFractionDigits: 0 });
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

function healthColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        color,
        background: bg,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <h2 style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15, margin: 0 }}>{title}</h2>
      <span
        style={{
          padding: "1px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          color: "#818cf8",
          background: "rgba(99,102,241,0.15)",
        }}
      >
        {count}
      </span>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        height: 4,
        borderRadius: 999,
        background: "rgba(255,255,255,0.07)",
        overflow: "hidden",
        minWidth: 60,
        flex: 1,
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 999,
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
          transition: "width 0.4s",
        }}
      />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ClientCRMReportPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params;
  const router = useRouter();
  const [data, setData] = useState<CRMReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const secret = getSecret();
    if (!secret) {
      setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200);
      return;
    }
    setLoading(true);
    fetch(`/api/dashboard/crm-reports/${clientId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret", "backdrop_role", "backdrop_username"].forEach((k) => sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        if (r.status === 404) { setError("Client report not found."); return null; }
        if (!r.ok) { setError(`Server error (${r.status})`); return null; }
        return r.json();
      })
      .then((d: CRMReport | null) => {
        if (d) setData(d);
      })
      .catch(() => setError("Network error — could not load report."))
      .finally(() => setLoading(false));
  }, [clientId, router]);

  useEffect(() => { load(); }, [load]);

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 320 }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid rgba(99,102,241,0.3)",
              borderTopColor: "#6366f1",
              margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Loading client report…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 16 }}>{error || "Could not load report."}</p>
        <Link
          href="/enter/backdrop/dashboard/crm-reports"
          style={{ color: "#818cf8", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to CRM Reports
        </Link>
      </div>
    );
  }

  const { client, summary, projects, invoices, tickets } = data;
  const clientMeta = CLIENT_STATUS_META[client.status] ?? CLIENT_STATUS_META.active;
  const hColor = healthColor(summary.healthScore ?? 0);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

        {/* ── Page Header ── */}
        <header
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Link
            href="/enter/backdrop/dashboard/crm-reports"
            style={{
              color: "#64748b",
              fontSize: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 10,
              transition: "color 0.15s",
            }}
          >
            ← Back to CRM Reports
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 22, margin: "0 0 6px" }}>{client.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {client.company && (
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{client.company}</span>
                )}
                <Badge label={clientMeta.label} color={clientMeta.color} bg={clientMeta.bg} />
                {client.account_manager && (
                  <span style={{ color: "#64748b", fontSize: 12 }}>
                    AM: <span style={{ color: "#94a3b8" }}>{client.account_manager}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* ── Summary stat cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {/* Total Projects */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 20px",
              }}
            >
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Total Projects</p>
              <p style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: 0 }}>{summary.totalProjects ?? 0}</p>
              <p style={{ color: "#475569", fontSize: 11, marginTop: 4, marginBottom: 0 }}>
                {summary.activeProjects ?? 0} active · {summary.completedProjects ?? 0} completed
              </p>
            </div>

            {/* Total Revenue */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 20px",
              }}
            >
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Total Revenue</p>
              <p style={{ color: "#34d399", fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                {fmtCurrency(summary.totalRevenue)}
              </p>
            </div>

            {/* Outstanding Balance */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 20px",
              }}
            >
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Outstanding</p>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.2,
                  color: (summary.outstandingBalance ?? 0) > 0 ? "#f59e0b" : "#34d399",
                }}
              >
                {fmtCurrency(summary.outstandingBalance)}
              </p>
              <p style={{ color: "#475569", fontSize: 11, marginTop: 4, marginBottom: 0 }}>
                {(summary.outstandingBalance ?? 0) > 0 ? "Pending payment" : "All clear"}
              </p>
            </div>

            {/* Health Score */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 20px",
              }}
            >
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Health Score</p>
              <p style={{ color: hColor, fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
                {summary.healthScore ?? 0} <span style={{ color: "#475569", fontSize: 14, fontWeight: 400 }}>/ 100</span>
              </p>
              <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    width: `${Math.min(100, summary.healthScore ?? 0)}%`,
                    background: hColor,
                    transition: "width 0.5s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Two-column body: main + sidebar ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* ── Left: Projects / Invoices / Tickets ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Projects */}
              <section>
                <SectionTitle title="Projects" count={projects.length} />
                {projects.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: 13 }}>No projects found for this client.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {projects.map((p) => {
                      const pm = PROJECT_STATUS_META[p.status] ?? PROJECT_STATUS_META.planning;
                      return (
                        <Row key={p.id}>
                          {/* Project number pill */}
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#818cf8",
                              background: "rgba(99,102,241,0.15)",
                              border: "1px solid rgba(99,102,241,0.3)",
                              padding: "2px 9px",
                              borderRadius: 999,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {p.project_number}
                          </span>

                          {/* Name */}
                          <Link
                            href={`/enter/backdrop/dashboard/projects/${p.id}`}
                            style={{
                              color: "#e2e8f0",
                              fontSize: 13,
                              fontWeight: 500,
                              textDecoration: "none",
                              flex: 1,
                              minWidth: 100,
                            }}
                          >
                            {p.name}
                          </Link>

                          {/* Status badge */}
                          <Badge label={pm.label} color={pm.color} bg={pm.bg} />

                          {/* Stage */}
                          {p.stage && (
                            <span style={{ color: "#64748b", fontSize: 11, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                              {p.stage.replace(/_/g, " ")}
                            </span>
                          )}

                          {/* Progress bar */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 80, flex: "0 0 100px" }}>
                            <ProgressBar value={p.progress ?? 0} color={pm.color} />
                            <span style={{ color: "#475569", fontSize: 10, whiteSpace: "nowrap" }}>{p.progress ?? 0}%</span>
                          </div>

                          {/* Date range */}
                          {(p.start_date || p.target_date) && (
                            <span style={{ color: "#475569", fontSize: 11, whiteSpace: "nowrap" }}>
                              {fmtShort(p.start_date)} → {fmtShort(p.target_date)}
                            </span>
                          )}
                        </Row>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Invoices */}
              <section>
                <SectionTitle title="Invoices" count={invoices.length} />
                {invoices.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: 13 }}>No invoices found for this client.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {invoices.map((inv) => {
                      const im = INVOICE_STATUS_META[inv.status] ?? INVOICE_STATUS_META.draft;
                      return (
                        <Row key={inv.id}>
                          {/* Invoice number */}
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#94a3b8",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              minWidth: 90,
                            }}
                          >
                            {inv.invoiceNumber}
                          </span>

                          {/* Status */}
                          <Badge label={im.label} color={im.color} bg={im.bg} />

                          {/* Amount */}
                          <span
                            style={{
                              color: inv.status === "paid" ? "#34d399" : inv.status === "overdue" ? "#ef4444" : "#e2e8f0",
                              fontSize: 13,
                              fontWeight: 600,
                              flex: 1,
                            }}
                          >
                            {fmtCurrency(inv.total, inv.currency)}
                          </span>

                          {/* Due date */}
                          <span style={{ color: "#475569", fontSize: 11, whiteSpace: "nowrap" }}>
                            Due {fmtFull(inv.dueDate)}
                          </span>

                          {/* Paid date */}
                          {inv.paidDate && (
                            <span style={{ color: "#34d399", fontSize: 11, whiteSpace: "nowrap" }}>
                              Paid {fmtFull(inv.paidDate)}
                            </span>
                          )}
                        </Row>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Tickets */}
              <section>
                <SectionTitle title="Support Tickets" count={tickets.length} />
                {tickets.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: 13 }}>No support tickets for this client.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {tickets.map((t) => {
                      const tm = TICKET_STATUS_META[t.status] ?? TICKET_STATUS_META.open;
                      const dotColor = PRIORITY_DOT[t.priority] ?? "#94a3b8";
                      return (
                        <Row key={t.id}>
                          {/* Ticket number pill */}
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#64748b",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              padding: "2px 9px",
                              borderRadius: 999,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {t.ticketNumber}
                          </span>

                          {/* Title */}
                          <span style={{ color: "#e2e8f0", fontSize: 13, flex: 1, minWidth: 100 }}>{t.title}</span>

                          {/* Status */}
                          <Badge label={tm.label} color={tm.color} bg={tm.bg} />

                          {/* Priority dot */}
                          <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: dotColor,
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ color: "#64748b", fontSize: 11, textTransform: "capitalize" }}>
                              {t.priority}
                            </span>
                          </div>

                          {/* Date */}
                          <span style={{ color: "#475569", fontSize: 11, whiteSpace: "nowrap" }}>
                            {t.resolvedAt ? `Resolved ${fmtFull(t.resolvedAt)}` : fmtFull(t.createdAt)}
                          </span>
                        </Row>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* ── Right: Client Info Sidebar ── */}
            <aside>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: 20,
                  position: "sticky",
                  top: 24,
                }}
              >
                <p
                  style={{
                    color: "#475569",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                    marginBottom: 16,
                    marginTop: 0,
                  }}
                >
                  Client Info
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Email */}
                  {client.email && (
                    <InfoRow label="Email">
                      <a
                        href={`mailto:${client.email}`}
                        style={{ color: "#60a5fa", fontSize: 12, textDecoration: "none", wordBreak: "break-all" }}
                      >
                        {client.email}
                      </a>
                    </InfoRow>
                  )}

                  {/* Company */}
                  {client.company && (
                    <InfoRow label="Company">
                      <span style={{ color: "#e2e8f0", fontSize: 12 }}>{client.company}</span>
                    </InfoRow>
                  )}

                  {/* Status */}
                  <InfoRow label="Status">
                    <Badge label={clientMeta.label} color={clientMeta.color} bg={clientMeta.bg} />
                  </InfoRow>

                  {/* Onboarding stage */}
                  {client.onboarding_stage && (
                    <InfoRow label="Onboarding Stage">
                      <span style={{ color: "#818cf8", fontSize: 12 }}>{client.onboarding_stage}</span>
                    </InfoRow>
                  )}

                  {/* Account manager */}
                  {client.account_manager && (
                    <InfoRow label="Account Manager">
                      <span style={{ color: "#e2e8f0", fontSize: 12 }}>{client.account_manager}</span>
                    </InfoRow>
                  )}

                  {/* Member since */}
                  {client.created_at && (
                    <InfoRow label="Member Since">
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>
                        {new Date(client.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </InfoRow>
                  )}

                  {/* Tags */}
                  {Array.isArray(client.tags) && client.tags.length > 0 && (
                    <div>
                      <p style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px", fontWeight: 600 }}>
                        Tags
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {client.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "2px 9px",
                              borderRadius: 999,
                              fontSize: 11,
                              color: "#94a3b8",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.09)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ticket summary */}
                  <div
                    style={{
                      paddingTop: 12,
                      marginTop: 4,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <p style={{ color: "#60a5fa", fontSize: 18, fontWeight: 700, margin: 0 }}>{summary.openTickets ?? 0}</p>
                      <p style={{ color: "#475569", fontSize: 10, margin: "2px 0 0" }}>Open</p>
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <p style={{ color: "#34d399", fontSize: 18, fontWeight: 700, margin: 0 }}>{summary.resolvedTickets ?? 0}</p>
                      <p style={{ color: "#475569", fontSize: 10, margin: "2px 0 0" }}>Resolved</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          color: "#475569",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
