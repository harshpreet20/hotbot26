"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Invoice, InvoiceLineItem, InvoiceStatus, CRMTask } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

function newLineItem(): InvoiceLineItem {
  return { id: `li-${Date.now()}`, description: "", quantity: 1, unitPrice: 0, amount: 0 };
}

const STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "#64748b" },
  sent:      { label: "Sent",      color: "#3b82f6" },
  viewed:    { label: "Viewed",    color: "#8b5cf6" },
  paid:      { label: "Paid",      color: "#22c55e" },
  overdue:   { label: "Overdue",   color: "#ef4444" },
  cancelled: { label: "Cancelled", color: "#475569" },
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [invoice, setInvoice]   = useState<Invoice | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState("");
  const [tasks,   setTasks]     = useState<CRMTask[]>([]);
  const [newTask, setNewTask]   = useState("");
  const [sending,      setSending]      = useState(false);
  const [sendSuccess,  setSendSuccess]  = useState("");
  const [sendError,    setSendError]    = useState("");
  const [sendEmail,    setSendEmail]    = useState("");

  // Editable fields
  const [lineItems,     setLineItems]     = useState<InvoiceLineItem[]>([]);
  const [clientName,    setClientName]    = useState("");
  const [clientEmail,   setClientEmail]   = useState("");
  const [clientPhone,   setClientPhone]   = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [dueDate,       setDueDate]       = useState("");
  const [taxRate,       setTaxRate]       = useState(18);
  const [discount,      setDiscount]      = useState(0);
  const [notes,         setNotes]         = useState("");
  const [terms,         setTerms]         = useState("");
  const [status,        setStatus]        = useState<InvoiceStatus>("draft");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }

    Promise.all([
      fetch(`/api/dashboard/invoices?id=${id}`, { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.json() as Promise<{ invoices: Invoice[] }>),
      fetch(`/api/dashboard/tasks?invoiceId=${id}`, { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.json() as Promise<{ tasks: CRMTask[] }>),
    ])
      .then(([invData, taskData]) => {
        const inv = invData.invoices.find((i) => i.id === id);
        if (!inv) { router.replace("/enter/backdrop/dashboard/invoices"); return; }
        setInvoice(inv);
        setLineItems(inv.lineItems);
        setClientName(inv.clientName);
        setClientEmail(inv.clientEmail);
        setClientPhone(inv.clientPhone ?? "");
        setClientCompany(inv.clientCompany ?? "");
        setClientAddress(inv.clientAddress ?? "");
        setDueDate(inv.dueDate);
        setTaxRate(inv.taxRate);
        setDiscount(inv.discount);
        setNotes(inv.notes ?? "");
        setTerms(inv.terms ?? "");
        setStatus(inv.status);
        setSendEmail(inv.clientEmail ?? "");
        setTasks(taskData.tasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

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

  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - discount + taxAmount).toFixed(2));
  const sym = invoice ? (invoice.currency === "INR" ? "₹" : invoice.currency === "USD" ? "$" : invoice.currency === "GBP" ? "£" : invoice.currency + " ") : "₹";

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/dashboard/invoices", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, clientName, clientEmail, clientPhone, clientCompany, clientAddress, dueDate, taxRate, discount, notes, terms, lineItems, status }),
      });
      if (!res.ok) { setError("Save failed."); return; }
      const data = await res.json() as { invoice: Invoice };
      setInvoice(data.invoice);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendEmail() {
    setSending(true); setSendError(""); setSendSuccess("");
    try {
      const res = await fetch("/api/dashboard/invoices/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, recipientEmail: sendEmail }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; sentTo?: string; newStatus?: InvoiceStatus };
      if (!res.ok) { setSendError(data.error ?? "Failed to send invoice."); return; }
      setSendSuccess(`Invoice sent to ${data.sentTo}`);
      if (data.newStatus && data.newStatus !== status) {
        setStatus(data.newStatus);
        setInvoice((prev) => prev ? { ...prev, status: data.newStatus! } : prev);
      }
    } finally {
      setSending(false);
    }
  }

  async function addTask() {
    if (!newTask.trim()) return;
    const res = await fetch("/api/dashboard/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim(), invoiceId: id, priority: "medium" }),
    });
    if (res.ok) {
      const data = await res.json() as { task: CRMTask };
      setTasks((p) => [data.task, ...p]);
      setNewTask("");
    }
  }

  async function toggleTask(taskId: string, done: boolean) {
    const res = await fetch("/api/dashboard/tasks", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: done ? "done" : "open" }),
    });
    if (res.ok) {
      const data = await res.json() as { task: CRMTask };
      setTasks((p) => p.map((t) => t.id === taskId ? data.task : t));
    }
  }

  if (loading) return <DashboardShell><div className="p-6 text-slate-500">Loading…</div></DashboardShell>;
  if (!invoice) return null;

  const sm = STATUS_META[status];

  return (
    <DashboardShell>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-white text-xl font-semibold font-mono">{invoice.invoiceNumber}</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${sm.color}18`, color: sm.color }}>
                {sm.label}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">Created by {invoice.createdBy} · {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/enter/backdrop/dashboard/invoices" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back</Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Status */}
          <Section title="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="input-field w-auto"
            >
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Section>

          {/* Client */}
          <Section title="Client Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client Name"><input value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-field" /></Field>
              <Field label="Email"><input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input-field" /></Field>
              <Field label="Phone"><input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input-field" /></Field>
              <Field label="Company"><input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className="input-field" /></Field>
              <Field label="Address" className="col-span-2"><input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="input-field" /></Field>
            </div>
          </Section>

          {/* Dates */}
          <Section title="Dates">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Issue Date"><input type="date" value={invoice.issuedDate} disabled className="input-field opacity-50" /></Field>
              <Field label="Due Date"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" /></Field>
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
                  <input value={li.description} onChange={(e) => updateLine(idx, "description", e.target.value)} className="input-field col-span-5 text-sm" />
                  <input type="number" value={li.quantity} onChange={(e) => updateLine(idx, "quantity", parseFloat(e.target.value) || 0)} min="0" className="input-field col-span-2 text-sm text-right" />
                  <input type="number" value={li.unitPrice} onChange={(e) => updateLine(idx, "unitPrice", parseFloat(e.target.value) || 0)} min="0" className="input-field col-span-2 text-sm text-right" />
                  <span className="col-span-2 text-right text-white text-sm tabular-nums">{sym}{li.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  <button onClick={() => setLineItems((p) => p.filter((_, i) => i !== idx))} disabled={lineItems.length === 1} className="col-span-1 text-slate-600 hover:text-red-400 transition-colors text-xs disabled:opacity-30">✕</button>
                </div>
              ))}
              <button onClick={() => setLineItems((p) => [...p, newLineItem()])} className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors">+ Add line item</button>
            </div>
            <div className="mt-5 border-t pt-4 space-y-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span className="tabular-nums">{sym}{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-2"><span>Discount</span><input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} min="0" className="w-20 px-2 py-0.5 rounded-lg text-white text-xs outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} /></div>
                <span className="tabular-nums">- {sym}{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-2"><span>Tax (%)</span><input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} min="0" max="100" className="w-16 px-2 py-0.5 rounded-lg text-white text-xs outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} /></div>
                <span className="tabular-nums">{sym}{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}><span>Total</span><span className="tabular-nums">{sym}{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes & Terms">
            <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input-field resize-none" /></Field>
            <Field label="Terms"><textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} className="input-field resize-none" /></Field>
          </Section>

          {/* Share Invoice */}
          <Section title="Share Invoice">
            <p className="text-slate-500 text-xs -mt-2 mb-3">
              Share a public view link of this invoice — clients can view, print, or save as PDF.
            </p>
            <ShareInvoicePanel invoiceId={id} invoiceNumber={invoice.invoiceNumber} />
          </Section>

          {/* Send via Email */}
          <Section title="Send Invoice via Email">
            <p className="text-slate-500 text-xs -mt-2 mb-3">
              Sends a professionally formatted HTML invoice to the client using HotBot Studios&apos; Google Workspace mail server.
              The status will automatically update to &apos;Sent&apos; if the invoice is currently a draft.
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1.5">Recipient Email</label>
                <input
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="input-field"
                />
              </div>
              <button
                onClick={handleSendEmail}
                disabled={sending || !sendEmail}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 whitespace-nowrap"
                style={{ background: "rgba(34,197,94,0.75)", minWidth: 130 }}
              >
                {sending ? "Sending…" : "✉ Send Invoice"}
              </button>
            </div>
            {sendSuccess && (
              <div className="mt-3 px-4 py-2.5 rounded-xl text-sm text-emerald-400" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                {sendSuccess}
              </div>
            )}
            {sendError && (
              <div className="mt-3 px-4 py-2.5 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {sendError}
              </div>
            )}
          </Section>

          {/* Linked tasks */}
          <Section title="Linked Tasks">
            <div className="flex gap-2 mb-3">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                placeholder="Add a task for this invoice…"
                className="input-field flex-1 text-sm"
              />
              <button onClick={addTask} className="px-3 py-1.5 rounded-xl text-sm text-white" style={{ background: "rgba(99,102,241,0.6)" }}>Add</button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-slate-600 text-xs">No tasks yet.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === "done"}
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className={`text-sm flex-1 ${task.status === "done" ? "line-through text-slate-600" : "text-slate-300"}`}>{task.title}</span>
                    {task.dueDate && <span className="text-xs text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>
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
        .input-field:focus { border-color: rgba(99,102,241,0.5); }
        .input-field option { background: #1e293b; }
      `}</style>
    </DashboardShell>
  );
}

function ShareInvoicePanel({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/invoice/${invoiceId}` : `/invoice/${invoiceId}`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareWhatsApp() {
    const text = `Invoice ${invoiceNumber} from Hotbot Studios LLP\nView here: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareEmail() {
    const subject = encodeURIComponent(`Invoice ${invoiceNumber} from Hotbot Studios LLP`);
    const body = encodeURIComponent(`Hi,\n\nPlease find your invoice ${invoiceNumber} from Hotbot Studios LLP.\n\nView it online: ${publicUrl}\n\nThank you,\nHotbot Studios LLP`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input
          readOnly
          value={publicUrl}
          className="input-field flex-1 text-xs font-mono"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={copyLink}
          className="px-3 py-2 rounded-xl text-xs font-medium text-white whitespace-nowrap transition-all"
          style={{ background: copied ? "rgba(34,197,94,0.7)" : "rgba(99,102,241,0.6)", minWidth: 90 }}
        >
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={shareWhatsApp}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all"
          style={{ background: "rgba(37,211,102,0.2)", color: "#25d366", border: "1px solid rgba(37,211,102,0.3)" }}
        >
          💬 Share via WhatsApp
        </button>
        <button
          onClick={shareEmail}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}
        >
          ✉ Share via Email
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}
        >
          ↗ Preview
        </a>
      </div>
    </div>
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
