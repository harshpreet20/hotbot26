"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  if (!dateStr) return "-";
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

// ── Razorpay global type ──────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

// ── Razorpay fee calculation ──────────────────────────────────────────────────
// Standard rate: 2% base + 18% GST on the base = 2.36% effective
const RAZORPAY_BASE_RATE = 0.02;     // 2%
const RAZORPAY_GST_RATE  = 0.18;     // 18% GST on the fee

function calcRazorpayFee(invoiceAmount: number) {
  const baseFee  = Math.ceil(invoiceAmount * RAZORPAY_BASE_RATE * 100) / 100;
  const gst      = Math.ceil(baseFee * RAZORPAY_GST_RATE * 100) / 100;
  const totalFee = Math.ceil((baseFee + gst) * 100) / 100;
  return { baseFee, gst, totalFee, total: Math.ceil((invoiceAmount + totalFee) * 100) / 100 };
}

// ── PaymentSection ────────────────────────────────────────────────────────────

interface PaymentSectionProps {
  invoice: Invoice;
  onPaid: () => void;
}

function PaymentSection({ invoice, onPaid }: PaymentSectionProps) {
  const [paymentState, setPaymentState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeGateway, setActiveGateway] = useState<"razorpay" | "paypal" | null>(null);
  const fee = calcRazorpayFee(invoice.total);

  const handleRazorpay = useCallback(async () => {
    setPaymentState("loading");
    setActiveGateway("razorpay");
    setErrorMsg("");
    try {
      // 1. Create Razorpay order (amount includes gateway fee)
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.id,
          invoice_amount: invoice.total,
          gateway_fee: fee.totalFee,
          amount: fee.total,
          currency: invoice.currency,
          customer_email: invoice.clientEmail,
          customer_name: invoice.clientName,
        }),
      });

      const data = await res.json() as {
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        customerEmail?: string;
        customerName?: string;
        error?: string;
      };

      if (!res.ok || !data.orderId) {
        throw new Error(data.error ?? "Failed to create order");
      }

      // 2. Load Razorpay checkout.js dynamically
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay checkout failed to load");
      }

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: data.keyId!,
        amount: Math.round((data.amount ?? invoice.total) * 100),
        currency: data.currency ?? invoice.currency,
        name: "Hotbot Studios LLP",
        description: `Invoice ${invoice.invoiceNumber}`,
        order_id: data.orderId,
        prefill: {
          name: data.customerName ?? invoice.clientName,
          email: data.customerEmail ?? invoice.clientEmail,
        },
        theme: { color: "#ff7a00" },
        handler: async (response: RazorpayResponse) => {
          // 4. Verify payment
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoice_id: invoice.id,
              }),
            });
            const verifyData = await verifyRes.json() as { success?: boolean; error?: string };
            if (verifyData.success) {
              setPaymentState("success");
              onPaid();
            } else {
              throw new Error(verifyData.error ?? "Verification failed");
            }
          } catch (verifyErr) {
            setErrorMsg(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed");
            setPaymentState("error");
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentState === "loading") {
              setPaymentState("idle");
              setActiveGateway(null);
            }
          },
        },
      });
      rzp.open();
      setPaymentState("idle"); // reset while modal is open; handler will set success
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Payment failed");
      setPaymentState("error");
    }
  }, [invoice, onPaid, paymentState]);

  const handlePayPal = useCallback(async () => {
    setPaymentState("loading");
    setActiveGateway("paypal");
    setErrorMsg("");
    try {
      const res = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: invoice.total,
          currency: invoice.currency,
          customer_email: invoice.clientEmail,
        }),
      });

      const data = await res.json() as { approvalUrl?: string; orderId?: string; error?: string };
      if (!res.ok || !data.approvalUrl) {
        throw new Error(data.error ?? "Failed to create PayPal order");
      }

      // Redirect to PayPal approval page
      window.location.href = data.approvalUrl;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "PayPal setup failed");
      setPaymentState("error");
    }
  }, [invoice]);

  return (
    <div
      className="no-print"
      style={{
        marginTop: 32,
        padding: "28px 24px",
        borderRadius: 12,
        background: "linear-gradient(135deg, #f0f7ff 0%, #fef9f0 100%)",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
        Pay Online
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
        Secure payment via Razorpay (UPI / Cards / Netbanking) or PayPal
      </p>

      {/* Fee breakdown table */}
      <div style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 20,
        fontSize: 13,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#475569" }}>
          <span>Invoice Amount</span>
          <span>{fmtAmount(invoice.total, invoice.currency)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#475569" }}>
          <span>
            Razorpay Gateway Fee{" "}
            <span style={{ fontSize: 11, color: "#94a3b8" }}>(2% + 18% GST)</span>
          </span>
          <span>+ {fmtAmount(fee.totalFee, invoice.currency)}</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4,
          fontWeight: 700, fontSize: 15, color: "#1a1a1a",
        }}>
          <span>Total Payable</span>
          <span>{fmtAmount(fee.total, invoice.currency)}</span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8" }}>
          Gateway fee is charged by Razorpay and passed to the payment processor.
          PayPal payment uses the original invoice amount only.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {/* Razorpay button */}
        <button
          onClick={handleRazorpay}
          disabled={paymentState === "loading" && activeGateway === "razorpay"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: activeGateway === "razorpay" && paymentState === "loading"
              ? "#e5712a"
              : "#ff6914",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: paymentState === "loading" && activeGateway === "razorpay" ? "not-allowed" : "pointer",
            fontFamily: "'Inter', Arial, sans-serif",
            boxShadow: "0 2px 8px rgba(255,105,20,0.35)",
            transition: "all 0.15s",
            opacity: paymentState === "loading" && activeGateway === "razorpay" ? 0.75 : 1,
          }}
        >
          <span style={{ fontSize: 18 }}>🟠</span>
          {paymentState === "loading" && activeGateway === "razorpay"
            ? "Processing…"
            : `Pay ${fmtAmount(fee.total, invoice.currency)} via Razorpay`}
        </button>

        {/* PayPal button */}
        <button
          onClick={handlePayPal}
          disabled={paymentState === "loading" && activeGateway === "paypal"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: activeGateway === "paypal" && paymentState === "loading"
              ? "#0056a3"
              : "#0070e0",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: paymentState === "loading" && activeGateway === "paypal" ? "not-allowed" : "pointer",
            fontFamily: "'Inter', Arial, sans-serif",
            boxShadow: "0 2px 8px rgba(0,112,224,0.35)",
            transition: "all 0.15s",
            opacity: paymentState === "loading" && activeGateway === "paypal" ? 0.75 : 1,
          }}
        >
          <span style={{ fontSize: 18 }}>🔵</span>
          {paymentState === "loading" && activeGateway === "paypal"
            ? "Redirecting…"
            : "Pay with PayPal"}
        </button>
      </div>

      {paymentState === "error" && errorMsg && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: 13,
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 11, color: "#94a3b8" }}>
        🔒 Payments are processed securely. We never store your card details.
      </p>
    </div>
  );
}

// ── Script loader helper ──────────────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PublicInvoicePage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/invoice/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json() as Promise<{ invoice: Invoice }>;
      })
      .then((d) => {
        if (d) {
          setInvoice(d.invoice);
          if (d.invoice.status === "paid") setPaid(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Handle PayPal return — auto-capture if paypal_order_id param is present
  useEffect(() => {
    const paypalOrderId = searchParams.get("paypal_order_id");
    const invoiceId = searchParams.get("invoice_id");
    if (!paypalOrderId || !invoiceId) return;

    // Avoid double-capture
    const captureKey = `paypal_captured_${paypalOrderId}`;
    if (sessionStorage.getItem(captureKey)) return;
    sessionStorage.setItem(captureKey, "1");

    fetch("/api/payments/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: paypalOrderId, invoice_id: invoiceId }),
    })
      .then((r) => r.json())
      .then((data: { success?: boolean }) => {
        if (data.success) {
          setPaid(true);
          setInvoice((prev) =>
            prev ? { ...prev, status: "paid", paidDate: new Date().toISOString().split("T")[0] } : prev
          );
        }
      })
      .catch((err: unknown) => {
        console.error("[PayPal capture]", err);
      });
  }, [searchParams]);

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
      ? `Invoice ${invoice.invoiceNumber} from Hotbot Studios LLP - ${fmtAmount(invoice.total, invoice.currency)} due ${fmtDate(invoice.dueDate)}\n${window.location.href}`
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
  void sym;
  const sm = STATUS_META[invoice.status] ?? STATUS_META.draft;
  const currentStatus = paid ? "paid" : invoice.status;
  const currentSm = STATUS_META[currentStatus] ?? STATUS_META.draft;
  const showPaymentSection = !["paid", "cancelled"].includes(currentStatus) && !paid;

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

      {/* Payment success banner */}
      {paid && (
        <div
          className="no-print"
          style={{
            background: "#16a34a",
            color: "#fff",
            padding: "14px 24px",
            textAlign: "center",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'Inter', Arial, sans-serif",
          }}
        >
          ✅ Payment Received — Thank you! Your invoice has been marked as paid.
        </div>
      )}

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
          <ShareBtn onClick={handlePrint} color="#22c55e">
            ⬇ Download PDF
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
              <Image src="/logos/brand-logo.png" alt="HotBot Studios - AI Automation & Digital Marketing Agency" width={240} height={80} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <h1 style={{ margin: 0, color: "#ff7a00", fontSize: 28, fontWeight: 700 }}>INVOICE</h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555", fontWeight: 500 }}>#{invoice.invoiceNumber}</p>
              <span style={{ display: "inline-block", marginTop: 6, padding: "3px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, color: currentSm.color, background: currentSm.bg }}>
                {currentSm.label}
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
              <p style={{ margin: "3px 0", fontSize: 13 }}><strong>Status:</strong> <span style={{ color: currentSm.color, fontWeight: 600 }}>{currentSm.label}</span></p>
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

          {/* Online payment section — only shown when invoice is not paid/cancelled */}
          {showPaymentSection && (
            <PaymentSection
              invoice={invoice}
              onPaid={() => {
                setPaid(true);
                setInvoice((prev) =>
                  prev
                    ? { ...prev, status: "paid", paidDate: new Date().toISOString().split("T")[0] }
                    : prev
                );
              }}
            />
          )}

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
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Hotbot Studios LLP - AI | Software | Marketing Solutions</p>
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
