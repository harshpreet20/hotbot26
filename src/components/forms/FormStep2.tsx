"use client";
import type { FormData } from "@/types";
import { SERVICE_LIST, BUDGET_LIST } from "@/lib/constants";

interface FormStep2Props {
  form: FormData;
  update: (k: keyof FormData, v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function FormStep2({ form, update, onBack, onNext }: FormStep2Props) {
  const valid = form.service;

  return (
    <div className="animate-form-step-in">
      <p className="text-slate-400 text-sm mb-4">Step 2 of 3 - Service & Budget</p>

      <div className="mb-5">
        <label className="block text-slate-400 text-[12px] font-medium mb-3">
          Which service are you interested in? <span className="text-blue-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_LIST.map((s) => (
            <button
              key={s}
              onClick={() => update("service", s)}
              className="px-3 py-2.5 rounded-xl text-left text-[12px] font-semibold transition-all duration-200"
              style={{
                background: form.service === s ? "#162044" : "#111730",
                border: `1px solid ${form.service === s ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: form.service === s ? "#93c5fd" : "#94a3b8",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-slate-400 text-[12px] font-medium mb-3">Budget Range</label>
        <div className="flex flex-col gap-2">
          {BUDGET_LIST.map((b) => (
            <button
              key={b}
              onClick={() => update("budget", b)}
              className="px-4 py-3 rounded-xl text-left text-[12px] font-semibold transition-all duration-200"
              style={{
                background: form.budget === b ? "#162044" : "#111730",
                border: `1px solid ${form.budget === b ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: form.budget === b ? "#93c5fd" : "#94a3b8",
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-semibold text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 py-3 rounded-2xl font-semibold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
