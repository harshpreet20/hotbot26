"use client";
import { useEffect, useState, useRef } from "react";
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

interface ScannedCard {
  name: string; email: string; phone: string; company: string; title: string; website: string;
}

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

  // Scan Card modal
  const [showScan,    setShowScan]    = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanFile,    setScanFile]    = useState<File | null>(null);
  const [scanning,    setScanning]    = useState(false);
  const [scanResult,  setScanResult]  = useState<ScannedCard | null>(null);
  const [scanError,   setScanError]   = useState("");
  const [savingScan,  setSavingScan]  = useState(false);
  const [scanLead, setScanLead]       = useState({ name: "", email: "", phone: "", company: "", message: "", service: "", budget: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleCardFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanFile(file);
    setScanPreview(URL.createObjectURL(file));
    setScanResult(null);
    setScanError("");
  }

  async function scanCard() {
    if (!scanFile) return;
    setScanning(true);
    setScanError("");
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] ?? result);
        };
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
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
        company: data.contact.company,
        message: data.contact.title ? `Title: ${data.contact.title}${data.contact.website ? ` | Website: ${data.contact.website}` : ""}` : "",
        service: "",
        budget: "",
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
              onClick={() => { setShowScan(true); setScanPreview(null); setScanFile(null); setScanResult(null); setScanError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 shrink-0"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              📷 Scan Card
            </button>
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

            {/* Camera / file input */}
            {!scanResult && (
              <div className="flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCardFileChange} className="hidden" />
                {!scanPreview ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-10 rounded-2xl flex flex-col items-center gap-3 transition-colors hover:bg-white/[0.04]"
                    style={{ border: "2px dashed rgba(255,255,255,0.12)" }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span className="text-slate-400 text-sm">Take Photo or Upload Image</span>
                    <span className="text-slate-600 text-xs">Camera opens automatically on mobile</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <img src={scanPreview} alt="Card preview" className="w-full rounded-2xl object-contain max-h-48" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-400 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                        Change Image
                      </button>
                      <button onClick={scanCard} disabled={scanning} className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50 transition-opacity" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                        {scanning ? "Scanning…" : "✨ Scan Card"}
                      </button>
                    </div>
                  </div>
                )}
                {scanError && <p className="text-red-400 text-xs">{scanError}</p>}
              </div>
            )}

            {/* Scanned result form */}
            {scanResult && (
              <form onSubmit={saveScannedLead} className="flex flex-col gap-4">
                <div className="rounded-xl px-4 py-3 text-xs text-emerald-300" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  Card scanned successfully — review and edit before saving.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["name", "email", "phone", "company"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">{field}</label>
                      <input
                        value={scanLead[field]}
                        onChange={(e) => setScanLead((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Notes (from card)</label>
                  <input
                    value={scanLead.message}
                    onChange={(e) => setScanLead((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Service</label>
                    <select value={scanLead.service} onChange={(e) => setScanLead((p) => ({ ...p, service: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="">Select…</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Budget</label>
                    <select value={scanLead.budget} onChange={(e) => setScanLead((p) => ({ ...p, budget: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="">Select…</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                {scanError && <p className="text-red-400 text-xs">{scanError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setScanResult(null); setScanPreview(null); setScanFile(null); }} className="flex-1 px-4 py-2 rounded-xl text-sm text-slate-400 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    Re-scan
                  </button>
                  <button type="submit" disabled={savingScan} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                    {savingScan ? "Saving…" : "Save as Lead"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
