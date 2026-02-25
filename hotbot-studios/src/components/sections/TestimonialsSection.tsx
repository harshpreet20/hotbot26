"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Reveal } from "@/components/shared/Reveal";

const TESTIMONIALS = [
  {
    name: "Ravi Sharma",
    role: "CEO, Timekeeperz",
    quote: "HotBot Studios transformed our digital presence completely. Our conversions increased by 200% within the first quarter. Their Mark-Tech approach is unlike anything we've experienced with other agencies.",
    color: "#3b82f6",
    metric: "+200%",
    metricLabel: "Conversions",
  },
  {
    name: "Priya Kapoor",
    role: "Marketing Head, Oysters",
    quote: "The AI chatbot they deployed handles 80% of our customer queries automatically. Our team can now focus on high-value tasks instead of repetitive questions. Sales increased 25% in just three months.",
    color: "#8b5cf6",
    metric: "+25%",
    metricLabel: "Sales Growth",
  },
  {
    name: "Amit Verma",
    role: "Founder, Namo E Waste",
    quote: "From SEO to social media to website redesign — HotBot handled everything with precision. Our brand value grew 100% and we're now recognized as a leader in our space.",
    color: "#06b6d4",
    metric: "+100%",
    metricLabel: "Brand Value",
  },
  {
    name: "Sarah Cohen",
    role: "Director, Badiani New York",
    quote: "Their UI/UX consulting completely reimagined our e-commerce experience. The conversion rate jumped 65% after the redesign. They understand both aesthetics and business outcomes.",
    color: "#ec4899",
    metric: "+65%",
    metricLabel: "Conversion Rate",
  },
  {
    name: "Jaspreet Singh",
    role: "VP Digital, Times Internet",
    quote: "Working with HotBot on our automation infrastructure transformed our operations. They integrated 15+ platforms into a unified workflow that saved our team over 200 hours per month.",
    color: "#f59e0b",
    metric: "200hrs",
    metricLabel: "Saved Monthly",
  },
  {
    name: "Meera Patel",
    role: "CMO, Wings 4 Fashion",
    quote: "The PR strategy HotBot developed got us featured in 12 major publications within two months. Our brand awareness tripled and the quality of inbound leads improved dramatically.",
    color: "#10b981",
    metric: "12+",
    metricLabel: "Media Features",
  },
];

function Avatar({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size * 4,
        height: size * 4,
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        fontSize: size * 1.1,
      }}
    >
      {initials}
    </div>
  );
}

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number, dir: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setDirection(dir);
      setActive(idx);
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating]
  );

  const next = useCallback(
    () => goTo((active + 1) % TESTIMONIALS.length, 1),
    [active, goTo]
  );
  const prev = useCallback(
    () => goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, -1),
    [active, goTo]
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const t = TESTIMONIALS[active];
  const prevIdx = (active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
  const nextIdx = (active + 1) % TESTIMONIALS.length;

  return (
    <section className="relative z-10 py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">What Our Clients Say</h2>
          <p className="text-slate-500 text-center mb-10 max-w-lg mx-auto">
            Real results from real partnerships — trusted by brands worldwide.
          </p>
        </Reveal>

        {/* Avatar strip */}
        <Reveal>
          <div className="flex justify-center items-center gap-3 mb-14">
            {TESTIMONIALS.map((tm, i) => (
              <button
                key={i}
                onClick={() => { goTo(i, i > active ? 1 : -1); resetTimer(); }}
                className="relative group transition-all duration-500"
                style={{ transform: i === active ? "scale(1.25) translateY(-4px)" : "scale(1)", zIndex: i === active ? 10 : 1 }}
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden transition-all duration-500"
                  style={{
                    border: i === active ? "2px solid rgba(59,130,246,0.8)" : "2px solid rgba(255,255,255,0.08)",
                    filter: i === active ? "brightness(1.1)" : "brightness(0.6) grayscale(0.3)",
                  }}
                >
                  <Avatar name={tm.name} color={tm.color} size={3.5} />
                </div>
                {i === active && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-dot-pulse" />
                )}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Cards */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-20 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0e1a, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-20 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0e1a, transparent)" }} />

          <div className="flex items-stretch justify-center gap-5" style={{ minHeight: 320, perspective: "1200px" }}>
            {/* Prev card */}
            <div className="hidden lg:flex w-64 flex-shrink-0 cursor-pointer items-center" onClick={() => { prev(); resetTimer(); }}>
              <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 transition-all duration-700 hover:bg-white/[0.04]"
                style={{ opacity: 0.35, transform: "translateX(20px) scale(0.88) rotateY(6deg)", transformOrigin: "right center", filter: "blur(0.8px)" }}>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">&ldquo;{TESTIMONIALS[prevIdx].quote}&rdquo;</p>
              </div>
            </div>

            {/* Active card */}
            <div className="flex-1 max-w-xl">
              <div
                key={active}
                className="relative rounded-3xl overflow-hidden h-full"
                style={{
                  animation: `slideCard${direction > 0 ? "Right" : "Left"} 0.6s cubic-bezier(0.16,1,0.3,1)`,
                  background: "linear-gradient(145deg, rgba(15,15,20,0.95), rgba(8,8,14,0.98))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                }}
              >
                {/* Top border animation */}
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-10">
                  <div className="h-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" style={{ animation: "borderSlide 3s linear infinite" }} />
                </div>

                <div className="relative p-8 md:p-10">
                  {/* Metric badge */}
                  <div className="absolute top-6 right-6 bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl px-5 py-3 text-center">
                    <div className="text-blue-400 text-2xl font-bold">{t.metric}</div>
                    <div className="text-blue-400/50 text-[10px] font-medium uppercase tracking-wide mt-1">{t.metricLabel}</div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1.5 mb-6">
                    {Array.from({ length: 5 }, (_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  <div className="mb-8 pr-16 md:pr-24">
                    <p className="text-slate-200 text-base md:text-lg leading-relaxed font-light">&ldquo;{t.quote}&rdquo;</p>
                  </div>

                  <div className="w-12 h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent mb-6" />

                  <div className="flex items-center gap-4">
                    <Avatar name={t.name} color={t.color} size={3.5} />
                    <div>
                      <p className="text-white font-semibold">{t.name}</p>
                      <p className="text-slate-400 text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next card */}
            <div className="hidden lg:flex w-64 flex-shrink-0 cursor-pointer items-center" onClick={() => { next(); resetTimer(); }}>
              <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 transition-all duration-700 hover:bg-white/[0.04]"
                style={{ opacity: 0.35, transform: "translateX(-20px) scale(0.88) rotateY(-6deg)", transformOrigin: "left center", filter: "blur(0.8px)" }}>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">&ldquo;{TESTIMONIALS[nextIdx].quote}&rdquo;</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button onClick={() => { prev(); resetTimer(); }} className="w-11 h-11 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => { goTo(i, i > active ? 1 : -1); resetTimer(); }}
                  className="relative h-2 rounded-full transition-all duration-500 overflow-hidden"
                  style={{ width: i === active ? 36 : 8, background: i === active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <button onClick={() => { next(); resetTimer(); }} className="w-11 h-11 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
          <p className="text-center text-slate-600 text-xs mt-4 font-mono tracking-widest">
            {String(active + 1).padStart(2, "0")} <span className="text-slate-700">/</span> {String(TESTIMONIALS.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
