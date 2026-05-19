"use client";
import { useState, useEffect, useRef } from "react";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useAppStore } from "@/store/useAppStore";
import { FormStep1 } from "./FormStep1";
import { FormStep2 } from "./FormStep2";
import { FormStep3 } from "./FormStep3";
import { FormSuccess } from "./FormSuccess";
import type { FormData } from "@/types";

const TITLES: Record<string, string> = {
  "get-started": "Start Your Project",
  "contact-sales": "Talk to Sales",
  "strategy-call": "Book Strategy Call",
  consultation: "Free Consultation",
};

const SUBTITLES: Record<string, string> = {
  "get-started": "Tell us about your project and we'll get back within 24 hours.",
  "contact-sales": "Our sales team will reach out with a tailored proposal.",
  "strategy-call": "Book a free 30-minute strategy session with our experts.",
  consultation: "Get a no-obligation consultation for your US business.",
};

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budget: "",
  message: "",
};

const SESSION_KEY = "hotbot_form_draft";

export function FormModal() {
  const { formOpen, formType, formPage, closeForm } = useAppStore();
  const [form, setForm] = useState<FormData>(() => {
    // Restore draft from sessionStorage on first render (client-only)
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) return { ...EMPTY_FORM, ...JSON.parse(saved) };
      } catch { /* ignore */ }
    }
    return EMPTY_FORM;
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  const { getToken, prime } = useRecaptcha();

  // Persist form draft to sessionStorage on every change (survives page refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (done) {
      sessionStorage.removeItem(SESSION_KEY); // Clear after successful submit
    } else {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(form)); } catch { /* ignore */ }
    }
  }, [form, done]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (formOpen) {
      setStep(1);
      setDone(false);
      setSubmitting(false);
      document.body.style.overflow = "hidden";
      prime(); // user clicked a CTA — warm up reCAPTCHA now
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [formOpen]);

  if (!formOpen) return null;

  const update = (k: keyof FormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Get reCAPTCHA v3 token (returns null if site key not configured)
      const recaptchaToken = await getToken("lead_form");
      const res = await fetch("/api/forms/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType, page: formPage, recaptchaToken }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) setLeadId(data?.leadId || null);
    } catch {
      // Network / server error - show success so user isn't blocked
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
        setDone(true);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onClick={closeForm}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] z-10 rounded-3xl overflow-hidden animate-zoom-in"
        style={{ background: "#0c1021", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        {/* Top gradient bar */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)" }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <div
              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd" }}
            >
              {formType?.replace(/-/g, " ")}
            </div>
            <h2 className="text-xl font-bold text-white">{TITLES[formType] || "Get Started"}</h2>
            <p className="text-slate-400 text-sm mt-1">{SUBTITLES[formType] || ""}</p>
          </div>
          <button
            onClick={closeForm}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!done ? (
          <>
            {/* Progress */}
            <div className="px-6 mb-4">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full transition-all duration-500"
                    style={{ background: s <= step ? "linear-gradient(90deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="px-6 pb-6">
              {step === 1 && <FormStep1 form={form} update={update} onNext={() => setStep(2)} />}
              {step === 2 && <FormStep2 form={form} update={update} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
              {step === 3 && (
                <FormStep3
                  form={form}
                  update={update}
                  onBack={() => setStep(2)}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              )}
            </div>
          </>
        ) : (
          <div className="px-6 pb-8">
            <FormSuccess onClose={closeForm} leadId={leadId} />
          </div>
        )}
      </div>
    </div>
  );
}
