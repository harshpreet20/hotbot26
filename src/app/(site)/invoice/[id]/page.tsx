"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import type { Invoice } from "@/types/dashboard";

function currencySymbol(currency: string) {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  if (currency === "EUR") return "€";
  return currency + " ";
}

function fmtAmount(amount: number, currency: string) {
  return `${currencySymbol(currency)}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Draft",     color: "#64748b", bg: "#f1f5f9" },
  sent:      { label: "Sent",      color: "#3b82f6", bg: "#eff6ff" },
  viewed:    { label: "Viewed",    color: "#8b5cf6", bg: "#f5f3ff" },
  paid:      { label: "Paid",      color: "#16a34a", bg: "#f0fdf4" },
  overdue:   { label: "Overdue",   color: "#dc2626", bg: "#fef2f2" },
  cancelled: { label: "Cancelled", color: "#475569", bg: "#f8fafc" },
};

export default function PublicInvoicePage() {
  const { id } = useParams() as { id: string };
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/invoice/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json() as Promise<{ invoice: Invoice }>;
      })
      .then((d) => { if (d) setInvoice(d.invoice); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function handlePrint() {
    window.print();
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleWhatsApp() {
    const text = invoice
      ? `Invoice ${invoice.invoiceNumber} from Hotbot Studios LLP — ${fmtAmount(invoice.total, invoice.currency)} due ${fmtDate(invoice.dueDate)}\n${window.location.href}`
      : window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleEmailShare() {
    if (!invoice) return;
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from Hotbot Studios LLP`);
    const body = encodeURIComponent(
      `Hi,\n\nPlease find your invoice ${invoice.invoiceNumber} for ${fmtAmount(invoice.total, invoice.currency)} attached below.\n\nView it online: ${window.location.href}\n\nDue Date: ${fmtDate(invoice.dueDate)}\n\nThank you,\nHotbot Studios LLP`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9", fontFamily: "'Inter', Arial, sans-serif" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Loading invoice…</p>
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f4f6f9", fontFamily: "'Inter', Arial, sans-serif" }}>
        <p style={{ fontSize: 48, margin: 0 }}>🔍</p>
        <h1 style={{ fontSize: 22, color: "#1a1a1a", marginTop: 16 }}>Invoice Not Found</h1>
        <p style={{ color: "#888", fontSize: 14 }}>This invoice link may be invalid or expired.</p>
      </div>
    );
  }

  const sym = currencySymbol(invoice.currency);
  const sm = STATUS_META[invoice.status] ?? STATUS_META.draft;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4f6f9; font-family: 'Inter', Arial, sans-serif; color: #1a1a1a; }
        .no-print { }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .invoice-container { margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Share toolbar */}
      <div className="no-print" style={{ background: "#1e1b4b", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#a5b4fc", fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{invoice.invoiceNumber}</span>
          <span style={{ color: "#a5b4fc", fontSize: 12 }}>·</span>
          <span style={{ color: "#818cf8", fontSize: 12 }}>Hotbot Studios LLP</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ShareBtn onClick={handleCopyLink} color="#6366f1">
            {copied ? "✓ Copied!" : "🔗 Copy Link"}
          </ShareBtn>
          <ShareBtn onClick={handleWhatsApp} color="#25d366">
            💬 WhatsApp
          </ShareBtn>
          <ShareBtn onClick={handleEmailShare} color="#3b82f6">
            ✉ Email
          </ShareBtn>
          <ShareBtn onClick={handlePrint} color="#475569">
            🖨 Print / PDF
          </ShareBtn>
        </div>
      </div>

      <div style={{ padding: "40px 16px", minHeight: "100vh" }}>
        <div
          ref={printRef}
          className="invoice-container"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "#fff",
            padding: 40,
            borderRadius: 10,
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image src="/hotbot-logo.png" alt="Hotbot Studios" width={60} height={60} style={{ objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <h1 style={{ margin: 0, color: "#ff7a00", fontSize: 28, fontWeight: 700 }}>INVOICE</h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555", fontWeight: 500 }}>#{invoice.invoiceNumber}</p>
              <span style={{ display: "inline-block", marginTop: 6, padding: "3px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, color: sm.color, background: sm.bg }}>
                {sm.label}
              </span>
            </div>
          </div>

          {/* From / Bill To */}
          <div style={{ marginTop: 25, display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: 1 }}>From</p>
              <p style={{ margin: "3px 0", fontSize: 14, fontWeight: 700 }}>HOTBOT STUDIOS LLP</p>
              <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>2nd Floor, M-430 Guruharkishan Nagar</p>
              <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>Paschim Vihar, New Delhi - 110087</p>
              <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>Phone: +91 9700001534</p>
              <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>PAN: AALFH2180F</p>
              <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>Contact: Harshpreet Singh Bhasin</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: 1 }}>Bill To</p>
              <p style={{ margin: "3px 0", fontSize: 14, fontWeight: 700 }}>{invoice.clientName}</p>
              {invoice.clientCompany && <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>{invoice.clientCompany}</p>}
              <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>{invoice.clientEmail}</p>
              {invoice.clientPhone && <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>{invoice.clientPhone}</p>}
              {invoice.clientAddress && <p style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>{invoice.clientAddress}</p>}
            </div>
          </div>

          {/* Dates */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ margin: "3px 0", fontSize: 13 }}><strong>Invoice Date:</strong> {fmtDate(invoice.issuedDate)}</p>
              <p style={{ margin: "3px 0", fontSize: 13 }}><strong>Due Date:</strong> <span style={{ color: invoice.status === "overdue" ? "#dc2626" : "inherit" }}>{fmtDate(invoice.dueDate)}</span></p>
            </div>
            <div style={{ textAlign: "right" }}>
              {invoice.terms && <p style={{ margin: "3px 0", fontSize: 13 }}><strong>Payment Terms:</strong> {invoice.terms}</p>}
              <p style={{ margin: "3px 0", fontSize: 13 }}><strong>Status:</strong> <span style={{ color: sm.color, fontWeight: 600 }}>{sm.label}</span></p>
            </div>
          </div>

          {/* Line items table */}
          <table style={{ width: "100%", marginTop: 30, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Description", "Qty", "Rate", "Amount"].map((h) => (
                  <th key={h} style={{ background: "#f1f3f7", padding: "12px", fontSize: 12, textTransform: "uppercase", textAlign: h === "Description" ? "left" : "right", color: "#555", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li) => (
                <tr key={li.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee", fontSize: 14 }}>{li.description}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee", fontSize: 14, textAlign: "right" }}>{li.quantity}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee", fontSize: 14, textAlign: "right" }}>{fmtAmount(li.unitPrice, invoice.currency)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #eee", fontSize: 14, textAlign: "right", fontWeight: 600 }}>{fmtAmount(li.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <table style={{ width: 320 }}>
              <tbody>
                <tr>
                  <td style={{ padding: "7px 8px", fontSize: 14, color: "#555" }}>Subtotal</td>
                  <td style={{ padding: "7px 8px", fontSize: 14, textAlign: "right" }}>{fmtAmount(invoice.subtotal, invoice.currency)}</td>
                </tr>
                {invoice.discount > 0 && (
                  <tr>
                    <td style={{ padding: "7px 8px", fontSize: 14, color: "#555" }}>Discount</td>
                    <td style={{ padding: "7px 8px", fontSize: 14, textAlign: "right", color: "#dc2626" }}>- {fmtAmount(invoice.discount, invoice.currency)}</td>
                  </tr>
                )}
                {invoice.taxRate > 0 && (
                  <tr>
                    <td style={{ padding: "7px 8px", fontSize: 14, color: "#555" }}>Tax ({invoice.taxRate}%)</td>
                    <td style={{ padding: "7px 8px", fontSize: 14, textAlign: "right" }}>{fmtAmount(invoice.taxAmount, invoice.currency)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: "2px solid #eee" }}>
                  <td style={{ padding: "10px 8px", fontSize: 16, fontWeight: 700 }}>Net Payable</td>
                  <td style={{ padding: "10px 8px", fontSize: 16, fontWeight: 700, textAlign: "right", color: "#ff7a00" }}>{fmtAmount(invoice.total, invoice.currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment details */}
          <div style={{ marginTop: 40, background: "#fafafa", padding: 20, borderRadius: 8 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Payment Details</h3>
            <p style={{ margin: "5px 0", fontSize: 13 }}><strong>Bank:</strong> HDFC Bank</p>
            <p style={{ margin: "5px 0", fontSize: 13 }}><strong>Account Name:</strong> HOTBOT STUDIOS LLP</p>
            <p style={{ margin: "5px 0", fontSize: 13 }}><strong>Account Number:</strong> 50200031274601</p>
            <p style={{ margin: "5px 0", fontSize: 13 }}><strong>IFSC:</strong> HDFC0000581</p>
            <p style={{ margin: "5px 0", fontSize: 13 }}><strong>UPI:</strong> hotbotstudios@axl</p>
            <p style={{ margin: "5px 0", fontSize: 13 }}><strong>Branch:</strong> Meera Bagh, Outer Ring Road, New Delhi - 110087</p>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ marginTop: 20, background: "#fafafa", padding: 20, borderRadius: 8 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Notes</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{invoice.notes}</p>
            </div>
          )}

          {/* Standard notes */}
          <div style={{ marginTop: 20, background: "#fafafa", padding: 20, borderRadius: 8 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Important</h3>
            <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>• GST not included in this invoice.</p>
            <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>• TDS, if applicable, must be supported with valid TDS certificate.</p>
            <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>• Kindly process payment within the due date.</p>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#999" }}>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Hotbot Studios LLP — AI | Software | Marketing Solutions</p>
          </div>
        </div>
      </div>
    </>
  );
}

function ShareBtn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: 8,
        border: "none",
        background: `${color}22`,
        color: color,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Inter', Arial, sans-serif",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}44`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${color}22`)}
    >
      {children}
    </button>
  );
}
