"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Client, ClientStatus, OnboardingStage, SubscriptionStatus, Invoice, Ticket, Project } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Status/badge meta ──────────────────────────────────────────────────────────

const STATUS_META: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  active:               { label: "Active",               color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  old:                  { label: "Old",                  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  reactivation_needed:  { label: "Reactivation Needed",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

const STAGE_META: Record<string, { label: string; color: string }> = {
  prospect:   { label: "Prospect",   color: "#64748b" },
  onboarded:  { label: "Onboarded",  color: "#3b82f6" },
  active:     { label: "Active",     color: "#22c55e" },
  vip:        { label: "VIP",        color: "#f59e0b" },
};

const INV_STATUS_META: Record<string, { color: string }> = {
  draft:     { color: "#64748b" },
  sent:      { color: "#3b82f6" },
  viewed:    { color: "#8b5cf6" },
  paid:      { color: "#22c55e" },
  overdue:   { color: "#ef4444" },
  cancelled: { color: "#475569" },
};

const TKT_STATUS_META: Record<string, { color: string; label: string }> = {
  draft:       { color: "#64748b", label: "Draft"       },
  open:        { color: "#3b82f6", label: "Open"        },
  in_progress: { color: "#f59e0b", label: "In Progress" },
  waiting:     { color: "#8b5cf6", label: "Waiting"     },
  resolved:    { color: "#22c55e", label: "Resolved"    },
  closed:      { color: "#475569", label: "Closed"      },
};

const PROJ_STATUS_META: Record<string, { color: string; label: string }> = {
  planning:   { color: "#64748b", label: "Planning"   },
  active:     { color: "#22c55e", label: "Active"     },
  on_hold:    { color: "#f59e0b", label: "On Hold"    },
  completed:  { color: "#34d399", label: "Completed"  },
  cancelled:  { color: "#ef4444", label: "Cancelled"  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
      style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}>
      {label}
    </span>
  );
}

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color, background: bg }}>{label}</span>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

// Onboarding progress steps
const ONBOARDING_STEPS: OnboardingStage[] = ["prospect", "onboarded", "active", "vip"];

function OnboardingProgress({ stage }: { stage?: OnboardingStage }) {
  const idx = stage ? ONBOARDING_STEPS.indexOf(stage) : -1;
  return (
    <div className="flex items-center gap-0 mt-2">
      {ONBOARDING_STEPS.map((s, i) => {
        const done    = i <= idx;
        const current = i === idx;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? (current ? "#6366f1" : "rgba(99,102,241,0.25)") : "rgba(255,255,255,0.05)",
                  color: done ? (current ? "#fff" : "#a5b4fc") : "#475569",
                  border: `2px solid ${done ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {done && !current ? "✓" : i + 1}
              </div>
              <p className="text-[10px] mt-1 text-center whitespace-nowrap capitalize" style={{ color: current ? "#a5b4fc" : "#475569" }}>
                {STAGE_META[s]?.label ?? s}
              </p>
            </div>
            {i < ONBOARDING_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-4 mx-1" style={{ background: i < idx ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Portal status card
type PortalUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  invite_accepted_at: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  is_active: boolean;
};

function portalStatusLabel(client: Client, portalUser: PortalUser | null): { label: string; color: string; detail?: string } {
  if (!client.portalEnabled && !portalUser) {
    return { label: "Not Invited", color: "#64748b" };
  }
  if (!portalUser) {
    return { label: "Invite Sent", color: "#f59e0b", detail: client.portalInviteSentAt ? fmtDate(client.portalInviteSentAt) : undefined };
  }
  if (!portalUser.invite_accepted_at) {
    return { label: "Pending Setup", color: "#f97316" };
  }
  return { label: "Active Portal User", color: "#34d399", detail: portalUser.name };
}

// Edit client inline form
interface EditFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  website: string;
  address: string;
  accountManager: string;
  onboardingStage: OnboardingStage | "";
  status: ClientStatus;
  subscriptionStatus: SubscriptionStatus | "";
  tags: string;
  notes: string;
}

// Invite modal
interface InviteFormData {
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const clientId = params.id;

  const [client, setClient]         = useState<Client | null>(null);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [tickets, setTickets]       = useState<Ticket[]>([]);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"overview" | "invoices" | "tickets" | "projects">("overview");

  const [editing, setEditing]       = useState(false);
  const [editForm, setEditForm]     = useState<EditFormData | null>(null);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({ email: "", name: "", role: "owner" });
  const [inviting, setInviting]     = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const canWrite = ["admin", "super_admin", "manager", "sales"].includes(getRole());

  const load = useCallback(() => {
    const token = getToken();
    if (!token) { router.replace("/enter/backdrop"); return; }
    setLoading(true);

    // Load client details
    fetch(`/api/dashboard/clients/${clientId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.clear();
          router.replace("/enter/backdrop");
          return null;
        }
        if (r.status === 404) { router.replace("/enter/backdrop/dashboard/clients"); return null; }
        return r.json();
      })
      .then((d: { client?: Client; portalUser?: PortalUser | null } | null) => {
        if (!d) return;
        if (d.client) {
          setClient(d.client);
          setPortalUser(d.portalUser ?? null);
        }
      })
      .catch(console.error);

    // Load invoices filtered by clientId or email (fire in parallel)
    const tok = token;
    Promise.all([
      fetch("/api/dashboard/invoices", { headers: { Authorization: `Bearer ${tok}` } })
        .then((r) => r.ok ? r.json() as Promise<{ invoices: Invoice[] }> : { invoices: [] }),
      fetch("/api/dashboard/tickets", { headers: { Authorization: `Bearer ${tok}` } })
        .then((r) => r.ok ? r.json() as Promise<{ tickets: Ticket[] }> : { tickets: [] }),
      fetch(`/api/dashboard/projects?client_id=${clientId}`, { headers: { Authorization: `Bearer ${tok}` } })
        .then((r) => r.ok ? r.json() as Promise<{ projects: Project[] }> : { projects: [] }),
    ]).then(([invData, tktData, prjData]) => {
      setInvoices(invData.invoices);
      setTickets(tktData.tickets);
      setProjects(prjData.projects);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [router, clientId]);

  useEffect(() => { load(); }, [load]);

  // When client loads, also filter invoices/tickets by email
  const clientInvoices = client ? invoices.filter((inv) =>
    inv.clientEmail?.toLowerCase() === client.email?.toLowerCase() ||
    inv.clientCompany?.toLowerCase() === client.company?.toLowerCase()
  ) : [];

  const clientTickets = client ? tickets.filter((t) =>
    t.requesterEmail?.toLowerCase() === client.email?.toLowerCase()
  ) : [];

  // Stats
  const totalRevenue   = clientInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding    = clientInvoices.filter((i) => ["sent", "viewed", "overdue"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const openTickets    = clientTickets.filter((t) => ["open", "in_progress", "waiting"].includes(t.status)).length;

  function startEdit() {
    if (!client) return;
    setEditForm({
      name:               client.name,
      email:              client.email,
      phone:              client.phone,
      company:            client.company,
      industry:           client.industry ?? "",
      website:            client.website ?? "",
      address:            client.address ?? "",
      accountManager:     client.accountManager ?? "",
      onboardingStage:    client.onboardingStage ?? "",
      status:             client.status,
      subscriptionStatus: client.subscriptionStatus ?? "",
      tags:               (client.tags ?? []).join(", "),
      notes:              client.notes ?? "",
    });
    setEditing(true);
    setSaveError("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !editForm) return;
    setSaving(true); setSaveError("");
    try {
      const payload = {
        id:                 client.id,
        name:               editForm.name.trim(),
        email:              editForm.email.trim(),
        phone:              editForm.phone.trim(),
        company:            editForm.company.trim(),
        industry:           editForm.industry.trim() || undefined,
        website:            editForm.website.trim() || undefined,
        address:            editForm.address.trim() || undefined,
        accountManager:     editForm.accountManager.trim() || undefined,
        onboardingStage:    editForm.onboardingStage || undefined,
        status:             editForm.status,
        subscriptionStatus: editForm.subscriptionStatus || undefined,
        tags:               editForm.tags ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        notes:              editForm.notes.trim(),
      };
      const res = await fetch("/api/dashboard/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setSaveError(d.error ?? "Failed to save");
        return;
      }
      setEditing(false);
      load();
    } catch { setSaveError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setInviting(true); setInviteError(""); setInviteSuccess("");
    try {
      const res = await fetch("/api/customers/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          clientId: client.clientId,
          email:    inviteForm.email,
          name:     inviteForm.name,
          role:     inviteForm.role,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) { setInviteError(data.error ?? "Failed to send invite"); return; }
      setInviteSuccess(data.message ?? "Invitation sent!");
      load();
      setTimeout(() => { setShowInvite(false); setInviteSuccess(""); }, 2500);
    } catch { setInviteError("Network error"); }
    finally { setInviting(false); }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      </DashboardShell>
    );
  }

  if (!client) return null;

  const pStatus = portalStatusLabel(client, portalUser);
  const sm = STATUS_META[client.status];

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        {/* Breadcrumb */}
        <header className="flex items-center gap-2 px-6 py-3 border-b text-xs text-slate-500" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <Link href="/enter/backdrop/dashboard/clients" className="hover:text-white transition-colors">Clients</Link>
          <span>/</span>
          <span className="text-slate-300">{client.name}</span>
        </header>

        <div className="flex-1 flex gap-6 p-6" style={{ flexWrap: "wrap" }}>
          {/* ── Left Column (60%) ── */}
          <div className="flex-1 min-w-0 space-y-5" style={{ minWidth: "min(100%, 560px)" }}>
            {/* Client header card */}
            <div className="rounded-2xl p-5 space-y-4" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  {initials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-white text-xl font-semibold">{client.name}</h1>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
                      {client.clientId}
                    </span>
                    <Chip label={sm.label} color={sm.color} bg={sm.bg} />
                    {client.subscriptionStatus && client.subscriptionStatus !== "none" && (
                      <Chip label={client.subscriptionStatus} color="#34d399" bg="rgba(52,211,153,0.1)" />
                    )}
                  </div>
                  {client.company && <p className="text-slate-400 text-sm mt-0.5">{client.company}</p>}
                </div>
                {canWrite && (
                  <button
                    onClick={startEdit}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors shrink-0"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Contact info row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                    {client.phone}
                  </span>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    {client.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {client.industry && (
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                    {client.industry}
                  </span>
                )}
              </div>

              {/* Tags */}
              {(client.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(client.tags ?? []).map((t) => <Tag key={t} label={t} />)}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {(["overview", "invoices", "tickets", "projects"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-4 py-2.5 text-sm font-medium capitalize transition-colors"
                  style={{
                    color: tab === t ? "#a5b4fc" : "#475569",
                    borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {t}
                  {t === "invoices" && clientInvoices.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                      {clientInvoices.length}
                    </span>
                  )}
                  {t === "tickets" && clientTickets.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      {clientTickets.length}
                    </span>
                  )}
                  {t === "projects" && projects.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                      {projects.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "overview" && (
              <div className="space-y-5">
                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox label="Total Invoices" value={String(clientInvoices.length)} color="#818cf8" />
                  <StatBox label="Total Revenue" value={formatCurrency(totalRevenue)} color="#22c55e" />
                  <StatBox label="Outstanding" value={formatCurrency(outstanding)} color="#f59e0b" />
                  <StatBox label="Open Tickets" value={String(openTickets)} color="#ef4444" />
                </div>

                {/* Account manager + onboarding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client.accountManager && (
                    <div className="rounded-xl p-4 space-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Account Manager</p>
                      <p className="text-white font-medium">{client.accountManager}</p>
                    </div>
                  )}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Onboarding Stage</p>
                    <OnboardingProgress stage={client.onboardingStage} />
                  </div>
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}

                {/* Custom fields */}
                {client.customFields && Object.keys(client.customFields).length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Custom Fields</p>
                    <div className="space-y-1.5">
                      {Object.entries(client.customFields).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-sm">
                          <span className="text-slate-500 capitalize">{k.replace(/_/g, " ")}:</span>
                          <span className="text-slate-300">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "invoices" && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {clientInvoices.length === 0 ? (
                  <p className="text-slate-500 text-sm py-10 text-center">No invoices for this client.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        {["Invoice #", "Amount", "Status", "Due"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clientInvoices.map((inv) => (
                        <tr key={inv.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="py-3 px-4">
                            <Link href={`/enter/backdrop/dashboard/invoices/${inv.id}`} className="font-mono text-xs text-indigo-400 hover:text-indigo-300">
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-white font-medium tabular-nums">
                            ₹{inv.total.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                              style={{ background: `${INV_STATUS_META[inv.status]?.color ?? "#64748b"}18`, color: INV_STATUS_META[inv.status]?.color ?? "#64748b" }}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs">
                            {inv.dueDate ? fmtDate(inv.dueDate) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "tickets" && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {clientTickets.length === 0 ? (
                  <p className="text-slate-500 text-sm py-10 text-center">No tickets for this client.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        {["Ticket #", "Title", "Priority", "Status", "Created"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clientTickets.map((t) => {
                        const ts = TKT_STATUS_META[t.status];
                        return (
                          <tr key={t.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                            <td className="py-3 px-4">
                              <Link href={`/enter/backdrop/dashboard/tickets/${t.id}`} className="font-mono text-xs text-indigo-400 hover:text-indigo-300">
                                {t.ticketNumber}
                              </Link>
                            </td>
                            <td className="py-3 px-4 text-slate-200 text-sm max-w-48 truncate">{t.title}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs capitalize" style={{ color: t.priority === "critical" ? "#ef4444" : t.priority === "high" ? "#f97316" : t.priority === "medium" ? "#f59e0b" : "#64748b" }}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={{ background: `${ts?.color ?? "#64748b"}18`, color: ts?.color ?? "#64748b" }}>
                                {ts?.label ?? t.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{fmtDate(t.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "projects" && (
              <div className="space-y-3">
                {projects.length === 0 ? (
                  <p className="text-slate-500 text-sm py-10 text-center">No projects for this client.</p>
                ) : (
                  projects.map((p) => {
                    const ps = PROJ_STATUS_META[p.status];
                    return (
                      <div key={p.id} className="rounded-xl p-4 space-y-2" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-medium text-sm">{p.name}</p>
                            <p className="text-slate-500 text-xs font-mono">{p.project_number}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                            style={{ background: `${ps?.color ?? "#64748b"}18`, color: ps?.color ?? "#64748b" }}>
                            {ps?.label ?? p.status}
                          </span>
                        </div>
                        {p.description && <p className="text-slate-500 text-xs line-clamp-2">{p.description}</p>}
                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span className="capitalize">{p.stage}</span>
                            <span>{p.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${p.progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                            />
                          </div>
                        </div>
                        {p.target_date && (
                          <p className="text-xs text-slate-600">Target: {fmtDate(p.target_date)}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ── Right Column (40%) ── */}
          <div className="space-y-4" style={{ width: "min(100%, 320px)" }}>
            {/* Portal Access card */}
            <div className="rounded-2xl p-4 space-y-3" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Portal Access</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: `${pStatus.color}18`, color: pStatus.color }}>
                  {pStatus.label}
                </span>
              </div>

              {pStatus.detail && (
                <p className="text-xs text-slate-400">{pStatus.detail}</p>
              )}

              {portalUser?.invite_accepted_at && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    {initials(portalUser.name)}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">{portalUser.name}</p>
                    <p className="text-slate-500">{portalUser.email}</p>
                  </div>
                </div>
              )}

              {portalUser?.invite_accepted_at && (
                <button
                  onClick={() => {
                    const token = getToken();
                    window.open(
                      `/api/customers/auth/admin-preview?client_id=${encodeURIComponent(client.clientId)}&token=${encodeURIComponent(token)}`,
                      "_blank"
                    );
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  View Portal
                </button>
              )}

              {canWrite && !portalUser?.invite_accepted_at && (
                <button
                  onClick={() => {
                    setInviteForm({ email: client.email, name: client.name, role: "owner" });
                    setInviteError(""); setInviteSuccess("");
                    setShowInvite(true);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  {portalUser && !portalUser.invite_accepted_at ? "Resend Invite" : "Invite to Portal"}
                </button>
              )}
            </div>

            {/* Quick Actions card */}
            <div className="rounded-2xl p-4 space-y-2" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Quick Actions</p>
              <Link
                href={`/enter/backdrop/dashboard/invoices/new?clientEmail=${encodeURIComponent(client.email)}&clientName=${encodeURIComponent(client.name)}&clientCompany=${encodeURIComponent(client.company)}`}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                New Invoice
              </Link>
              <Link
                href={`/enter/backdrop/dashboard/tickets/new?email=${encodeURIComponent(client.email)}&name=${encodeURIComponent(client.name)}`}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                New Ticket
              </Link>
              {canWrite && (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-colors text-left"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Client
                </button>
              )}
            </div>

            {/* Client metadata */}
            <div className="rounded-2xl p-4 space-y-2.5" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Details</p>
              {client.address && (
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-500 shrink-0">Address</span>
                  <span className="text-slate-300">{client.address}</span>
                </div>
              )}
              <div className="flex gap-2 text-xs">
                <span className="text-slate-500 shrink-0">Client since</span>
                <span className="text-slate-300">{fmtDate(client.createdAt)}</span>
              </div>
              {client.lastActivityAt && (
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-500 shrink-0">Last activity</span>
                  <span className="text-slate-300">{fmtDate(client.lastActivityAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editing && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)" }}>
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-2xl rounded-2xl p-6 space-y-4 mb-10"
            style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Edit Client — {client.clientId}</h2>
              <button type="button" onClick={() => setEditing(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <EF label="Name *"><input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="fi" /></EF>
              <EF label="Company"><input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="fi" /></EF>
              <EF label="Email"><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="fi" /></EF>
              <EF label="Phone"><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="fi" /></EF>
              <EF label="Industry"><input value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} className="fi" placeholder="e.g. SaaS, E-commerce" /></EF>
              <EF label="Website"><input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className="fi" placeholder="https://…" /></EF>
              <EF label="Account Manager"><input value={editForm.accountManager} onChange={(e) => setEditForm({ ...editForm, accountManager: e.target.value })} className="fi" /></EF>
              <EF label="Onboarding Stage">
                <select value={editForm.onboardingStage} onChange={(e) => setEditForm({ ...editForm, onboardingStage: e.target.value as OnboardingStage | "" })} className="fi">
                  <option value="">— Select —</option>
                  <option value="prospect">Prospect</option>
                  <option value="onboarded">Onboarded</option>
                  <option value="active">Active</option>
                  <option value="vip">VIP</option>
                </select>
              </EF>
              <EF label="Status">
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ClientStatus })} className="fi">
                  <option value="active">Active</option>
                  <option value="old">Old / Inactive</option>
                  <option value="reactivation_needed">Reactivation Needed</option>
                </select>
              </EF>
              <EF label="Subscription Status">
                <select value={editForm.subscriptionStatus} onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value as SubscriptionStatus | "" })} className="fi">
                  <option value="">— None —</option>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </EF>
            </div>
            <EF label="Address"><input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="fi" /></EF>
            <EF label="Tags (comma-separated)"><input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className="fi" placeholder="tag1, tag2, tag3" /></EF>
            <EF label="Notes"><textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className="fi resize-none" /></EF>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <form
            onSubmit={handleInvite}
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Invite to Client Portal</h2>
              <button type="button" onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            {inviteError && <p className="text-red-400 text-sm">{inviteError}</p>}
            {inviteSuccess && <p className="text-green-400 text-sm">{inviteSuccess}</p>}
            <EF label="Email">
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="fi"
              />
            </EF>
            <EF label="Name">
              <input
                required
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="fi"
              />
            </EF>
            <EF label="Role">
              <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as "owner" | "admin" | "member" })} className="fi">
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </EF>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={inviting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                {inviting ? "Sending…" : "Send Invitation"}
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
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
    </DashboardShell>
  );
}

function EF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
