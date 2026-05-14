import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Custom Software Development Agency USA — Web Apps, Mobile & SaaS | HotBot Studios",
  description:
    "HotBot Studios builds custom web apps, mobile apps, SaaS platforms, and API integrations for US businesses. React, Next.js, Node.js, AWS. 4-week MVP delivery. 99.9% uptime SLA. 100+ apps shipped.",
  keywords: [
    "custom software development agency USA",
    "web app development agency USA",
    "SaaS development company USA",
    "React Next.js development agency",
    "mobile app development USA",
    "MVP development agency USA",
    "API development company",
    "Node.js development agency USA",
    "e-commerce development agency",
    "enterprise software development USA",
    "software development outsourcing USA",
    "startup software development USA",
    "full stack development agency",
    "cloud application development AWS",
  ],
  openGraph: {
    title: "Custom Software Development Agency USA — Web Apps, Mobile & SaaS | HotBot Studios",
    description: "Custom web apps, mobile apps, SaaS platforms & APIs for US businesses. React, Next.js, Node.js, AWS. 4-week MVP delivery. 100+ apps shipped.",
    url: "https://hotbotstudios.com/software-development",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Software Development Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Software Development Agency USA | HotBot Studios",
    description: "Custom web apps, SaaS, mobile & APIs for US businesses. 4-week MVP. 100+ apps shipped.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development" },
};

// ── Schema Markup ───────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Software Development for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Software Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom web apps, mobile apps, SaaS platforms, and API integrations built with React, Next.js, Node.js, and AWS for US businesses. 4-week MVP delivery, 99.9% uptime SLA, 100+ apps shipped.",
  url: "https://hotbotstudios.com/software-development",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What technologies does HotBot Studios use for software development?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios builds with React, Next.js, Node.js, Python, TypeScript, PostgreSQL, MongoDB, AWS, Vercel, and Docker. We select the right technology stack for each project's specific requirements and scale needs." } },
    { "@type": "Question", name: "How long does it take to build an MVP?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios delivers MVPs in 4–8 weeks. Full SaaS platforms take 3–6 months depending on complexity. We use phased delivery so you get a working product early and iterate based on real user feedback." } },
    { "@type": "Question", name: "Who owns the code after a software project with HotBot Studios?", acceptedAnswer: { "@type": "Answer", text: "You own 100% of the code, assets, and infrastructure. HotBot Studios transfers full intellectual property at project completion, with no ongoing licensing fees." } },
  ],
};

// ── Content Data ─────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🌐", title: "Web Applications", desc: "Scalable, high-performance web apps built with React, Next.js 15, and TypeScript on cloud infrastructure (AWS, Vercel, GCP). From dashboards to complex multi-user platforms.", href: "/software-development/web-app-development" },
  { icon: "📱", title: "Mobile Apps (iOS & Android)", desc: "Cross-platform mobile apps built with React Native and Flutter. Native performance, single codebase, deployed to both App Store and Google Play.", href: "/software-development/mobile-app-development" },
  { icon: "☁️", title: "SaaS Platform Development", desc: "Multi-tenant SaaS platforms with Stripe billing, Auth0 authentication, role-based access control, analytics dashboards, and white-label capabilities.", href: "/software-development/saas-development" },
  { icon: "🔌", title: "API Development & Integration", desc: "RESTful and GraphQL APIs that power your products, integrate your tools, and expose your data. OpenAPI specification, rate limiting, and enterprise-grade security.", href: "/software-development/api-integrations" },
  { icon: "🛒", title: "E-Commerce Development", desc: "Custom Shopify apps, headless commerce (Next.js + Shopify/WooCommerce), and bespoke checkout experiences engineered for maximum conversion rate.", href: "/software-development/ecommerce-development" },
  { icon: "🔐", title: "Enterprise Systems & Portals", desc: "Custom CRM systems, ERP integrations, internal portals, and enterprise workflow tools built to your exact specifications with SSO and compliance requirements.", href: "/software-development/enterprise-software" },
];

const STATS = [
  { value: 100, suffix: "+", label: "Apps Shipped", color: "#3b82f6" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", color: "#22c55e" },
  { value: 4, suffix: "wk", label: "Avg MVP Delivery", color: "#8b5cf6" },
  { value: 50, suffix: "+", label: "Tech Integrations", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Discovery & Architecture", desc: "Detailed requirements gathering, technical architecture planning, database design, and project scoping. Delivered as a Technical Design Document before any code is written.", icon: "📋" },
  { n: 2, title: "UI/UX Design", desc: "Wireframes, high-fidelity Figma designs, user journey mapping, and interactive prototype sign-off before development begins. Design and dev in one team means zero translation loss.", icon: "🎨" },
  { n: 3, title: "Agile Development", desc: "2-week sprint cycles with demo reviews, CI/CD pipeline, automated testing, and code reviews. You see working software every two weeks — not just status updates.", icon: "💻" },
  { n: 4, title: "Launch, Monitor & Support", desc: "QA testing, production deployment, uptime monitoring setup (Datadog/Sentry), and 90 days of included post-launch support. Ongoing maintenance retainers available.", icon: "🚀" },
];

const FAQS = [
  { q: "What technologies does HotBot Studios use?", a: "React, Next.js 15, Node.js, Python (FastAPI/Django), TypeScript, PostgreSQL, MongoDB, Redis, AWS (EC2, RDS, S3, Lambda), Vercel, Docker, and Kubernetes for enterprise deployments. We select the right stack for each project's needs." },
  { q: "How long does a typical software project take?", a: "MVPs take 4–8 weeks. Full SaaS platforms take 3–6 months. Enterprise systems take 6–12 months. We break every project into phases to deliver working software early and iterate based on real user feedback." },
  { q: "Do you offer ongoing maintenance after launch?", a: "Yes. All projects include 90 days of post-launch support. Ongoing maintenance retainers are available from $1,500/month, including monitoring, updates, security patches, and feature development." },
  { q: "Who owns the code and IP?", a: "You own 100% of the code, database schemas, design assets, and cloud infrastructure. We transfer full ownership at project completion. No ongoing licensing fees, no lock-in." },
  { q: "Can you add AI features to our software?", a: "Yes — and this is where HotBot Studios is uniquely differentiated. Our AI automation team can integrate GPT-4o, Claude 3, or custom fine-tuned models directly into your software product. Intelligent search, AI-powered recommendations, automated data analysis, and more. See our AI automation services." },
];

const RELATED = [
  { title: "AI Automation", href: "/ai-automation", desc: "Add intelligent AI capabilities to your software.", icon: "🤖" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "User-centered design built by the same team.", icon: "🎨" },
  { title: "Digital Marketing", href: "/digital-marketing", desc: "Launch your product to the right US audience.", icon: "📣" },
];

export default function SoftwareDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Software Development", href: "/software-development" }]} />

      <PageHeader
        label="Software Development Agency USA"
        title="Software That Scales With Your Ambition"
        subtitle="HotBot Studios turns software ideas into shipped, scalable products — from a 4-week MVP to validate your market, to an enterprise platform handling millions of users. 100+ apps shipped. 99.9% uptime SLA. You own all the code."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Custom software development (definition):</strong> The design, development, testing, and deployment of software applications built specifically for a business&apos;s unique requirements — as opposed to off-the-shelf solutions. Custom software provides competitive differentiation, full ownership, and the ability to integrate AI capabilities, third-party APIs, and business-specific logic that generic SaaS tools cannot replicate.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Tech Stack Infographic ────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">HotBot Studios Technology Stack — 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { layer: "Frontend", stack: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS"], color: "#3b82f6" },
                  { layer: "Backend", stack: ["Node.js", "Python FastAPI", "GraphQL", "REST APIs"], color: "#8b5cf6" },
                  { layer: "Database", stack: ["PostgreSQL", "MongoDB", "Redis", "Supabase"], color: "#06b6d4" },
                  { layer: "Infrastructure", stack: ["AWS", "Vercel", "Docker", "CI/CD GitHub"], color: "#22c55e" },
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
              <div className="mt-6 p-4 rounded-2xl text-center" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <span className="text-purple-300 text-sm font-medium">AI Layer (optional): GPT-4o · Claude 3 · Gemini Pro · n8n · Sarvam AI · LangChain · RAG pipelines</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Software We Build" columns={3} />
      <ServiceStats stats={STATS} title="Software Delivery Track Record" />
      <ProcessSteps steps={PROCESS} title="Our Software Development Process" />

      {/* ── Internal Link: AI Integration ───────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-6">
        <Reveal>
          <div className="p-6 rounded-2xl flex items-start gap-4"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="text-3xl shrink-0">🤖</div>
            <div>
              <h3 className="font-bold text-white mb-1">Want AI Built Into Your Software?</h3>
              <p className="text-slate-400 text-sm mb-3">HotBot Studios can integrate custom AI agents, GPT-4o, or fine-tuned LLMs directly into any software product we build. Intelligent search, automated data analysis, AI-powered recommendations, and more.</p>
              <Link href="/ai-automation" className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors">
                Explore AI Automation Services →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Custom Software vs Off-the-Shelf ─────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-4">When Should You Build Custom Software?</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            Off-the-shelf SaaS tools work well for generic workflows. But the moment your business has a unique process, a
            competitive differentiator worth protecting, or a customer experience that no template can replicate — custom software
            is the only path to sustainable advantage. Here&apos;s how to know which situation you&apos;re in.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "✅",
                title: "Build Custom When…",
                color: "#22c55e",
                points: [
                  "Your workflow is a competitive moat that off-the-shelf tools would expose to competitors",
                  "You&apos;re paying $5,000+/month in SaaS subscriptions for tools that still don&apos;t do exactly what you need",
                  "You need deep integrations across your CRM, ERP, and internal systems that no native connector supports",
                  "Your business model requires multi-tenancy, white-labeling, or customer-specific customization at scale",
                  "You want to embed AI capabilities (GPT-4o, Claude) tailored to your proprietary data and workflows",
                  "You need full data ownership and control for compliance (HIPAA, SOC 2, CCPA, GDPR)",
                ],
              },
              {
                icon: "⚠️",
                title: "Stick with SaaS When…",
                color: "#f59e0b",
                points: [
                  "Your needs are fully covered by an existing product and you have no immediate plans to differentiate",
                  "You&apos;re pre-revenue and need to move fast without engineering investment",
                  "The workflow is generic enough that customization provides no competitive advantage",
                  "You&apos;re not ready to invest in ongoing engineering maintenance and iteration",
                  "A no-code tool (Notion, Airtable, HubSpot) already solves 90%+ of the problem",
                  "Speed to market matters more than a perfect fit — use SaaS now, build custom later",
                ],
              },
            ].map((col, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl h-full" style={{ background: `${col.color}08`, border: `1px solid ${col.color}20` }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: col.color }}>
                    <span>{col.icon}</span> {col.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="shrink-0 mt-0.5" style={{ color: col.color }}>›</span>
                        <span dangerouslySetInnerHTML={{ __html: pt.replace(/&apos;/g, "'") }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="text-slate-500 text-xs text-center mt-6 max-w-2xl mx-auto">
              Not sure which path is right for your business? HotBot Studios offers a free 30-minute technical scoping call to
              help you make the right decision — no sales pressure, just an honest assessment.
            </p>
          </Reveal>
        </Reveal>
      </section>

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Custom Software Development for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios has shipped 100+ apps for US businesses using React, Next.js, Node.js, Python, and AWS.",
                "MVPs are delivered in 4–8 weeks with a working product — not just wireframes or prototypes.",
                "You own 100% of the code, IP, and infrastructure. No licensing fees, no lock-in.",
                "99.9% uptime SLA backed by AWS infrastructure with Datadog/Sentry monitoring.",
                "AI capabilities (GPT-4o, Claude, custom LLMs) can be integrated into any software product we build.",
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
        title="Have a Software Idea?"
        subtitle="Tell us what you're building. We'll scope it, design it, build it, and ship it — with full transparency at every sprint. Free technical scoping call included."
        formType="get-started"
      />
    </>
  );
}
