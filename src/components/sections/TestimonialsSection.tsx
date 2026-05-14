"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Reveal } from "@/components/shared/Reveal";

const TESTIMONIALS = [
  {
    name: "Ravi Sharma",
    role: "CEO, Timekeeperz",
    quote: "We were spending on ads with no real system behind them - just throwing money at Facebook and hoping. HotBot rebuilt our entire funnel, introduced AI-driven retargeting, and within one quarter our conversion rate doubled. 200% up. That's not a rounding error.",
    color: "#3b82f6",
    metric: "+200%",
    metricLabel: "Conversions",
  },
  {
    name: "Priya Kapoor",
    role: "Marketing Head, Oysters",
    quote: "Our events were getting low attendance despite high ad spend. HotBot ran our DJ Zuby campaign and drove 67 event responses at just ₹5.97 per response - half what we'd been paying. The AI chatbot they built now handles 80% of our customer queries.",
    color: "#8b5cf6",
    metric: "₹5.97",
    metricLabel: "Cost Per Lead",
  },
  {
    name: "Amit Verma",
    role: "Founder, Namo E Waste",
    quote: "Nobody knew who we were - crowded space, zero brand presence online. HotBot ran a full content and SEO overhaul. Within six months our brand recognition doubled and we now get inbound leads we didn't have to chase.",
    color: "#06b6d4",
    metric: "+100%",
    metricLabel: "Brand Awareness",
  },
  {
    name: "Sarah Cohen",
    role: "Director, Badiani New York",
    quote: "Our old site looked beautiful but didn't sell. Visitors would browse and leave. HotBot's UX team rearchitected the customer journey - clearer CTAs, faster checkout, smarter product discovery. Conversion rate jumped 65% in the first 60 days post-launch.",
    color: "#ec4899",
    metric: "+65%",
    metricLabel: "Conversion Rate",
  },
  {
    name: "Jaspreet Singh",
    role: "VP Digital, Times Internet",
    quote: "We had 15 different tools that didn't talk to each other - data was everywhere and nothing was actionable. HotBot built a unified automation layer connecting everything. My team recovered 200+ hours a month and we finally have one source of truth for performance.",
    color: "#f59e0b",
    metric: "200hrs",
    metricLabel: "Saved / Month",
  },
  {
    name: "Meera Patel",
    role: "CMO, Wings 4 Fashion",
    quote: "We had great products but no media presence - journalists didn't know we existed. HotBot mapped a PR strategy, pitched our story to the right editors, and within two months we had 12 major placements. Inbound lead quality improved dramatically overnight.",
    color: "#10b981",
    metric: "12+",
    metricLabel: "Media Placements",
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

  const nextRef = useRef(next);
  useEffect(() => { nextRef.current = next; }, [next]);

  useEffect(() => {
    timerRef.current = setInterval(() => nextRef.current(), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => nextRef.current(), 5000);
  }, []);

  const t = TESTIMONIALS[active];
  const prevIdx = (active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
  const nextIdx = (active + 1) % TESTIMONIALS.length;

  return (
    <section id="results" className="relative z-10 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Real Results</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-3">Problems Solved. Revenue Grown.</h2>
          <p className="text-slate-500 text-center mb-8 sm:mb-10 max-w-lg mx-auto text-sm sm:text-base">
            Every quote below started as a real growth problem. Here&apos;s how we solved it - with numbers.
          </p>
        </Reveal>

        {/* Avatar strip - scrollable on mobile */}
        <Reveal>
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-10 sm:mb-14 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {TESTIMONIALS.map((tm, i) => (
              <button
                key={i}
                onClick={() => { goTo(i, i > active ? 1 : -1); resetTimer(); }}
                aria-label={`View testimonial from ${tm.name}`}
                aria-current={i === active ? "true" : undefined}
                className="relative group transition-all duration-500 flex-shrink-0"
                style={{ transform: i === active ? "scale(1.2) translateY(-3px)" : "scale(1)", zIndex: i === active ? 10 : 1 }}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden transition-all duration-500"
                  style={{
                    border: i === active ? "2px solid rgba(59,130,246,0.8)" : "2px solid rgba(255,255,255,0.08)",
                    filter: i === active ? "brightness(1.1)" : "brightness(0.6) grayscale(0.3)",
                  }}
                >
                  <Avatar name={tm.name} color={tm.color} size={3} />
                </div>
                {i === active && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-dot-pulse" />
                )}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Cards */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 z-20 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0e1a, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 z-20 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0e1a, transparent)" }} />

          <div className="flex items-stretch justify-center gap-4 sm:gap-5" style={{ minHeight: 280, perspective: "1200px" }}>
            {/* Prev card - desktop only */}
            <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 cursor-pointer items-center" onClick={() => { prev(); resetTimer(); }}>
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
            <div className="flex-1 max-w-xl min-w-0">
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
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-10">
                  <div className="h-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" style={{ animation: "borderSlide 3s linear infinite" }} />
                </div>

                <div className="relative p-6 sm:p-8 md:p-10">
                  {/* Metric badge - absolute on md+, static on mobile */}
                  <div className="hidden sm:block absolute top-6 right-6 bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-center">
                    <div className="text-blue-400 text-xl sm:text-2xl font-bold">{t.metric}</div>
                    <div className="text-blue-400/50 text-[10px] font-medium uppercase tracking-wide mt-1">{t.metricLabel}</div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1.5 mb-4 sm:mb-6">
                    {Array.from({ length: 5 }, (_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    {/* Metric inline on mobile */}
                    <span className="sm:hidden ml-auto text-blue-400 text-sm font-bold">{t.metric} {t.metricLabel}</span>
                  </div>

                  <div className="mb-6 sm:mb-8 sm:pr-24">
                    <p className="text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed font-light">&ldquo;{t.quote}&rdquo;</p>
                  </div>

                  <div className="w-12 h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent mb-4 sm:mb-6" />

                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar name={t.name} color={t.color} size={3} />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{t.name}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next card - desktop only */}
            <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 cursor-pointer items-center" onClick={() => { next(); resetTimer(); }}>
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
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
            <button onClick={() => { prev(); resetTimer(); }} aria-label="Previous testimonial" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2" role="tablist" aria-label="Testimonials">
              {TESTIMONIALS.map((tm, i) => (
                <button key={i} onClick={() => { goTo(i, i > active ? 1 : -1); resetTimer(); }}
                  role="tab"
                  aria-label={`Go to testimonial ${i + 1}: ${tm.name}`}
                  aria-selected={i === active}
                  className="relative h-1.5 sm:h-2 rounded-full transition-all duration-500 overflow-hidden"
                  style={{ width: i === active ? 28 : 6, background: i === active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <button onClick={() => { next(); resetTimer(); }} aria-label="Next testimonial" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
          <p className="text-center text-slate-600 text-xs mt-3 sm:mt-4 font-mono tracking-widest">
            {String(active + 1).padStart(2, "0")} <span className="text-slate-700">/</span> {String(TESTIMONIALS.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
