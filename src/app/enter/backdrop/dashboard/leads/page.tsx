"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lead, LeadStatus } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

const SOURCE_LABELS: Record<string, string> = {
  "contact-page":       "Contact Page",
  "visiting-card":      "Card Scan",
  "manual":             "Manual",
  "chatbot-chat-tab":   "Chat",
  "chatbot-call-tab":   "Callback",
  "support":            "Support",
  "newsletter-signup":  "Newsletter",
  "direct":             "Direct",
};

function fmtSource(source?: string | null): string {
  if (!source) return "—";
  return SOURCE_LABELS[source] ?? source.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const FORM_COLORS: Record<string, string> = {
  "get-started": "#3b82f6", "strategy-call": "#22c55e", "consultation": "#8b5cf6",
  "contact-sales": "#f59e0b", "enquiry": "#64748b", "manual": "#06b6d4",
  "newsletter": "#ec4899", "chat": "#f97316", "callback": "#84cc16",
  "support-ticket": "#ef4444", "contact": "#a78bfa", "card-scan": "#06b6d4",
};

const STATUS_META: Record<LeadStatus, { label: string; color: string }> = {
  new:          { label: "New",          color: "#3b82f6" },
  contacted:    { label: "Contacted",    color: "#8b5cf6" },
  qualified:    { label: "Qualified",    color: "#06b6d4" },
  proposal:     { label: "Proposal",     color: "#f59e0b" },
  negotiation:  { label: "Negotiation",  color: "#f97316" },
  won:          { label: "Won",          color: "#22c55e" },
  lost:         { label: "Lost",         color: "#ef4444" },
  converted:    { label: "Converted",    color: "#22c55e" },
};

const SERVICES = ["Web Development", "Mobile App", "AI Automation", "SEO", "Digital Marketing", "UI/UX Design", "Consulting", "Other"];
const BUDGETS  = ["< $1k", "$1k–$5k", "$5k–$15k", "$15k–$50k", "$50k+", "Not sure"];

interface TeamMember { username: string; role: string; }
interface ScannedCard {
  name: string; email: string; phone: string; company: string; title: string; website: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads,      setLeads]      = useState<Lead[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<LeadStatus | "">("");
  const [updating,   setUpdating]   = useState<string | null>(null);
  const [assigning,  setAssigning]  = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const [converted,  setConverted]  = useState<Set<string>>(new Set());
  const [convertMsg, setConvertMsg] = useState<Record<string, string>>({});
  const [team,       setTeam]       = useState<TeamMember[]>([]);
  const [role,       setRole]       = useState("");
  const [scoreMap,   setScoreMap]   = useState<Record<string, string>>({});

  // Add Lead modal
  const [showAdd,  setShowAdd]  = useState(false);
  const [adding,   setAdding]   = useState(false);
  const [addError, setAddError] = useState("");
  const [newLead,  setNewLead]  = useState({
    name: "", email: "", phone: "", company: "",
    service: "", budget: "", message: "", status: "new" as LeadStatus,
  });

  // Scan Card modal
  const [showScan,    setShowScan]    = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanFile,    setScanFile]    = useState<File | null>(null);
  const [scanning,    setScanning]    = useState(false);
  const [scanResult,  setScanResult]  = useState<ScannedCard | null>(null);
  const [scanError,   setScanError]   = useState("");
  const [savingScan,  setSavingScan]  = useState(false);
  const [scanLead,    setScanLead]    = useState({ name: "", email: "", phone: "", company: "", message: "", service: "", budget: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRole(getRole()); }, []);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
    Promise.all([
      fetch("/api/dashboard/leads", { headers: { Authorization: `Bearer ${secret}` } }),
      fetch("/api/dashboard/team",  { headers: { Authorization: `Bearer ${secret}` } }),
    ]).then(async ([lr, tr]) => {
      if (lr.status === 401) {
        sessionStorage.removeItem("backdrop_secret");
        sessionStorage.removeItem("backdrop_role");
        sessionStorage.removeItem("backdrop_username");
        router.replace("/enter/backdrop");
        return;
      }
      const ld = await lr.json() as { leads: Lead[] };
      const td = await tr.json().catch(() => ({ members: [] })) as { members: TeamMember[] };
      setLeads(ld.leads);
      setTeam(td.members ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) return;
    fetch("/api/dashboard/analytics/behavior", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => r.ok ? r.json() as Promise<{ top_engaged?: { email: string; lead_quality: string }[] }> : null)
      .then((d) => {
        if (!d?.top_engaged) return;
        const map: Record<string, string> = {};
        for (const entry of d.top_engaged) { map[entry.email] = entry.lead_quality; }
        setScoreMap(map);
      })
      .catch(() => {});
  }, []);

  function exportCSV() {
    const secret = getSecret();
    fetch("/api/dashboard/leads/export", { headers: { Authorization: `Bearer ${secret}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(console.error);
  }

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
    } finally { setUpdating(null); }
  }

  async function assignLead(id: string, assignedTo: string) {
    const secret = getSecret();
    setAssigning(id);
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, assignedTo: assignedTo || null }),
      });
      if (res.ok) {
        const data = await res.json() as { lead: Lead };
        setLeads((prev) => prev.map((l) => l.id === id ? data.lead : l));
      }
    } finally { setAssigning(null); }
  }

  async function deleteLead(id: string, name: string) {
    if (!confirm(`Permanently delete lead "${name}"? This cannot be undone.`)) return;
    const secret = getSecret();
    setDeleting(id);
    try {
      const res = await fetch(`/api/dashboard/leads?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } finally { setDeleting(null); }
  }

  async function convertToClient(lead: Lead) {
    const secret = getSecret();
    if (!confirm(`Convert ${lead.name} to a client?`)) return;
    setConverting(lead.id);
    setConvertMsg((prev) => ({ ...prev, [lead.id]: "" }));
    try {
      const res = await fetch(`/api/dashboard/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setConverted((prev) => new Set([...prev, lead.id]));
        setConvertMsg((prev) => ({ ...prev, [lead.id]: "Converted ✓" }));
      } else {
        setConvertMsg((prev) => ({ ...prev, [lead.id]: data.error || "Failed" }));
      }
    } catch {
      setConvertMsg((prev) => ({ ...prev, [lead.id]: "Network error" }));
    } finally { setConverting(null); }
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

  function handleCardFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanFile(file);
    setScanPreview(URL.createObjectURL(file));
    setScanResult(null); setScanError("");
  }

  async function scanCard() {
    if (!scanFile) return;
    setScanning(true); setScanError("");
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => { const r = reader.result as string; resolve(r.split(",")[1] ?? r); };
        reader.onerror = reject;
        reader.readAsDataURL(scanFile);
      });
      const secret = getSecret();
      const res = await fetch("/api/dashboard/scan-card", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json() as { contact?: ScannedCard; error?: string };
      if (!res.ok || !data.contact) { setScanError(data.error || "Failed to scan card."); return; }
      setScanResult(data.contact);
      setScanLead({
        name: data.contact.name, email: data.contact.email, phone: data.contact.phone,
        company: data.contact.company,
        message: data.contact.title ? `Title: ${data.contact.title}${data.contact.website ? ` | Website: ${data.contact.website}` : ""}` : "",
        service: "", budget: "",
      });
    } catch { setScanError("Network error. Please try again."); }
    finally { setScanning(false); }
  }

  async function saveScannedLead(e: React.FormEvent) {
    e.preventDefault();
    setScanError("");
    if (!scanLead.name.trim()) { setScanError("Name is required."); return; }
    const secret = getSecret();
    setSavingScan(true);
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...scanLead, formType: "card-scan", source: "visiting-card" }),
      });
      const data = await res.json() as { lead?: Lead; error?: string };
      if (!res.ok) { setScanError(data.error || "Failed to save lead."); return; }
      if (data.lead) setLeads((prev) => [data.lead!, ...prev]);
      setShowScan(false);
      setScanPreview(null); setScanFile(null); setScanResult(null); setScanError("");
    } catch { setScanError("Network error."); }
    finally { setSavingScan(false); }
  }

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [l.name, l.email, l.company, l.service, l.formType, l.source, l.assignedTo].some((v) => v?.toLowerCase().includes(q));
    const matchFilter = !filter || l.status === filter;
    return matchSearch && matchFilter;
  });

  const pipeline: Record<LeadStatus, number> = {
    new: 0, contacted: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0, lost: 0, converted: 0,
  };
  leads.forEach((l) => { pipeline[l.status ?? "new"]++; });

  const canDelete = role === "super_admin" || role === "admin";
  const canAssign = role === "super_admin" || role === "admin" || role === "manager" || role === "sales";

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Leads</h1>
            <p className="text-slate-500 text-xs mt-0.5">{leads.length} total</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <input
              type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-44"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select
              value={filter} onChange={(e) => setFilter(e.target.value as LeadStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All stages</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button
              onClick={() => { setShowScan(true); setScanPreview(null); setScanFile(null); setScanResult(null); setScanError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 shrink-0"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >Scan Card</button>
            {canDelete && (
              <button onClick={exportCSV}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 shrink-0"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              >↓ Export CSV</button>
            )}
            <button
              onClick={() => { setShowAdd(true); setAddError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
            >+ Add Lead</button>
          </div>
        </header>

        {/* Pipeline summary */}
        {!loading && (
          <div className="flex gap-2 px-6 pt-5 overflow-x-auto pb-1">
            {(Object.entries(STATUS_META) as [LeadStatus, { label: string; color: string }][]).map(([status, meta]) => (
              <button key={status} onClick={() => setFilter(filter === status ? "" : status)}
                className="rounded-xl px-3 py-2.5 text-center shrink-0 transition-all"
                style={{ border: `1px solid ${filter === status ? meta.color : "rgba(255,255,255,0.07)"}`, background: filter === status ? `${meta.color}15` : "transparent", minWidth: 80 }}
              >
                <p className="text-xl font-bold tabular-nums" style={{ color: meta.color }}>{pipeline[status]}</p>
                <p className="text-xs text-slate-500 mt-0.5">{meta.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* Table */}
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
                    {["Name", "Email", "Company", "Service", "Budget", "Stage", "Assigned To", "Source", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const formColor  = FORM_COLORS[lead.formType ?? ""] || "#64748b";
                    const leadStatus = lead.status ?? "new";
                    const sm         = STATUS_META[leadStatus];
                    const isConverted = converted.has(lead.id) || lead.journeyStage === "client" || (lead.status as string) === "converted";

                    return (
                      <tr key={lead.id} className={`border-b transition-colors ${deleting === lead.id ? "opacity-40" : "hover:bg-white/[0.02]"}`}
                        style={{ borderColor: "rgba(255,255,255,0.04)" }}>

                        {/* Name */}
                        <td className="py-3 px-3 text-white font-medium whitespace-nowrap">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Link href={`/enter/backdrop/dashboard/leads/${lead.id}`} className="hover:text-indigo-300 transition-colors">
                              {lead.name}
                            </Link>
                            {scoreMap[lead.email] === "hot"  && <span title="Hot lead">🔥</span>}
                            {scoreMap[lead.email] === "warm" && <span title="Warm lead">🌡</span>}
                            {scoreMap[lead.email] === "cold" && <span title="Cold lead">❄</span>}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-400 transition-colors">{lead.email}</a>
                        </td>

                        {/* Company */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.company || "—"}</td>

                        {/* Service */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.service || "—"}</td>

                        {/* Budget */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{lead.budget || "—"}</td>

                        {/* Stage */}
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

                        {/* Assigned To */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {canAssign ? (
                            <select
                              value={lead.assignedTo ?? ""}
                              disabled={assigning === lead.id}
                              onChange={(e) => assignLead(lead.id, e.target.value)}
                              className="px-2 py-0.5 rounded-lg text-[11px] cursor-pointer outline-none max-w-[120px]"
                              style={{ background: lead.assignedTo ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)", color: lead.assignedTo ? "#a5b4fc" : "#475569", border: `1px solid ${lead.assignedTo ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}` }}
                            >
                              <option value="">Unassigned</option>
                              {team.map((m) => (
                                <option key={m.username} value={m.username}>{m.username}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-500 text-xs">{lead.assignedTo || <span className="text-slate-700">—</span>}</span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium inline-block w-fit"
                              style={{ background: `${formColor}18`, color: formColor }}>
                              {lead.formType ?? "—"}
                            </span>
                            <span className="text-[10px] text-slate-600">{fmtSource(lead.source)}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/enter/backdrop/dashboard/leads/${lead.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                              View →
                            </Link>

                            {canAssign && (
                              isConverted ? (
                                <span style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 11, fontWeight: 600 }}>
                                  {convertMsg[lead.id] || "Client ✓"}
                                </span>
                              ) : (
                                <>
                                  <button
                                    disabled={converting === lead.id}
                                    onClick={() => convertToClient(lead)}
                                    style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: 11, cursor: "pointer", opacity: converting === lead.id ? 0.6 : 1 }}
                                  >
                                    {converting === lead.id ? "…" : "→ Client"}
                                  </button>
                                  {convertMsg[lead.id] && (
                                    <span className="text-xs text-red-400">{convertMsg[lead.id]}</span>
                                  )}
                                </>
                              )
                            )}

                            {canDelete && (
                              <button
                                onClick={() => deleteLead(lead.id, lead.name)}
                                disabled={deleting === lead.id}
                                title="Delete lead"
                                className="text-slate-700 hover:text-red-400 transition-colors disabled:opacity-40"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
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
                {([["name", "Name *", "Full name"], ["email", "Email", "email@example.com"], ["phone", "Phone", "+1 234 567 8900"], ["company", "Company", "Company name"]] as const).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
                    <input value={newLead[field]} onChange={(e) => setNewLead((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder} className={inputCls} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Service</label>
                  <select value={newLead.service} onChange={(e) => setNewLead((p) => ({ ...p, service: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                    <option value="">Select service…</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Budget</label>
                  <select value={newLead.budget} onChange={(e) => setNewLead((p) => ({ ...p, budget: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                    <option value="">Select budget…</option>
                    {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Assign To</label>
                <select value={newLead.status} onChange={(e) => setNewLead((p) => ({ ...p, status: e.target.value as LeadStatus }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Notes</label>
                <textarea value={newLead.message} onChange={(e) => setNewLead((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Any initial notes about this lead…" rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none" style={inputStyle} />
              </div>
              {addError && <p className="text-red-400 text-xs">{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-xl text-sm text-slate-400 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  {adding ? "Adding…" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scan Visiting Card Modal */}
      {showScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto" style={{ background: "#0f1624", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-base">Scan Visiting Card</h2>
                <p className="text-slate-500 text-xs mt-0.5">Take a photo or upload a business card image</p>
              </div>
              <button onClick={() => setShowScan(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {!scanResult && (
              <div className="flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCardFileChange} className="hidden" />
                {!scanPreview ? (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-10 rounded-2xl flex flex-col items-center gap-3 transition-colors hover:bg-white/[0.04]"
                    style={{ border: "2px dashed rgba(255,255,255,0.12)" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span className="text-slate-400 text-sm">Take Photo or Upload Image</span>
                    <span className="text-slate-600 text-xs">Camera opens automatically on mobile</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <img src={scanPreview} alt="Card preview" className="w-full rounded-2xl object-contain max-h-48" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-400" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Change Image</button>
                      <button onClick={scanCard} disabled={scanning} className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                        {scanning ? "Scanning…" : "Scan Card"}
                      </button>
                    </div>
                  </div>
                )}
                {scanError && <p className="text-red-400 text-xs">{scanError}</p>}
              </div>
            )}

            {scanResult && (
              <form onSubmit={saveScannedLead} className="flex flex-col gap-4">
                <div className="rounded-xl px-4 py-3 text-xs text-emerald-300" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  Card scanned — review and edit before saving.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["name", "email", "phone", "company"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">{field}</label>
                      <input value={scanLead[field]} onChange={(e) => setScanLead((p) => ({ ...p, [field]: e.target.value }))}
                        className={inputCls} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Notes (from card)</label>
                  <input value={scanLead.message} onChange={(e) => setScanLead((p) => ({ ...p, message: e.target.value }))}
                    className={inputCls} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Service</label>
                    <select value={scanLead.service} onChange={(e) => setScanLead((p) => ({ ...p, service: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                      <option value="">Select…</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Budget</label>
                    <select value={scanLead.budget} onChange={(e) => setScanLead((p) => ({ ...p, budget: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={inputStyle}>
                      <option value="">Select…</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                {scanError && <p className="text-red-400 text-xs">{scanError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setScanResult(null); setScanPreview(null); setScanFile(null); }} className="flex-1 px-4 py-2 rounded-xl text-sm text-slate-400" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Re-scan</button>
                  <button type="submit" disabled={savingScan} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                    {savingScan ? "Saving…" : "Save as Lead"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
