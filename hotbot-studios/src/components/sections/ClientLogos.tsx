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
    <section className="relative z-10 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <p className="text-center text-slate-600 text-[11px] sm:text-[13px] uppercase tracking-[0.12em] font-semibold mb-8 sm:mb-10">
            Trusted by teams worldwide
          </p>
        </Reveal>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
          {CLIENTS.map((c, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(-1)}
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-[14px] transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  padding: "16px 8px",
                  minHeight: 80,
                  border: `1px solid ${hovIdx === i ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.06)"}`,
                  boxShadow:
                    hovIdx === i
                      ? "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(59,130,246,0.1)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  transform: hovIdx === i ? "translateY(-3px)" : "none",
                }}
              >
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-[8px] sm:rounded-[10px] flex items-center justify-center transition-all duration-300"
                  style={{
                    background: hovIdx === i ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#f1f5f9",
                    border: `1px solid ${hovIdx === i ? "transparent" : "#e2e8f0"}`,
                  }}
                >
                  <span
                    className="font-bold transition-colors duration-300"
                    style={{
                      fontSize: c.short === "+" ? 16 : 11,
                      color: hovIdx === i ? "white" : "#64748b",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {c.short}
                  </span>
                </div>
                <span
                  className="text-[8px] sm:text-[10px] font-semibold uppercase text-center leading-tight tracking-wide transition-colors duration-300"
                  style={{ color: hovIdx === i ? "#1e293b" : "#94a3b8" }}
                >
                  {c.name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
