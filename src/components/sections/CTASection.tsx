"use client";
import { useAppStore } from "@/store/useAppStore";
import { Reveal } from "@/components/shared/Reveal";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  formType?: string;
}

export function CTASection({
  title = "Ready to Scale Your Business?",
  subtitle = "Join 42+ US businesses using HotBot Studios to grow faster with AI-powered marketing, automation, and creative services.",
  primaryCTA = "Start Your Project",
  secondaryCTA = "Book Strategy Call",
  formType = "get-started",
}: CTASectionProps) {
  const openForm = useAppStore((s) => s.openForm);

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div
            className="relative rounded-3xl overflow-hidden text-center p-12 md:p-16"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 100%)",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}
              >
                🚀 Let&apos;s Build Together
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">{subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => openForm(formType)}
                  className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                >
                  {primaryCTA}
                </button>
                <button
                  onClick={() => openForm("strategy-call")}
                  className="px-8 py-4 rounded-2xl font-semibold text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                >
                  {secondaryCTA}
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
