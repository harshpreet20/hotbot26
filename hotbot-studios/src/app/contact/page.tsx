"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/shared/Reveal";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/n8n/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setDone(true);
    } catch {
      setDone(true);
    }
    setSubmitting(false);
  };

  return (
    <>
      <PageHeader
        label="Contact"
        title="Let's Start a Conversation"
        subtitle="Reach out via the form below, WhatsApp, or email. We respond to all enquiries within 24 hours."
      />

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact info */}
          <Reveal>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-bold text-xl mb-4">Get in Touch</h3>
                <p className="text-slate-400 leading-relaxed">
                  Whether you have a specific project in mind or just want to explore how HotBot Studios can help your business grow, we&apos;d love to hear from you.
                </p>
              </div>

              {[
                { icon: "📧", title: "Email", value: "hello@hotbotstudios.com", href: "mailto:hello@hotbotstudios.com" },
                { icon: "💬", title: "WhatsApp", value: "+44 7700 900000", href: "https://wa.me/447700900000" },
                { icon: "📍", title: "Location", value: "London, United Kingdom", href: null },
                { icon: "⏰", title: "Response Time", value: "Within 24 hours", href: null },
              ].map((item) => (
                <GlassCard key={item.title} className="p-5" hover={false}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-0.5">{item.title}</p>
                      {item.href ? (
                        <a href={item.href} className="text-white font-medium hover:text-blue-300 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-white font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </Reveal>

          {/* Contact form */}
          <Reveal delay={0.15}>
            {!done ? (
              <GlassCard className="p-8" hover={false}>
                <h3 className="text-white font-bold text-xl mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { key: "name", label: "Full Name *", type: "text", placeholder: "John Smith" },
                    { key: "email", label: "Email *", type: "email", placeholder: "john@company.com" },
                    { key: "phone", label: "Phone", type: "tel", placeholder: "+44 7700 900000" },
                    { key: "subject", label: "Subject", type: "text", placeholder: "How can we help?" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-slate-400 text-xs font-medium mb-1.5">{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => update(key, e.target.value)}
                        placeholder={placeholder}
                        className="form-input"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Tell us about your project or question..."
                      className="form-input resize-none"
                      style={{ minHeight: 100 }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !form.name.trim() || !form.email.trim()}
                    className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                  >
                    {submitting ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              </GlassCard>
            ) : (
              <GlassCard className="p-10 text-center" hover={false}>
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400">We&apos;ll get back to you within 24 hours.</p>
              </GlassCard>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
