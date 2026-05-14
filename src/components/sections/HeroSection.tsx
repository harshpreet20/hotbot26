"use client";
import { useState, useEffect } from "react";
import { ServiceCard } from "./ServiceCard";
import { useAppStore } from "@/store/useAppStore";

const SERVICES = [
  {
    type: "ai",
    title: "AI Automation",
    desc: "Stop doing manually what machines can handle. Custom AI agents and workflows that save your team 200+ hours every month.",
    href: "/ai-automation",
    featured: true,
    products: ["Heka Voice AI", "Website Keywords", "Telegram Bot", "LinkedIn Assistant", "Instagram Assistant", "Wellness AI"],
  },
  {
    type: "marketing",
    title: "Digital Marketing",
    desc: "Turn ad spend into predictable revenue. Data-driven SEO, PPC, and social campaigns engineered for maximum ROI.",
    href: "/digital-marketing",
  },
  {
    type: "software",
    title: "Content Production Studio",
    desc: "Content that attracts, engages, and converts. Video, copy, and social built to grow your audience on every platform.",
    href: "/content-studio",
  },
  {
    type: "code",
    title: "Software Development",
    desc: "From MVP to enterprise-grade platform - we ship robust, scalable software your users will love and your investors will trust.",
    href: "/software-development",
  },
  {
    type: "pr",
    title: "Public Relations",
    desc: "Get your brand into Forbes, TechCrunch, and the outlets your buyers actually read. Authority that opens doors.",
    href: "/public-relations",
  },
  {
    type: "uiux",
    title: "UI/UX Design",
    desc: "Beautiful products that guide users to their goals - and your business to higher conversions. Design that pays for itself.",
    href: "/ui-ux-design",
  },
  {
    type: "consulting",
    title: "Marketing Consulting",
    desc: "Clarity without the jargon. We audit your growth strategy, uncover revenue leaks, and hand you a prioritized execution plan.",
    href: "/marketing-consulting",
    featured: true,
  },
];

export function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const openForm = useAppStore((s) => s.openForm);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">
      {/* Badge */}
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}
      >
        <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6 sm:mb-8 max-w-[90vw] text-center">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-slate-400 text-[11px] sm:text-[13px] font-medium leading-snug">
            <span className="hidden sm:inline">Only 5 Client Spots Open This Month - Trusted by 42+ US Brands</span>
            <span className="sm:hidden">Only 5 Spots Left This Month</span>
          </span>
        </div>
      </div>

      {/* Heading */}
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-[1.1] tracking-tight mb-4 sm:mb-5"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
        }}
      >
        <span className="text-white">Stop Managing 5 Agencies.</span>
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          One Team. Every Service.
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-slate-300 text-base sm:text-lg md:text-xl text-center mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed px-2"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(25px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s",
        }}
      >
        Wasting ad spend on agencies that don&apos;t talk to each other? We build and run your entire AI-powered growth engine - marketing, automation, content, software, PR, and design - so every dollar compounds.
      </p>

      {/* Free value trust bar */}
      <div
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6 text-sm"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s",
        }}
      >
        {["Free AI Growth Audit in 24hrs", "No long-term contracts", "Dedicated growth team from day one"].map((item) => (
          <span key={item} className="flex items-center gap-1.5 text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            {item}
          </span>
        ))}
      </div>

      {/* Service cards */}
      <div
        id="services"
        className="services-grid max-w-6xl w-full"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s",
        }}
      >
        {SERVICES.map((s, i) => (
          <ServiceCard key={i} index={i} {...s} />
        ))}
      </div>

      {/* CTA row */}
      <div
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10 sm:mt-14 w-full sm:w-auto px-4 sm:px-0"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s",
        }}
      >
        <button
          onClick={() => openForm("get-started", "home")}
          className="px-8 py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25 text-center"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Get My Free Growth Audit
        </button>
        <a
          href="#results"
          className="px-8 py-3.5 rounded-2xl font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 text-center"
        >
          See Client Results
        </a>
      </div>
    </section>
  );
}
