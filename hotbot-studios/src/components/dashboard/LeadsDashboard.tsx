"use client";
import { useState, useEffect } from "react";
import type { Lead } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  converted: "#22c55e",
  lost: "#ef4444",
};

export function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/n8n/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: Lead["status"]) => {
    try {
      await fetch("/api/n8n/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setLeads((l) => l.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
    } catch {
      alert("Failed to update status");
    }
  };

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  return (
    <div className="relative z-10 min-h-screen pt-20 px-6 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Leads Dashboard</h1>
          <p className="text-slate-400">Manage and track all incoming leads.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: stats.total, color: "#3b82f6" },
            { label: "New", value: stats.new, color: "#3b82f6" },
            { label: "Contacted", value: stats.contacted, color: "#f59e0b" },
            { label: "Converted", value: stats.converted, color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "new", "contacted", "converted", "lost"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200"
              style={{
                background: filter === f ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === f ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: filter === f ? "#93c5fd" : "#64748b",
              }}
            >
              {f === "all" ? `All (${leads.length})` : f}
            </button>
          ))}
          <button
            onClick={fetchLeads}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all duration-200"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading leads...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400">No leads found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leads list */}
            <div className="lg:col-span-2 space-y-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: selected?.id === lead.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{lead.name}</p>
                      <p className="text-slate-400 text-xs truncate">{lead.email}</p>
                      {lead.company && <p className="text-slate-500 text-xs">{lead.company}</p>}
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize"
                        style={{
                          background: `${STATUS_COLORS[lead.status]}15`,
                          color: STATUS_COLORS[lead.status],
                          border: `1px solid ${STATUS_COLORS[lead.status]}30`,
                        }}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {lead.service && (
                      <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{lead.service}</span>
                    )}
                    {lead.budget && (
                      <span className="text-[11px] text-slate-500">{lead.budget}</span>
                    )}
                    <span className="text-[11px] text-slate-600 ml-auto">
                      {lead.ts ? new Date(lead.ts).toLocaleDateString("en-GB") : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lead detail */}
            <div className="lg:col-span-1">
              {selected ? (
                <div className="sticky top-20 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-white">{selected.name}</h3>
                    <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-sm">✕</button>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "Email", value: selected.email },
                      { label: "Phone", value: selected.phone },
                      { label: "Company", value: selected.company },
                      { label: "Service", value: selected.service },
                      { label: "Budget", value: selected.budget },
                      { label: "Form Type", value: selected.formType },
                      { label: "Source", value: selected.source },
                    ].filter(f => f.value).map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-slate-500 text-[11px] uppercase tracking-wider">{label}</p>
                        <p className="text-slate-300 text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                    {selected.message && (
                      <div>
                        <p className="text-slate-500 text-[11px] uppercase tracking-wider">Message</p>
                        <p className="text-slate-300 text-sm mt-0.5 leading-relaxed">{selected.message}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["new", "contacted", "converted", "lost"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className="py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200"
                        style={{
                          background: selected.status === s ? `${STATUS_COLORS[s]}15` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${selected.status === s ? STATUS_COLORS[s] + "40" : "rgba(255,255,255,0.08)"}`,
                          color: selected.status === s ? STATUS_COLORS[s] : "#64748b",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center text-slate-500 text-sm">
                  Select a lead to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
