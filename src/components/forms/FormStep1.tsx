"use client";
import type { FormData } from "@/types";

interface FormStep1Props {
  form: FormData;
  update: (k: keyof FormData, v: string) => void;
  onNext: () => void;
}

export function FormStep1({ form, update, onNext }: FormStep1Props) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const valid = form.name.trim() && emailOk;

  const fields: Array<{ key: keyof FormData; label: string; type: string; placeholder: string; required?: boolean }> = [
    { key: "name", label: "Full Name", type: "text", placeholder: "John Smith", required: true },
    { key: "email", label: "Email Address", type: "email", placeholder: "john@company.com", required: true },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 97000 01534" },
    { key: "company", label: "Company Name", type: "text", placeholder: "Acme Inc." },
  ];

  return (
    <div className="animate-form-step-in space-y-4">
      <p className="text-slate-400 text-sm mb-2">Step 1 of 3 — Contact Information</p>
      {fields.map(({ key, label, type, placeholder, required }) => (
        <div key={key}>
          <label className="block text-slate-400 text-[12px] font-medium mb-1.5">
            {label} {required && <span className="text-blue-400">*</span>}
          </label>
          <input
            type={type}
            value={form[key]}
            onChange={(e) => update(key, e.target.value)}
            placeholder={placeholder}
            className="form-input"
          />
        </div>
      ))}
      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 mt-2 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
      >
        Continue →
      </button>
    </div>
  );
}
