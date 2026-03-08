"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Lead } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const FORM_COLORS: Record<string, string> = {
  "get-started": "#3b82f6", "strategy-call": "#22c55e", "consultation": "#8b5cf6",
  "contact-sales": "#f59e0b", "enquiry": "#64748b",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch('/api/dashboard/leads', { headers: { Authorization: `Bearer ${secret}` } })
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

  const filtered = leads.filter((l) =>
    !search || [l.name, l.email, l.company, l.service, l.formType].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Leads</h1>
            <p className="text-slate-500 text-xs mt-0.5">{leads.length} total</p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-52"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">{search ? "No matching leads." : "No leads yet. Form submissions will appear here."}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Name", "Email", "Company", "Service", "Budget", "Form", "Source", "Date"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const color = FORM_COLORS[lead.formType] || "#64748b";
                    return (
                      <tr key={lead.id} className="border-b hover:bg-white/[0.02] transition-colors group" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <td className="py-3 px-3 text-white font-medium whitespace-nowrap">{lead.name}</td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-400 transition-colors">{lead.email}</a>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.company || "—"}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.service || "—"}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.budget || "—"}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${color}18`, color }}>
                            {lead.formType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">{lead.source}</td>
                        <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
