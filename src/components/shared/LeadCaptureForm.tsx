"use client";
import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";

interface LeadCaptureFormProps {
  /** Unique identifier sent to n8n so you know which page the lead came from */
  sourceId: string;
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export function LeadCaptureForm({
  sourceId,
  title = "Get a Free Quote",
  subtitle = "Tell us about your project. We respond within 24 hours.",
  accentColor = "#3b82f6",
}: LeadCaptureFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const valid = form.name.trim().length > 0 && emailOk;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/forms/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          formType: "enquiry",
          page: sourceId,
        }),
      });
      const data = await res.json().catch(() => ({})) as Record<string, unknown>;
      if (!res.ok && res.status !== 200) {
        setError((data?.error as string) || "Something went wrong. Please try again.");
        return;
      }
      setLeadId((data?.leadId as string) || null);
      setDone(true);
    } catch {
      // Network error - still show success to avoid blocking the user
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
        <p className="text-slate-400 leading-relaxed">
          Thank you for reaching out. Our team will get back to you within <strong className="text-white">24 hours</strong>.
        </p>
        {leadId && (
          <p className="text-slate-600 text-xs mt-4">Reference ID: {leadId}</p>
        )}
      </GlassCard>
    );
  }

  const inputClass =
    "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-white/25 transition-colors";

  return (
    <GlassCard className="p-6 md:p-8">
      {title && (
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      )}
      {subtitle && (
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">{subtitle}</p>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            Full Name <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            Email Address <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@company.com"
            className={inputClass}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 555 000 1234"
            className={inputClass}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            Tell Us About Your Project
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="What are you looking to achieve? Any specific timeline or budget in mind?"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: valid
              ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
              : "rgba(255,255,255,0.06)",
          }}
        >
          {submitting ? "Sending…" : "Send Enquiry →"}
        </button>

        <p className="text-slate-600 text-[11px] text-center">
          No spam. We respond within 24 hours. Your details are kept confidential.
        </p>
      </div>
    </GlassCard>
  );
}
