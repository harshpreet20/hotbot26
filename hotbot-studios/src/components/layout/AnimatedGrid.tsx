"use client";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function AnimatedGrid() {
  const scrollY = useScrollPosition();

  // Opacity fades with scroll
  const gridOp = Math.max(0.015, 0.18 - scrollY * 0.00022);
  const dotsOp = Math.max(0.02, 0.3 - scrollY * 0.00038);
  const scanOp = Math.max(0.03, 0.25 - scrollY * 0.0003);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-[#0a0e1a]" />

      {/* Glow orbs */}
      <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] rounded-full bg-blue-600/[0.07] blur-[150px] animate-glow-drift-1" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.05] blur-[120px] animate-glow-drift-2" />
      <div className="absolute top-[40%] left-[50%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[100px] animate-glow-drift-3" />

      {/* SVG Grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: gridOp, transition: "opacity 0.15s" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(148,163,184,0.5)"
              strokeWidth="0.6"
            />
          </pattern>
          <pattern id="gridLg" width="300" height="300" patternUnits="userSpaceOnUse">
            <path
              d="M 300 0 L 0 0 0 300"
              fill="none"
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="0.8"
            />
          </pattern>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="8%" stopColor="white" stopOpacity="1" />
            <stop offset="40%" stopColor="white" stopOpacity="0.7" />
            <stop offset="70%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridLg)" mask="url(#gridMask)" />
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>

      {/* Scanning line */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: scanOp, transition: "opacity 0.15s" }}
      >
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-scanline" />
      </div>

      {/* Intersection dots */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: dotsOp, transition: "opacity 0.15s" }}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-blue-400"
            style={{
              left: `${(i % 5) * 20 + 10}%`,
              top: `${Math.floor(i / 5) * 20 + 5}%`,
              animation: `dotPulse ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              boxShadow: "0 0 6px rgba(59,130,246,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
