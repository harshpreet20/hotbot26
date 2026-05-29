"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { InvoiceLineItem } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

function newLineItem(): InvoiceLineItem {
  return { id: `li-${Date.now()}`, description: "", quantity: 1, unitPrice: 0, amount: 0 };
}

const DRAFT_KEY = "backdrop_invoice_draft";

interface DraftState {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  clientAddress: string;
  currency: string;
  issuedDate: string;
  dueDate: string;
  taxRate: number;
  discount: number;
  notes: string;
  terms: string;
  lineItems: InvoiceLineItem[];
}

function loadDraft(): Partial<DraftState> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
    return raw ? (JSON.parse(raw) as DraftState) : {};
  } catch { return {}; }
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  const d = loadDraft();
  const [clientName,    setClientName]    = useState(d.clientName    ?? "");
  const [clientEmail,   setClientEmail]   = useState(d.clientEmail   ?? "");
  const [clientPhone,   setClientPhone]   = useState(d.clientPhone   ?? "");
  const [clientCompany, setClientCompany] = useState(d.clientCompany ?? "");
  const [clientAddress, setClientAddress] = useState(d.clientAddress ?? "");
  const [currency,      setCurrency]      = useState(d.currency      ?? "INR");
  const [issuedDate,    setIssuedDate]    = useState(d.issuedDate    ?? new Date().toISOString().split("T")[0]);
  const [dueDate,       setDueDate]       = useState(d.dueDate       ?? "");
  const [taxRate,       setTaxRate]       = useState(d.taxRate       ?? 18);
  const [discount,      setDiscount]      = useState(d.discount      ?? 0);
  const [notes,         setNotes]         = useState(d.notes         ?? "");
  const [terms,         setTerms]         = useState(d.terms         ?? "Payment due within the specified due date.");
  const [lineItems,     setLineItems]     = useState<InvoiceLineItem[]>(d.lineItems ?? [newLineItem()]);

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    const draft: DraftState = { clientName, clientEmail, clientPhone, clientCompany, clientAddress, currency, issuedDate, dueDate, taxRate, discount, notes, terms, lineItems };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [clientName, clientEmail, clientPhone, clientCompany, clientAddress, currency, issuedDate, dueDate, taxRate, discount, notes, terms, lineItems]);

  function updateLine(idx: number, field: keyof InvoiceLineItem, value: string | number) {
    setLineItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value } as InvoiceLineItem;
      if (field === "quantity" || field === "unitPrice") {
        item.amount = Number(item.quantity) * Number(item.unitPrice);
      }
      next[idx] = item;
      return next;
    });
  }

  function removeLine(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - discount + taxAmount).toFixed(2));

  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency + " ";

  async function handleSubmit(status: "draft" | "sent") {
    if (!clientName || !clientEmail) { setError("Client name and email are required."); return; }
    if (lineItems.length === 0)      { setError("Add at least one line item."); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/invoices", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientEmail, clientPhone, clientCompany, clientAddress, currency, issuedDate, dueDate, taxRate, discount, notes, terms, lineItems, status }),
      });
      if (!res.ok) { setError("Failed to create invoice."); return; }
      // Clear draft after successful submit
      localStorage.removeItem(DRAFT_KEY);
      router.push("/enter/backdrop/dashboard/invoices");
    } finally {
      setSaving(false);
    }
  }

  function showDraftSaved() {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }

  return (
    <DashboardShell>
      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-white text-xl font-semibold">New Invoice</h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the details below to create an invoice.</p>
          </div>
          <div className="flex items-center gap-3">
            {draftSaved && <span className="text-xs text-emerald-400">Draft saved</span>}
            <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back</button>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Client info */}
          <Section title="Client Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client Name *">
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Smith" className="input-field" />
              </Field>
              <Field label="Client Email *">
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="john@example.com" className="input-field" />
              </Field>
              <Field label="Phone">
                <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98765 43210" className="input-field" />
              </Field>
              <Field label="Company">
                <input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Acme Corp" className="input-field" />
              </Field>
              <Field label="Address" className="col-span-2">
                <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="123 Main St, Mumbai, MH 400001" className="input-field" />
              </Field>
            </div>
          </Section>

          {/* Invoice details */}
          <Section title="Invoice Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Currency">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </Field>
              <Field label="Issue Date">
                <input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="input-field" />
              </Field>
              <Field label="Due Date">
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
              </Field>
            </div>
          </Section>

          {/* Line items */}
          <Section title="Line Items">
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 uppercase tracking-wider px-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Unit Price</span>
                <span className="col-span-2 text-right">Amount</span>
                <span className="col-span-1" />
              </div>
              {lineItems.map((li, idx) => (
                <div key={li.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={li.description}
                    onChange={(e) => updateLine(idx, "description", e.target.value)}
                    placeholder="Service description"
                    className="input-field col-span-5 text-sm"
                  />
                  <input
                    type="number"
                    value={li.quantity}
                    onChange={(e) => updateLine(idx, "quantity", parseFloat(e.target.value) || 0)}
                    min="0"
                    className="input-field col-span-2 text-sm text-right"
                  />
                  <input
                    type="number"
                    value={li.unitPrice}
                    onChange={(e) => updateLine(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                    className="input-field col-span-2 text-sm text-right"
                  />
                  <span className="col-span-2 text-right text-white text-sm tabular-nums">
                    {sym}{li.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => removeLine(idx)}
                    disabled={lineItems.length === 1}
                    className="col-span-1 text-slate-600 hover:text-red-400 transition-colors text-xs disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setLineItems((p) => [...p, newLineItem()])}
                className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
              >
                + Add line item
              </button>
            </div>

            {/* Totals */}
            <div className="mt-5 border-t pt-4 space-y-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="tabular-nums">{sym}{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    className="w-20 px-2 py-0.5 rounded-lg text-white text-xs outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <span className="tabular-nums">- {sym}{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Tax (%)</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="w-16 px-2 py-0.5 rounded-lg text-white text-xs outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <span className="tabular-nums">{sym}{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <span>Total</span>
                <span className="tabular-nums">{sym}{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Section>

          {/* Notes & Terms */}
          <Section title="Notes & Terms">
            <Field label="Notes (visible to client)">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Thank you for your business!" className="input-field resize-none" />
            </Field>
            <Field label="Payment Terms">
              <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} className="input-field resize-none" />
            </Field>
          </Section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={showDraftSaved}
              className="px-4 py-2.5 rounded-xl text-sm text-slate-400 transition-all hover:text-slate-200"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Save Draft Locally
            </button>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit("sent")}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              {saving ? "Saving…" : "Create & Mark Sent"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
        }
        .input-field:focus {
          border-color: rgba(99,102,241,0.5);
        }
        .input-field option {
          background: #1e293b;
        }
      `}</style>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <h2 className="text-white text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
