"use client";
import type { FormData } from "@/types";

interface FormStep3Props {
  form: FormData;
  update: (k: keyof FormData, v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function FormStep3({ form, update, onBack, onSubmit, submitting }: FormStep3Props) {
  return (
    <div className="animate-form-step-in">
      <p className="text-slate-400 text-sm mb-4">Step 3 of 3 — Your Message</p>

      {/* Summary */}
      <div
        className="p-4 rounded-xl mb-4 border"
        style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.12)" }}
      >
        <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-2">Summary</p>
        <div className="space-y-1.5">
          {form.name && <p className="text-slate-300 text-xs"><span className="text-slate-500">Name:</span> {form.name}</p>}
          {form.email && <p className="text-slate-300 text-xs"><span className="text-slate-500">Email:</span> {form.email}</p>}
          {form.service && <p className="text-slate-300 text-xs"><span className="text-slate-500">Service:</span> {form.service}</p>}
          {form.budget && <p className="text-slate-300 text-xs"><span className="text-slate-500">Budget:</span> {form.budget}</p>}
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="block text-slate-400 text-[12px] font-medium mb-1.5">
          Tell us more about your project
        </label>
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Describe your goals, timeline, or any specific requirements..."
          className="form-input resize-none"
          style={{ minHeight: 100 }}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-semibold text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 py-3 rounded-2xl font-semibold text-white transition-all duration-300 disabled:opacity-60 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          {submitting ? "Sending..." : "Submit →"}
        </button>
      </div>

      <p className="text-slate-600 text-[11px] text-center mt-4">
        🔒 Your information is secure and never shared.
      </p>
    </div>
  );
}
