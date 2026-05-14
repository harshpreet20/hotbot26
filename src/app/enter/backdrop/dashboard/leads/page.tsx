"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Lead, LeadStatus } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const FORM_COLORS: Record<string, string> = {
  "get-started": "#3b82f6", "strategy-call": "#22c55e", "consultation": "#8b5cf6",
  "contact-sales": "#f59e0b", "enquiry": "#64748b", "manual": "#06b6d4",
};

const STATUS_META: Record<LeadStatus, { label: string; color: string }> = {
  new:          { label: "New",          color: "#3b82f6" },
  contacted:    { label: "Contacted",    color: "#8b5cf6" },
  qualified:    { label: "Qualified",    color: "#06b6d4" },
  proposal:     { label: "Proposal",     color: "#f59e0b" },
  negotiation:  { label: "Negotiation",  color: "#f97316" },
  won:          { label: "Won",          color: "#22c55e" },
  lost:         { label: "Lost",         color: "#ef4444" },
};

const SERVICES = ["Web Development", "Mobile App", "AI Automation", "SEO", "Digital Marketing", "UI/UX Design", "Consulting", "Other"];
const BUDGETS  = ["< $1k", "$1k–$5k", "$5k–$15k", "$15k–$50k", "$50k+", "Not sure"];

export default function LeadsPage() {
  const router = useRouter();
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<LeadStatus | "">("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Add Lead modal
  const [showAdd,    setShowAdd]    = useState(false);
  const [adding,     setAdding]     = useState(false);
  const [addError,   setAddError]   = useState("");
  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", company: "",
    service: "", budget: "", message: "", status: "new" as LeadStatus,
  });

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/leads", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem("backdrop_secret");
          sessionStorage.removeItem("backdrop_role");
          sessionStorage.removeItem("backdrop_username");
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setLeads((d as { leads: Lead[] }).leads); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const secret = getSecret();
    setUpdating(id);
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const data = await res.json() as { lead: Lead };
        setLeads((prev) => prev.map((l) => l.id === id ? data.lead : l));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function addLeadManually(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    if (!newLead.name.trim()) { setAddError("Name is required."); return; }
    const secret = getSecret();
    setAdding(true);
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...newLead, formType: "manual", source: "manual" }),
      });
      const data = await res.json() as { lead?: Lead; error?: string };
      if (!res.ok) { setAddError(data.error || "Failed to create lead."); return; }
      if (data.lead) setLeads((prev) => [data.lead!, ...prev]);
      setShowAdd(false);
      setNewLead({ name: "", email: "", phone: "", company: "", service: "", budget: "", message: "", status: "new" });
    } catch { setAddError("Network error."); }
    finally { setAdding(false); }
  }

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [l.name, l.email, l.company, l.service, l.formType].some((v) => v.toLowerCase().includes(q));
    const matchFilter = !filter || l.status === filter;
    return matchSearch && matchFilter;
  });

  const pipeline: Record<LeadStatus, number> = {
    new: 0, contacted: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0, lost: 0,
  };
  leads.forEach((l) => { pipeline[l.status ?? "new"]++; });

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Leads</h1>
            <p className="text-slate-500 text-xs mt-0.5">{leads.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-44"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LeadStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All stages</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button
              onClick={() => { setShowAdd(true); setAddError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
            >
              + Add Lead
            </button>
          </div>
        </header>

        {/* Pipeline summary */}
        {!loading && (
          <div className="flex gap-2 px-6 pt-5 overflow-x-auto pb-1">
            {(Object.entries(STATUS_META) as [LeadStatus, { label: string; color: string }][]).map(([status, meta]) => (
              <button
                key={status}
                onClick={() => setFilter(filter === status ? "" : status)}
                className="rounded-xl px-3 py-2.5 text-center shrink-0 transition-all"
                style={{
                  border: `1px solid ${filter === status ? meta.color : "rgba(255,255,255,0.07)"}`,
                  background: filter === status ? `${meta.color}15` : "transparent",
                  minWidth: 80,
                }}
              >
                <p className="text-xl font-bold tabular-nums" style={{ color: meta.color }}>{pipeline[status]}</p>
                <p className="text-xs text-slate-500 mt-0.5">{meta.label}</p>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search || filter ? "No matching leads." : "No leads yet. Form submissions will appear here."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Name", "Email", "Company", "Service", "Budget", "Stage", "Assigned", "Form", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const formColor  = FORM_COLORS[lead.formType] || "#64748b";
                    const leadStatus = lead.status ?? "new";
                    const sm = STATUS_META[leadStatus];
                    return (
                      <tr key={lead.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <td className="py-3 px-3 text-white font-medium whitespace-nowrap">
                          <Link href={`/enter/backdrop/dashboard/leads/${lead.id}`} className="hover:text-indigo-300 transition-colors">
                            {lead.name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-400 transition-colors">{lead.email}</a>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.company || "-"}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.service || "-"}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.budget || "-"}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <select
                            value={leadStatus}
                            disabled={updating === lead.id}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer outline-none"
                            style={{ background: `${sm.color}18`, color: sm.color, border: `1px solid ${sm.color}40` }}
                          >
                            {Object.entries(STATUS_META).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                          {lead.assignedTo || <span className="text-slate-700">-</span>}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${formColor}18`, color: formColor }}>
                            {lead.formType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Link
                            href={`/enter/backdrop/dashboard/leads/${lead.id}`}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View →
                          </Link>
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
      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-white font-semibold mb-5">Add Lead Manually</h2>
            <form onSubmit={addLeadManually} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Name *</label>
                  <input
                    value={newLead.name}
                    onChange={(e) => setNewLead((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                    required
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Phone</label>
                  <input
                    value={newLead.phone}
                    onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 234 567 8900"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Company</label>
                  <input
                    value={newLead.company}
                    onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Company name"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Service</label>
                  <select
                    value={newLead.service}
                    onChange={(e) => setNewLead((p) => ({ ...p, service: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <option value="">Select service…</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Budget</label>
                  <select
                    value={newLead.budget}
                    onChange={(e) => setNewLead((p) => ({ ...p, budget: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <option value="">Select budget…</option>
                    {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Initial Stage</label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead((p) => ({ ...p, status: e.target.value as LeadStatus }))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Notes</label>
                <textarea
                  value={newLead.message}
                  onChange={(e) => setNewLead((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Any initial notes about this lead…"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              {addError && <p className="text-red-400 text-xs">{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm text-slate-400 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                >
                  {adding ? "Adding…" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
