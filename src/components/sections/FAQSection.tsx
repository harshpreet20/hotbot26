"use client";
import { useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

export function FAQSection({ faqs, title = "Frequently Asked Questions" }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
      <Reveal>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{title}</h2>
      </Reveal>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div
              className="border rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: open === i ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.02)",
                borderColor: open === i ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.06)",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className="text-slate-400 flex-shrink-0 transition-transform duration-300"
                  style={{ transform: open === i ? "rotate(180deg)" : "none" }}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 animate-form-step-in">
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
