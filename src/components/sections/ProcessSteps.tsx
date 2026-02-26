"use client";
import { useState } from "react";
import { Reveal } from "@/components/shared/Reveal";

interface ProcessStep {
  n: number;
  title: string;
  desc: string;
  icon?: string;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
  title?: string;
}

export function ProcessSteps({ steps, title = "Our Process" }: ProcessStepsProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
      <Reveal>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{title}</h2>
      </Reveal>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Step selector */}
        <div className="flex flex-row md:flex-col gap-2 md:w-64 flex-shrink-0">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300"
              style={{
                background: activeStep === i ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeStep === i ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: activeStep === i ? "#3b82f6" : "rgba(255,255,255,0.05)",
                  color: activeStep === i ? "white" : "#64748b",
                }}
              >
                {step.n}
              </span>
              <span
                className="font-semibold text-sm hidden md:block"
                style={{ color: activeStep === i ? "white" : "#64748b" }}
              >
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1">
          <Reveal key={activeStep}>
            <div
              className="p-8 rounded-2xl border"
              style={{
                background: "rgba(59,130,246,0.04)",
                borderColor: "rgba(59,130,246,0.15)",
              }}
            >
              <div className="text-4xl mb-4">{steps[activeStep].icon || "📍"}</div>
              <div className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">
                Step {steps[activeStep].n}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{steps[activeStep].title}</h3>
              <p className="text-slate-400 leading-relaxed">{steps[activeStep].desc}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
