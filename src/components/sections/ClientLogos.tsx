"use client";
import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";

// logo: filename inside /public/logos/ (without leading slash).
// When a logo file is present it renders as an image; otherwise falls back to the short text abbreviation.
const CLIENTS: { name: string; short: string; logo?: string }[] = [
  { name: "BADIANI",        short: "B",  logo: "Badiani New York.png" },
  { name: "MINISO",         short: "M",  logo: "Miniso_2023.svg.png" },
  { name: "Our Chemist",    short: "OC", logo: "Our Chemist Logo.png" },
  { name: "Mudra",          short: "Mu", logo: "Mudra.svg" },
  { name: "Oysters",        short: "Oy", logo: "oysters.jpg" },
  { name: "Times Internet", short: "TI", logo: "times internet logo.png" },
  { name: "Tribes India",   short: "Ti" },
  { name: "Wings 4 Fashion",short: "W4", logo: "wings4fashion-logo-removebg-preview.png" },
  { name: "WSCC",           short: "WS" },
  { name: "Namo E Waste",   short: "NE", logo: "Namo Logo.jpg" },
  { name: "Salt and Smoke",  short: "SS" },
  { name: "Your Brand",     short: "+" },
];

function ClientCard({ c, hovered, onEnter, onLeave }: {
  c: typeof CLIENTS[number];
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = !!c.logo && !imgFailed;

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-[14px] transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.95)",
        padding: "21px 10px",
        minHeight: 104,
        border: `1px solid ${hovered ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.06)"}`,
        boxShadow: hovered
          ? "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(59,130,246,0.1)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-[12px] flex items-center justify-center transition-all duration-300 overflow-hidden"
        style={{
          background: showImg ? "transparent" : hovered ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#f1f5f9",
          border: `1px solid ${showImg ? "rgba(0,0,0,0.06)" : hovered ? "transparent" : "#e2e8f0"}`,
        }}
      >
        {showImg ? (
          <Image
            src={`/logos/${c.logo}`}
            alt={c.name}
            width={56}
            height={56}
            className="object-contain w-full h-full p-1"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            className="font-bold transition-colors duration-300"
            style={{
              fontSize: c.short === "+" ? 16 : 11,
              color: hovered ? "white" : "#64748b",
              letterSpacing: "-0.02em",
            }}
          >
            {c.short}
          </span>
        )}
      </div>
      <span
        className="text-[8px] sm:text-[10px] font-semibold uppercase text-center leading-tight tracking-wide transition-colors duration-300"
        style={{ color: hovered ? "#1e293b" : "#94a3b8" }}
      >
        {c.name}
      </span>
    </div>
  );
}

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
              <ClientCard
                c={c}
                hovered={hovIdx === i}
                onEnter={() => setHovIdx(i)}
                onLeave={() => setHovIdx(-1)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
