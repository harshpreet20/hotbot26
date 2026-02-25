"use client";
import { useState } from "react";
import { Reveal } from "@/components/shared/Reveal";

const CLIENTS = [
  { name: "BADIANI", short: "B" },
  { name: "MINISO", short: "M" },
  { name: "Our Chemist", short: "OC" },
  { name: "Mudra", short: "Mu" },
  { name: "Oysters", short: "Oy" },
  { name: "Times Internet", short: "TI" },
  { name: "Tribes India", short: "Ti" },
  { name: "Wings 4 Fashion", short: "W4" },
  { name: "WSCC", short: "WS" },
  { name: "Namo E Waste", short: "NE" },
  { name: "Timekeeperz", short: "TK" },
  { name: "Your Brand", short: "+" },
];

export function ClientLogos() {
  const [hovIdx, setHovIdx] = useState(-1);

  return (
    <section className="relative z-10 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <p className="text-center text-slate-600 text-[13px] uppercase tracking-[0.12em] font-semibold mb-10">
            Trusted by teams worldwide
          </p>
        </Reveal>
        <div
          className="grid gap-3.5"
          style={{
            gridTemplateColumns: "repeat(6, 1fr)",
          }}
        >
          {CLIENTS.map((c, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(-1)}
                className="flex flex-col items-center justify-center gap-2 rounded-[14px] transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  padding: "24px 12px",
                  minHeight: 100,
                  border: `1px solid ${hovIdx === i ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.06)"}`,
                  boxShadow:
                    hovIdx === i
                      ? "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(59,130,246,0.1)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  transform: hovIdx === i ? "translateY(-3px)" : "none",
                }}
              >
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all duration-300"
                  style={{
                    background: hovIdx === i ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#f1f5f9",
                    border: `1px solid ${hovIdx === i ? "transparent" : "#e2e8f0"}`,
                  }}
                >
                  <span
                    className="font-bold transition-colors duration-300"
                    style={{
                      fontSize: c.short === "+" ? 20 : 13,
                      color: hovIdx === i ? "white" : "#64748b",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {c.short}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold uppercase text-center leading-tight tracking-wide transition-colors duration-300"
                  style={{ color: hovIdx === i ? "#1e293b" : "#94a3b8" }}
                >
                  {c.name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <style>{`
          @media (max-width: 768px) { .client-logo-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media (max-width: 480px) { .client-logo-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        `}</style>
      </div>
    </section>
  );
}
