"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

type CreditNoteStatus = "draft" | "issued" | "applied" | "voided";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface CreditNote {
  id: string;
  credit_note_number: string;
  invoice_id: string | null;
  client_name: string;
  client_email: string;
  reason: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  currency: string;
  status: CreditNoteStatus;
  issued_date: string | null;
  notes: string | null;
  created_at: string;
  created_by: string;
}

const STATUS_META: Record<CreditNoteStatus, { label: string; color: string }> = {
  draft:   { label: "Draft",   color: "#64748b" },
  issued:  { label: "Issued",  color: "#3b82f6" },
  applied: { label: "Applied", color: "#22c55e" },
  voided:  { label: "Voided",  color: "#ef4444" },
};

function formatCurrency(amount: number, currency: string) {
  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency + " ";
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AED"];

function emptyLineItem(): LineItem {
  return { description: "", quantity: 1, unitPrice: 0, amount: 0 };
}

export default function CreditNotesPage() {
  const router = useRouter();
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<CreditNoteStatus | "">("");
  const [updating, setUpdating]       = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const role = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
  const canDelete = role === "super_admin";

  // Modal form state
  const [form, setForm] = useState({
    invoice_id:   "",
    client_name:  "",
    client_email: "",
    reason:       "",
    tax_rate:     0,
    discount:     0,
    currency:     "INR",
    notes:        "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
    fetch("/api/dashboard/credit-notes", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setCreditNotes((d as { creditNotes: CreditNote[] }).creditNotes ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function deleteCreditNote(id: string, number: string) {
    if (!confirm(`Permanently delete credit note ${number}? This cannot be undone.`)) return;
    const secret = getSecret();
    setDeleting(id);
    try {
      await fetch(`/api/dashboard/credit-notes?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${secret}` } });
      setCreditNotes((prev) => prev.filter((cn) => cn.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  }

  async function updateStatus(id: string, status: CreditNoteStatus) {
    const secret = getSecret();
    setUpdating(id);
    try {
      const res = await fetch("/api/dashboard/credit-notes", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const data = await res.json() as { creditNote: CreditNote };
        setCreditNotes((prev) => prev.map((cn) => cn.id === id ? data.creditNote : cn));
      }
    } finally {
      setUpdating(null);
    }
  }

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => {
      const next = prev.map((li, i) => {
        if (i !== idx) return li;
        const updated = { ...li, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      });
      return next;
    });
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  }

  function removeLineItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - form.discount) * (form.tax_rate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - form.discount + taxAmount).toFixed(2));

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const secret = getSecret();
    try {
      const res = await fetch("/api/dashboard/credit-notes", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, line_items: lineItems }),
      });
      const data = await res.json() as { creditNote?: CreditNote; error?: string };
      if (!res.ok) { alert(data.error ?? "Failed to create credit note"); return; }
      if (data.creditNote) setCreditNotes((prev) => [data.creditNote!, ...prev]);
      setShowModal(false);
      setForm({ invoice_id: "", client_name: "", client_email: "", reason: "", tax_rate: 0, discount: 0, currency: "INR", notes: "" });
      setLineItems([emptyLineItem()]);
    } catch {
      alert("Failed to create credit note");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = creditNotes.filter((cn) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [cn.credit_note_number, cn.client_name, cn.client_email].some((v) => v.toLowerCase().includes(q));
    const matchFilter = !filter || cn.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Credit Notes</h1>
            <p className="text-slate-500 text-xs mt-0.5">Manage issued credit notes and refunds</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search credit notes…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-52"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as CreditNoteStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              + New Credit Note
            </button>
          </div>
        </header>

        {/* Summary cards */}
        {!loading && (
          <div className="flex gap-4 px-6 pt-5">
            <SummaryCard label="Total Issued" value={String(creditNotes.filter((cn) => cn.status !== "draft").length)} color="#3b82f6" />
            <SummaryCard label="Applied" value={String(creditNotes.filter((cn) => cn.status === "applied").length)} color="#22c55e" />
            <SummaryCard label="Voided" value={String(creditNotes.filter((cn) => cn.status === "voided").length)} color="#ef4444" />
            <SummaryCard
              label="Total Value"
              value={formatCurrency(creditNotes.filter((cn) => cn.status !== "voided").reduce((s, cn) => s + cn.total, 0), "INR")}
              color="#f59e0b"
            />
          </div>
        )}

        {/* Table */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search || filter ? "No matching credit notes." : "No credit notes yet. Create your first credit note →"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Credit Note #", "Client", "Linked Invoice", "Total", "Status", "Issued Date", "Actions", ...(canDelete ? [""] : [])].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cn) => {
                    const sm = STATUS_META[cn.status];
                    const isExpanded = expandedId === cn.id;
                    return (
                      <>
                        <tr
                          key={cn.id}
                          className="border-b hover:bg-white/[0.02] transition-colors cursor-pointer"
                          style={{ borderColor: "rgba(255,255,255,0.04)" }}
                        >
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-indigo-400 font-mono text-xs">{cn.credit_note_number}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="text-white text-sm font-medium">{cn.client_name}</p>
                            <p className="text-slate-500 text-xs">{cn.client_email}</p>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {cn.invoice_id ? (
                              <span className="text-slate-300 text-xs font-mono">{cn.invoice_id}</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-white font-medium whitespace-nowrap tabular-nums">
                            {formatCurrency(cn.total, cn.currency)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <select
                              value={cn.status}
                              disabled={updating === cn.id || cn.status === "draft"}
                              onChange={(e) => updateStatus(cn.id, e.target.value as CreditNoteStatus)}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer outline-none"
                              style={{ background: `${sm.color}18`, color: sm.color, border: `1px solid ${sm.color}40` }}
                            >
                              <option value="draft">Draft</option>
                              <option value="issued">Issued</option>
                              <option value="applied">Applied</option>
                              <option value="voided">Voided</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                            {cn.issued_date ? new Date(cn.issued_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : cn.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {isExpanded ? "Collapse" : "View"}
                              </button>
                              {cn.status !== "voided" && (
                                <button
                                  onClick={() => updateStatus(cn.id, "voided")}
                                  disabled={updating === cn.id}
                                  className="text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                >
                                  Void
                                </button>
                              )}
                            </div>
                          </td>
                          {canDelete && (
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                onClick={() => deleteCreditNote(cn.id, cn.credit_note_number)}
                                disabled={deleting === cn.id}
                                className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-40 text-xs"
                                title="Delete credit note"
                              >
                                {deleting === cn.id ? "…" : "✕"}
                              </button>
                            </td>
                          )}
                        </tr>
                        {isExpanded && (
                          <tr key={`${cn.id}-expanded`} style={{ borderColor: "rgba(255,255,255,0.04)" }} className="border-b">
                            <td colSpan={canDelete ? 8 : 7} className="px-6 py-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                              <div className="space-y-3">
                                <p className="text-slate-400 text-sm"><span className="text-slate-500">Reason:</span> {cn.reason}</p>
                                {cn.notes && <p className="text-slate-400 text-sm"><span className="text-slate-500">Notes:</span> {cn.notes}</p>}
                                <div>
                                  <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Line Items</p>
                                  <table className="text-xs w-full max-w-lg">
                                    <thead>
                                      <tr>
                                        {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                                          <th key={h} className="text-left py-1 px-2 text-slate-600">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {cn.line_items.map((li, i) => (
                                        <tr key={i}>
                                          <td className="py-1 px-2 text-slate-300">{li.description}</td>
                                          <td className="py-1 px-2 text-slate-400">{li.quantity}</td>
                                          <td className="py-1 px-2 text-slate-400">{formatCurrency(li.unitPrice, cn.currency)}</td>
                                          <td className="py-1 px-2 text-white font-medium">{formatCurrency(li.amount, cn.currency)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex gap-6 text-xs">
                                  <span className="text-slate-500">Subtotal: <span className="text-slate-300">{formatCurrency(cn.subtotal, cn.currency)}</span></span>
                                  {cn.discount > 0 && <span className="text-slate-500">Discount: <span className="text-slate-300">-{formatCurrency(cn.discount, cn.currency)}</span></span>}
                                  {cn.tax_rate > 0 && <span className="text-slate-500">Tax ({cn.tax_rate}%): <span className="text-slate-300">{formatCurrency(cn.tax_amount, cn.currency)}</span></span>}
                                  <span className="text-slate-500 font-medium">Total: <span className="text-white">{formatCurrency(cn.total, cn.currency)}</span></span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Credit Note Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h2 className="text-white font-semibold">New Credit Note</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">×</button>
            </div>

            <form onSubmit={submitCreate} className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Invoice ID */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Invoice ID <span className="text-slate-600">(optional — links this credit note to an invoice)</span></label>
                <input
                  type="text"
                  value={form.invoice_id}
                  onChange={(e) => setForm((f) => ({ ...f, invoice_id: e.target.value }))}
                  placeholder="e.g. abc123-def456"
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Client info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Client Name *</label>
                  <input
                    required
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Client Email *</label>
                  <input
                    required
                    type="email"
                    value={form.client_email}
                    onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Reason *</label>
                <textarea
                  required
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                        {["Description", "Qty", "Unit Price", "Amount", ""].map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li, idx) => (
                        <tr key={idx} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={li.description}
                              onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                              placeholder="Service description"
                              className="w-full bg-transparent text-white placeholder:text-slate-600 outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2 w-16">
                            <input
                              type="number"
                              min="0"
                              value={li.quantity}
                              onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                              className="w-full bg-transparent text-white outline-none text-right"
                            />
                          </td>
                          <td className="py-1.5 px-2 w-28">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={li.unitPrice}
                              onChange={(e) => updateLineItem(idx, "unitPrice", Number(e.target.value))}
                              className="w-full bg-transparent text-white outline-none text-right"
                            />
                          </td>
                          <td className="py-1.5 px-2 w-24 text-right text-slate-300 tabular-nums">
                            {formatCurrency(li.amount, form.currency)}
                          </td>
                          <td className="py-1.5 px-2 w-8">
                            {lineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(idx)}
                                className="text-slate-600 hover:text-red-400 transition-colors"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals preview */}
                <div className="flex justify-end gap-4 mt-2 text-xs text-slate-500">
                  <span>Subtotal: <span className="text-slate-300">{formatCurrency(subtotal, form.currency)}</span></span>
                  {form.discount > 0 && <span>Discount: <span className="text-slate-300">-{formatCurrency(form.discount, form.currency)}</span></span>}
                  {form.tax_rate > 0 && <span>Tax: <span className="text-slate-300">{formatCurrency(taxAmount, form.currency)}</span></span>}
                  <span className="font-medium text-white">Total: {formatCurrency(total, form.currency)}</span>
                </div>
              </div>

              {/* Tax, Discount, Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.tax_rate}
                    onChange={(e) => setForm((f) => ({ ...f, tax_rate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Discount (amount)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Notes <span className="text-slate-600">(optional)</span></label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-opacity"
                  style={{ background: "rgba(99,102,241,0.8)" }}
                >
                  {submitting ? "Creating…" : "Create Credit Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 flex-1" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}
