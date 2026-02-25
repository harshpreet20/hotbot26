"use client";
import { useState, useEffect } from "react";
import { ServiceCard } from "./ServiceCard";
import { useAppStore } from "@/store/useAppStore";

const SERVICES = [
  {
    type: "ai",
    title: "AI Automation",
    desc: "Custom AI agents, voice assistants, and intelligent automation systems.",
    href: "/ai-automation",
    featured: true,
    products: ["Heka Voice AI", "Website Keywords", "Telegram Bot", "LinkedIn Assistant", "Instagram Assistant", "Wellness AI"],
  },
  {
    type: "marketing",
    title: "Digital Marketing",
    desc: "SEO, SEM, social media, and performance marketing strategies.",
    href: "/marketing-services",
  },
  {
    type: "software",
    title: "Content Production Studio",
    desc: "Premium websites, web apps, and professional content creation.",
    href: "/content-studio",
  },
  {
    type: "code",
    title: "Software Development",
    desc: "Custom software, mobile apps, SaaS platforms, and API integrations.",
    href: "/software-development",
  },
  {
    type: "pr",
    title: "Public Relations",
    desc: "Strategic PR campaigns, media outreach, and brand reputation management.",
    href: "/public-relations",
  },
  {
    type: "uiux",
    title: "UI/UX Design",
    desc: "User-centered design, wireframing, prototyping, and conversion optimization.",
    href: "/ui-ux-design",
  },
  {
    type: "consulting",
    title: "Marketing Consulting",
    desc: "Business strategy, digital transformation, and growth consulting.",
    href: "/consultancy",
  },
  {
    type: "seo",
    title: "Analytics & Data",
    desc: "Real-time dashboards, attribution modelling, and conversion intelligence.",
    href: "/marketing-services",
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
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
      {/* Badge */}
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}
      >
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-[13px] font-medium">
            Full-Service Growth Infrastructure
          </span>
        </div>
      </div>

      {/* Heading */}
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-[1.1] tracking-tight mb-5"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
        }}
      >
        <span className="text-white">Welcome to </span>
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          HotBot Studios
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-slate-300 text-lg md:text-xl text-center mb-14"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(25px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s",
        }}
      >
        Choose your growth engine
      </p>

      {/* Service cards */}
      <div
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
        className="flex flex-col sm:flex-row gap-4 mt-14"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s",
        }}
      >
        <button
          onClick={() => openForm("get-started", "home")}
          className="px-8 py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Start Your Project
        </button>
        <a
          href="#services"
          className="px-8 py-3.5 rounded-2xl font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 text-center"
        >
          Explore Services
        </a>
      </div>
    </section>
  );
}
