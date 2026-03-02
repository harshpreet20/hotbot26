"use client";
import { useState, useEffect } from "react";

const TLDS = [".ai", ".com", ".ae", ".uk", ".in"];

export function DomainWidget() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TLDS.length);
        setVisible(true);
      }, 220);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative z-10 pt-28 pb-10 px-6 text-center overflow-hidden">
      {/* Subtle blue radial glow behind headline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-slate-400 text-xs font-medium tracking-wide uppercase">
            Mar-Tech — Marketing &amp; Technology
          </span>
        </div>

        {/* Main headline with cycling TLD pill */}
        <h2 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.08] tracking-tight mb-7">
          Turn your{" "}
          <span
            className="inline-flex items-center justify-center align-baseline rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.13)",
              minWidth: "5.5rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.1em",
              paddingBottom: "0.1em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(-7px)",
                transition: "opacity 0.18s ease, transform 0.18s ease",
              }}
            >
              {TLDS[idx]}
            </span>
          </span>{" "}
          into your
          <br className="hidden md:block" /> digital front door.
        </h2>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Once visitors walk through, our Mar-Tech solutions give them every
          reason to stay. We blend marketing technology with intentional design
          to drive engagement, lift conversions, and build an online presence
          that compounds over time.
        </p>

        {/* TLD indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TLDS.map((tld, i) => (
            <button
              key={tld}
              onClick={() => {
                setVisible(false);
                setTimeout(() => { setIdx(i); setVisible(true); }, 220);
              }}
              className="transition-all duration-300"
              style={{
                width: i === idx ? "1.5rem" : "0.375rem",
                height: "0.375rem",
                borderRadius: "9999px",
                background: i === idx ? "#3b82f6" : "rgba(255,255,255,0.15)",
              }}
              aria-label={`Show ${tld}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
