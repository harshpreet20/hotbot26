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

export default function LeadsPage() {
  const router = useRouter();
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<LeadStatus | "">("");
  const [updating, setUpdating] = useState<string | null>(null);

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
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.company || "—"}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.service || "—"}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.budget || "—"}</td>
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
                          {lead.assignedTo || <span className="text-slate-700">—</span>}
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
    </DashboardShell>
  );
}
