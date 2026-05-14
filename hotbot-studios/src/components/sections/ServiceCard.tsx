"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface ServiceCardProps {
  type: string;
  title: string;
  desc: string;
  href: string;
  index?: number;
  featured?: boolean;
  products?: string[];
}

const ICONS: Record<string, React.ReactNode> = {
  marketing: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="9" rx="1" />
      <path d="M3 16h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
      <path d="M8 16v-3M16 16v-3" />
    </>
  ),
  ai: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
      <path d="M9 15h6" />
      <path d="M8 1v3M16 1v3" />
    </>
  ),
  software: (
    <>
      <path d="M7 8l-4 4 4 4" />
      <path d="M17 8l4 4-4 4" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </>
  ),
  pr: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  uiux: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>
  ),
  consulting: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 17V13" />
      <path d="M12 17V9" />
      <path d="M17 17V7" />
    </>
  ),
  seo: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M8 11h6" />
      <path d="M11 8v6" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
};

export function ServiceCard({
  type,
  title,
  desc,
  href,
  index = 0,
  featured = false,
  products,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -12, y: (x - 0.5) * 12 });
    setMousePos({ x: x * 100, y: y * 100 });
  };

  const icon = ICONS[type] || ICONS.code;

  return (
    <Link
      href={href}
      className="block h-full"
      style={{ gridColumn: featured ? "span 2" : undefined }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          setTilt({ x: 0, y: 0 });
        }}
        className="cursor-pointer h-full"
        style={{
          perspective: "800px",
          animationDelay: `${index * 0.08}s`,
        }}
      >
        <div
          className="relative rounded-2xl overflow-hidden transition-transform duration-200 ease-out h-full"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovering ? "scale(1.03)" : "scale(1)"}`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Glow cursor effect */}
          <div
            className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none z-10"
            style={{
              opacity: hovering ? 1 : 0,
              background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.12), transparent 60%)`,
            }}
          />

          {/* Card body */}
          <div
            className="relative bg-[#0d1225]/90 backdrop-blur-xl border rounded-2xl p-6 h-full"
            style={{
              borderColor: hovering ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.08)",
            }}
          >
            {/* Corner dot */}
            <div className="absolute top-4 right-4">
              <div
                className="w-[6px] h-[6px] rounded-full transition-all duration-500"
                style={{
                  backgroundColor: hovering ? "rgba(59,130,246,0.9)" : "rgba(59,130,246,0.3)",
                  boxShadow: hovering ? "0 0 10px rgba(59,130,246,0.5)" : "none",
                }}
              />
            </div>

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500"
              style={{
                background: hovering
                  ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(6,182,212,0.15))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))",
                border: `1px solid ${hovering ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.15)"}`,
                transform: hovering ? "translateY(-2px) scale(1.05)" : "none",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={hovering ? "#60a5fa" : "#3b82f6"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: "all 0.4s",
                  filter: hovering ? "drop-shadow(0 0 6px rgba(96,165,250,0.4))" : "none",
                }}
              >
                {icon}
              </svg>
            </div>

            {/* Title */}
            <h3
              className="font-semibold text-[15px] mb-1.5 transition-all duration-300"
              style={{ color: hovering ? "#93c5fd" : "#f1f5f9" }}
            >
              {title}
            </h3>

            {/* Desc */}
            <p className="text-slate-400 text-[13px] leading-relaxed mb-4">{desc}</p>

            {/* Product pills (for AI card) */}
            {products && products.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {products.map((p, pi) => (
                  <span
                    key={pi}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300"
                    style={{
                      background: hovering ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.06)",
                      border: `1px solid ${hovering ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.12)"}`,
                      color: hovering ? "#93c5fd" : "#64748b",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Explore arrow */}
            <div
              className="flex items-center gap-2 transition-all duration-500"
              style={{
                opacity: hovering ? 1 : 0,
                transform: hovering ? "translateY(0)" : "translateY(6px)",
              }}
            >
              <span className="text-blue-400 text-xs font-semibold">Explore</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transition: "transform 0.3s", transform: hovering ? "translateX(3px)" : "none" }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
