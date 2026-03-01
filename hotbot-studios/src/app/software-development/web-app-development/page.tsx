import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

export const metadata: Metadata = {
  title: "Web Application Development Agency USA — React, Next.js & TypeScript | HotBot Studios",
  description:
    "HotBot Studios builds custom web applications for US businesses using React 19, Next.js 15, Node.js, and AWS. Scalable dashboards, multi-user platforms, and data-driven web apps. 4-week MVP delivery. Free technical scoping.",
  keywords: [
    "web application development agency USA",
    "React development agency USA",
    "Next.js development company USA",
    "custom web app development USA",
    "TypeScript web development agency",
    "full stack web development USA",
    "Node.js web application agency",
    "AWS web application development",
    "dashboard development agency USA",
    "SaaS web app development USA",
    "web app MVP development USA",
    "scalable web application development",
    "cloud web application development",
    "enterprise web app development USA",
  ],
  openGraph: {
    title: "Web Application Development Agency USA — React, Next.js & TypeScript | HotBot Studios",
    description: "Custom web apps built with React 19, Next.js 15, Node.js & AWS for US businesses. Scalable dashboards, platforms & data apps. 4-week MVP.",
    url: "https://hotbotstudios.com/software-development/web-app-development",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Web Application Development Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Application Development Agency USA | HotBot Studios",
    description: "React, Next.js & Node.js web apps for US businesses. Scalable, fast, and cloud-deployed. 4-week MVP.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development/web-app-development" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Web Application Development for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Custom Web Application Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom web application development using React 19, Next.js 15, TypeScript, Node.js, and AWS for US businesses. Scalable dashboards, multi-user platforms, B2B portals, and data-driven web apps with 99.9% uptime SLA.",
  url: "https://hotbotstudios.com/software-development/web-app-development",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "Web Application Development", item: "https://hotbotstudios.com/software-development/web-app-development" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How long does it take to build a custom web application?", acceptedAnswer: { "@type": "Answer", text: "A web application MVP (core features, authentication, basic dashboard) takes 4–6 weeks. A full-featured platform with complex data models, third-party integrations, and multi-tenant architecture takes 3–5 months. We use 2-week sprint cycles so you see working software every two weeks." } },
    { "@type": "Question", name: "What technologies does HotBot Studios use for web apps?", acceptedAnswer: { "@type": "Answer", text: "Frontend: React 19, Next.js 15, TypeScript, Tailwind CSS. Backend: Node.js, Python FastAPI, GraphQL, REST APIs. Database: PostgreSQL, MongoDB, Redis, Supabase. Infrastructure: AWS (EC2, RDS, S3, Lambda), Vercel, Docker, GitHub CI/CD." } },
    { "@type": "Question", name: "Do web applications work on mobile browsers?", acceptedAnswer: { "@type": "Answer", text: "Yes — all web applications we build are fully responsive, designed mobile-first, and tested across all major browsers and devices. For native mobile app experiences, we also offer React Native and Flutter mobile app development." } },
  ],
};

const SUB_SERVICES = [
  { icon: "📊", title: "Custom Dashboards & Analytics", desc: "Real-time data dashboards with complex charting, filters, export functions, and role-based access. Built for operations teams, executives, and customer-facing reporting portals. Integrates with your existing databases, APIs, and BI tools.", href: "/software-development/web-app-development" },
  { icon: "🏢", title: "B2B SaaS Web Apps", desc: "Multi-tenant web applications with team workspaces, subscription billing (Stripe), role-based permissions, and white-label options. The technical foundation for a scalable B2B SaaS product.", href: "/software-development/web-app-development" },
  { icon: "🔗", title: "Internal Business Portals", desc: "Custom-built internal tools that replace patchwork spreadsheets and legacy systems. HR portals, project management tools, inventory management, and operations dashboards — built around your exact workflow.", href: "/software-development/web-app-development" },
  { icon: "🤖", title: "AI-Powered Web Apps", desc: "Web applications with GPT-4o, Claude 3, or custom LLM integrations — intelligent search, automated data analysis, AI-powered recommendations, and natural language interfaces built natively into your web app.", href: "/software-development/web-app-development" },
  { icon: "⚡", title: "Progressive Web Apps (PWA)", desc: "Web apps that install like native apps — offline capability, push notifications, app-store-like UX — without the App Store review cycle. Built with Next.js 15 service workers and web manifest.", href: "/software-development/web-app-development" },
  { icon: "🔄", title: "Web App Modernisation", desc: "Migrate legacy web apps (jQuery, Angular 1, PHP) to modern React/Next.js architecture. Full rewrites or incremental module-by-module modernisation to reduce technical debt and improve performance.", href: "/software-development/web-app-development" },
];

const STATS = [
  { value: 99.9, suffix: "%", label: "Uptime SLA — AWS Backed", color: "#22c55e" },
  { value: 4, suffix: "wk", label: "Avg MVP Delivery", color: "#3b82f6" },
  { value: 100, suffix: "+", label: "Web Apps Shipped", color: "#8b5cf6" },
  { value: 2, suffix: "wk", label: "Sprint Cycle — Working Demo Every Sprint", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Technical Discovery", desc: "Requirements gathering, user story mapping, data model design, API contract definition, and Technical Design Document delivery. Every architectural decision documented before a line of code is written.", icon: "📋" },
  { n: 2, title: "UI/UX Design", desc: "Figma wireframes, high-fidelity designs, interactive prototype, and accessibility review. Design and engineering share the same team — zero translation loss between design intent and shipped feature.", icon: "🎨" },
  { n: 3, title: "Agile Development", desc: "2-week sprints with CI/CD pipeline, automated testing (unit + integration), code review, and a live demo at the end of every sprint. You see real, deployed software — not screenshots.", icon: "💻" },
  { n: 4, title: "QA, Launch & Monitor", desc: "End-to-end QA testing, production deployment on AWS or Vercel, Datadog/Sentry monitoring setup, and 90 days of included post-launch support. Ongoing maintenance retainers available.", icon: "🚀" },
];

const FAQS = [
  { q: "How long does it take to build a custom web application?", a: "A web app MVP (core features, authentication, basic dashboard) takes 4–6 weeks. A full-featured platform with complex data models, integrations, and multi-tenant architecture takes 3–5 months. You see working software every 2-week sprint." },
  { q: "What technologies does HotBot Studios use for web apps?", a: "React 19, Next.js 15, TypeScript, Tailwind CSS (frontend); Node.js, Python FastAPI, GraphQL, REST (backend); PostgreSQL, MongoDB, Redis, Supabase (database); AWS EC2/RDS/S3/Lambda, Vercel, Docker, GitHub CI/CD (infrastructure)." },
  { q: "Do web applications work on mobile browsers?", a: "Yes — all web apps are fully responsive and mobile-first. For native mobile experiences (offline, push notifications, app store listing), we also offer React Native and Flutter mobile development." },
  { q: "Can you add AI features to our web application?", a: "Yes — this is one of HotBot Studios' core differentiators. We can integrate GPT-4o, Claude 3, or custom fine-tuned LLMs directly into your web app: intelligent search, AI-powered recommendations, automated data analysis, natural language interfaces. See our AI automation services." },
  { q: "Do you provide hosting and infrastructure management?", a: "Yes. We set up and manage AWS or Vercel infrastructure, configure CI/CD pipelines, implement monitoring (Datadog, Sentry), and manage deployments. Infrastructure can be transferred to your AWS account so you retain full ownership." },
  { q: "Who owns the code after the project?", a: "You own 100% of the code, database schemas, and infrastructure. Full intellectual property transfer at project completion. No licensing fees, no lock-in. The source code is yours from day one in a repository you control." },
];

const RELATED = [
  { title: "Mobile App Development", href: "/software-development/mobile-app-development", desc: "Extend your web app to iOS and Android with React Native.", icon: "📱" },
  { title: "API Development & Integration", href: "/software-development/api-integrations", desc: "Build the APIs that power your web application.", icon: "🔌" },
  { title: "AI Automation", href: "/ai-automation", desc: "Embed GPT-4o and Claude directly into your web app.", icon: "🤖" },
];

export default function WebAppDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Web Application Development USA"
        title="Web Apps That Work as Hard as Your Business Does"
        subtitle="HotBot Studios builds custom web applications — dashboards, B2B SaaS platforms, internal tools, and AI-powered apps — using React 19, Next.js 15, and AWS. Fast MVPs. Scalable architecture. 99.9% uptime. You own all the code."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Custom web application development (definition):</strong> The design, engineering, and deployment of browser-based software applications built to serve a specific business function — as distinct from websites (which are primarily informational) or off-the-shelf SaaS tools (which serve generic workflows). In 2026, web applications built with React 19, Next.js 15, and cloud-native infrastructure (AWS, Vercel) offer enterprise-grade scalability, sub-second load times via server-side rendering, and the ability to integrate AI models directly into the application layer.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Tech Stack & Performance ─────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">HotBot Studios Web App Technology Stack — 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              {/* Tech layers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { layer: "Frontend", stack: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion"], color: "#3b82f6" },
                  { layer: "Backend", stack: ["Node.js", "Python FastAPI", "GraphQL", "REST APIs", "WebSockets"], color: "#8b5cf6" },
                  { layer: "Database", stack: ["PostgreSQL", "MongoDB", "Redis", "Supabase", "Prisma ORM"], color: "#06b6d4" },
                  { layer: "Infrastructure", stack: ["AWS EC2/RDS/S3", "Vercel Edge", "Docker", "GitHub CI/CD", "Cloudflare"], color: "#22c55e" },
                ].map((col, i) => (
                  <div key={i} className="p-4 rounded-2xl" style={{ background: `${col.color}10`, border: `1px solid ${col.color}25` }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: col.color }}>{col.layer}</div>
                    <div className="space-y-1.5">
                      {col.stack.map((item, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                          <span className="text-slate-300 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance benchmarks */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Performance Benchmarks — HotBot Studios Web Apps vs Industry Average</p>
              <div className="space-y-3">
                {[
                  { label: "Core Web Vitals — LCP (Largest Contentful Paint)", ours: "< 1.2s", industry: "2.5s avg", pct: 90, color: "#3b82f6" },
                  { label: "Time to Interactive (TTI)", ours: "< 1.8s", industry: "3.9s avg", pct: 80, color: "#8b5cf6" },
                  { label: "Uptime SLA", ours: "99.9%", industry: "99.5% avg", pct: 95, color: "#22c55e" },
                  { label: "Lighthouse Performance Score", ours: "95+/100", industry: "68 avg", pct: 95, color: "#06b6d4" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-64 shrink-0 text-right hidden md:block">{row.label}</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">{row.ours}</span>
                      </div>
                    </div>
                    <span className="text-slate-500 text-[10px] w-20 shrink-0 hidden md:block">Avg: {row.industry}</span>
                  </div>
                ))}
              </div>

              {/* AI layer */}
              <div className="mt-6 p-4 rounded-2xl text-center" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <span className="text-purple-300 text-sm font-medium">Optional AI Layer: GPT-4o · Claude 3 · Gemini Pro · LangChain · RAG pipelines · n8n integrations</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Web Applications We Build" columns={3} />
      <ServiceStats stats={STATS} title="Web App Delivery Track Record" />
      <ProcessSteps steps={PROCESS} title="Our Web Application Development Process" />

      {/* ── Custom vs Off-the-Shelf decision matrix ────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Web App Architecture: Choosing the Right Approach</h2>
        </Reveal>
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(59,130,246,0.08)" }}>
                <th className="text-left p-4 text-slate-300 font-semibold">Factor</th>
                <th className="text-center p-4 text-blue-400 font-semibold">Custom Web App (HotBot)</th>
                <th className="text-center p-4 text-slate-400 font-semibold">No-Code Tools</th>
                <th className="text-center p-4 text-slate-400 font-semibold">Off-the-Shelf SaaS</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Fits your exact workflow", "✅ 100%", "⚠️ Limited", "❌ Generic"],
                ["Scalability", "✅ Unlimited", "❌ Platform limits", "⚠️ Pricing tiers"],
                ["AI integration", "✅ Native", "⚠️ Via plugins", "⚠️ Vendor-dependent"],
                ["Data ownership", "✅ Full control", "❌ Platform-owned", "❌ Vendor-stored"],
                ["Monthly cost at scale", "✅ Fixed retainer", "⚠️ Per-row pricing", "❌ High per-seat"],
                ["Custom integrations", "✅ Any API", "⚠️ Limited connectors", "⚠️ Native only"],
              ].map(([factor, custom, noCode, saas], i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td className="p-4 text-slate-300 font-medium">{factor}</td>
                  <td className="p-4 text-center text-blue-300 font-semibold">{custom}</td>
                  <td className="p-4 text-center text-slate-400">{noCode}</td>
                  <td className="p-4 text-center text-slate-400">{saas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Web App Types ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Web Apps We Specialize In Building</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: "📈", title: "Ops & Analytics Dashboards", desc: "Real-time KPI dashboards connecting your CRM, ad platforms, finance tools, and operational data into a single source of truth. Role-based access, drill-down filters, and CSV/PDF export built in.", color: "#3b82f6" },
            { icon: "🏗️", title: "B2B Platform & Marketplace", desc: "Multi-sided platforms where buyers, sellers, or teams interact — with tenant isolation, permission systems, notification infrastructure, and payment flows handled at the architecture level.", color: "#8b5cf6" },
            { icon: "🔧", title: "Internal Operations Tool", desc: "Replace spreadsheets and legacy tools with a purpose-built internal web app. Workflow automation, approval chains, audit logs, and integrations with Slack, email, and your CRM — all custom-built.", color: "#06b6d4" },
            { icon: "🧠", title: "AI-Powered Web Application", desc: "Web apps where AI is a first-class feature: semantic search, intelligent form assistants, automated document processing, AI chat interfaces, or predictive analytics — GPT-4o and Claude integrated natively.", color: "#ec4899" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Web Application Development for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "React 19 and Next.js 15 web apps achieve Lighthouse 95+ scores and sub-1.2s LCP — outperforming typical SaaS tools.",
                "4-week MVP delivery using 2-week sprint cycles with working, deployed software at every demo.",
                "99.9% uptime SLA backed by AWS infrastructure with Datadog and Sentry monitoring.",
                "AI capabilities (GPT-4o, Claude 3) can be integrated as a native feature of any web application we build.",
                "You own 100% of the code, data, and infrastructure — no licensing fees, no lock-in.",
                "Post-launch: 90 days of included support, then optional maintenance retainers from $1,500/month.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Ready to Build Your Web Application?"
        subtitle="Share what you want to build — the problem, the audience, and the outcome. We'll scope it, design it, and ship a working MVP in 4 weeks. Free technical scoping call included."
        formType="get-started"
      />
    </>
  );
}
