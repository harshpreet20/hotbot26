"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import { EntityEmailHistory } from "@/components/backdrop/EntityEmailHistory";
import type { Client, ClientStatus } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

const STATUS_META: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  active:               { label: "Active",               color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  old:                  { label: "Old",                  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  reactivation_needed:  { label: "Reactivation Needed",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

function StatusBadge({ status }: { status: ClientStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<ClientStatus | "all">("all");
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [inviting, setInviting] = useState<string | null>(null);  // clientId being invited
  const [inviteMsg, setInviteMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  // Edit state
  const [editing, setEditing]   = useState<Client | null>(null);

  // New client form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", status: "active" as ClientStatus, notes: "" });

  const isAdmin = ["admin", "super_admin"].includes(getRole());
  const canWrite = ["admin", "super_admin", "manager", "sales"].includes(getRole());

  const load = useCallback(() => {
    const token = getToken();
    if (!token) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    fetch("/api/dashboard/clients", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret", "backdrop_role", "backdrop_username"].forEach((k) => sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setClients((d as { clients: Client[] }).clients ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [c.name, c.email, c.company, c.clientId].some((v) => v.toLowerCase().includes(q));
  });

  function copyId(clientId: string) {
    navigator.clipboard.writeText(clientId).catch(console.error);
    setCopied(clientId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to create client"); return; }
      setForm({ name: "", email: "", phone: "", company: "", status: "active", notes: "" });
      setShowAdd(false);
      load();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleStatusChange(id: string, status: ClientStatus) {
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) setClients((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    } catch { /* network error — state unchanged */ }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(editing),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Failed"); return; }
      setEditing(null);
      load();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleImpersonate(email: string) {
    try {
      const res = await fetch("/api/dashboard/clients/portal-impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ clientEmail: email }),
      });
      if (!res.ok) { alert("Impersonation failed — check the client has a portal account"); return; }
      const d = await res.json() as { redirectUrl?: string };
      if (d.redirectUrl) window.open(d.redirectUrl, "_blank");
    } catch { alert("Network error"); }
  }

  async function handlePortalInvite(id: string) {
    setInviting(id);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/dashboard/clients/portal-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ clientId: id }),
      });
      const data = await res.json() as { success?: boolean; email?: string; error?: string };
      if (res.ok) {
        setInviteMsg({ id, msg: `Invite sent to ${data.email ?? "client"}`, ok: true });
      } else {
        setInviteMsg({ id, msg: data.error ?? "Failed to send invite", ok: false });
      }
    } catch {
      setInviteMsg({ id, msg: "Network error", ok: false });
    } finally {
      setInviting(null);
      setTimeout(() => setInviteMsg(null), 4000);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/dashboard/clients?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setClients((prev) => prev.filter((c) => c.id !== id));
      else setError("Failed to delete client");
    } catch { setError("Network error"); }
  }

  const counts = {
    active:              clients.filter((c) => c.status === "active").length,
    old:                 clients.filter((c) => c.status === "old").length,
    reactivation_needed: clients.filter((c) => c.status === "reactivation_needed").length,
  };

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-wrap gap-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Clients</h1>
            <p className="text-slate-500 text-xs mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""} total</p>
          </div>
          {canWrite && (
            <button
              onClick={() => { setShowAdd(true); setError(""); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Client
            </button>
          )}
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-5">
          <Stat label="Active" value={counts.active} />
          <Stat label="Old / Inactive" value={counts.old} />
          <Stat label="Reactivation Needed" value={counts.reactivation_needed} />
        </div>

        <div className="flex-1 p-6">
          {/* Add client modal */}
          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
              <form
                onSubmit={handleAdd}
                className="w-full max-w-lg rounded-2xl p-6 space-y-4"
                style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">Add New Client</h2>
                  <button type="button" onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <F label="Client Name *">
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" className="fi" />
                  </F>
                  <F label="Company">
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." className="fi" />
                  </F>
                  <F label="Email">
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@acme.com" className="fi" />
                  </F>
                  <F label="Phone">
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 99999 00000" className="fi" />
                  </F>
                </div>
                <F label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })} className="fi">
                    <option value="active">Active</option>
                    <option value="old">Old / Inactive</option>
                    <option value="reactivation_needed">Reactivation Needed</option>
                  </select>
                </F>
                <F label="Notes">
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes about this client…" className="fi resize-none" />
                </F>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {saving ? "Creating…" : "Create Client"}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
              <form
                onSubmit={handleEdit}
                className="w-full max-w-lg rounded-2xl p-6 space-y-4"
                style={{ background: "#0f1626", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-semibold">Edit Client</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Client ID: <span className="font-mono text-indigo-400">{editing.clientId}</span></p>
                  </div>
                  <button type="button" onClick={() => setEditing(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <F label="Client Name *">
                    <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="fi" />
                  </F>
                  <F label="Company">
                    <input value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} className="fi" />
                  </F>
                  <F label="Email">
                    <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="fi" />
                  </F>
                  <F label="Phone">
                    <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="fi" />
                  </F>
                </div>
                <F label="Status">
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ClientStatus })} className="fi">
                    <option value="active">Active</option>
                    <option value="old">Old / Inactive</option>
                    <option value="reactivation_needed">Reactivation Needed</option>
                  </select>
                </F>
                <F label="Notes">
                  <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} className="fi resize-none" />
                </F>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters + Search */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none flex-1 min-w-40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            {(["all", "active", "old", "reactivation_needed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${filter === s ? "text-white" : "text-slate-500 hover:text-white"}`}
                style={filter === s
                  ? { background: s === "all" ? "rgba(99,102,241,0.2)" : STATUS_META[s as ClientStatus]?.bg ?? "rgba(99,102,241,0.2)", border: `1px solid ${s === "all" ? "rgba(99,102,241,0.4)" : STATUS_META[s as ClientStatus]?.color ?? "rgba(99,102,241,0.4)"}40` }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {s === "all" ? "All" : STATUS_META[s as ClientStatus].label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 text-sm">{search || filter !== "all" ? "No matching clients." : "No clients yet. Add your first client."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    {["Client ID", "Name", "Company", "Email", "Status", "Added", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const isEmailExpanded = expandedClient === c.id;
                    return [
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: isEmailExpanded ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                        {/* Client ID */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => copyId(c.clientId)}
                            className="flex items-center gap-1.5 font-mono text-sm font-bold transition-colors hover:text-indigo-300"
                            style={{ color: copied === c.clientId ? "#34d399" : "#818cf8" }}
                            title="Click to copy"
                          >
                            {c.clientId}
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              {copied === c.clientId
                                ? <polyline points="20 6 9 17 4 12" />
                                : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>}
                            </svg>
                          </button>
                        </td>
                        {/* Name */}
                        <td className="py-3 px-4 text-slate-200 font-medium">{c.name}</td>
                        {/* Company */}
                        <td className="py-3 px-4 text-slate-500 text-xs">{c.company || <span className="text-slate-700">—</span>}</td>
                        {/* Email */}
                        <td className="py-3 px-4">
                          {c.email
                            ? <a href={`mailto:${c.email}`} className="text-blue-400 hover:text-blue-300 text-sm">{c.email}</a>
                            : <span className="text-slate-700">—</span>}
                        </td>
                        {/* Status */}
                        <td className="py-3 px-4">
                          {canWrite ? (
                            <select
                              value={c.status}
                              onChange={(e) => handleStatusChange(c.id, e.target.value as ClientStatus)}
                              className="bg-transparent border-none outline-none text-xs cursor-pointer"
                              style={{ color: STATUS_META[c.status].color }}
                            >
                              <option value="active">Active</option>
                              <option value="old">Old</option>
                              <option value="reactivation_needed">Reactivation Needed</option>
                            </select>
                          ) : (
                            <StatusBadge status={c.status} />
                          )}
                        </td>
                        {/* Date */}
                        <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setExpandedClient(isEmailExpanded ? null : c.id)}
                              className="text-xs transition-colors"
                              style={{ color: isEmailExpanded ? "#a78bfa" : "#475569" }}
                              title="Email history"
                            >
                              ✉ Emails
                            </button>
                            {canWrite && c.email && (
                              <button
                                onClick={() => handlePortalInvite(c.id)}
                                disabled={inviting === c.id}
                                className="text-xs transition-colors disabled:opacity-50"
                                style={{ color: inviteMsg?.id === c.id && inviteMsg.ok ? "#34d399" : inviteMsg?.id === c.id && !inviteMsg.ok ? "#f87171" : "#6366f1" }}
                                title="Send portal invite"
                              >
                                {inviting === c.id ? "Sending…" : inviteMsg?.id === c.id ? inviteMsg.msg : "⬡ Portal Invite"}
                              </button>
                            )}
                            {getRole() === "super_admin" && c.email && (
                              <button
                                onClick={() => void handleImpersonate(c.email!)}
                                className="text-xs text-violet-500 hover:text-violet-300 transition-colors"
                                title="Open portal as this client (no password required)"
                              >
                                View as Client ↗
                              </button>
                            )}
                            {canWrite && (
                              <button
                                onClick={() => { setEditing(c); setError(""); }}
                                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(c.id, c.name)}
                                className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>,
                      isEmailExpanded && (
                        <tr key={`${c.id}-emails`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td colSpan={7} style={{ padding: "0 16px 16px" }}>
                            <EntityEmailHistory entityType="client" entityId={c.id} role={getRole()} />
                          </td>
                        </tr>
                      ),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
