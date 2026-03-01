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
  title: "SaaS Platform Development Agency USA — Multi-Tenant SaaS & Stripe Billing | HotBot Studios",
  description:
    "HotBot Studios builds multi-tenant SaaS platforms for US startups and businesses: Stripe subscription billing, Auth0 authentication, RBAC, analytics dashboards, and white-label options. 4-week MVP. Free technical scoping.",
  keywords: [
    "SaaS development agency USA",
    "SaaS platform development USA",
    "multi-tenant SaaS development",
    "Stripe billing integration agency",
    "B2B SaaS development company USA",
    "SaaS MVP development USA",
    "SaaS startup development USA",
    "subscription software development",
    "white-label SaaS development",
    "SaaS dashboard development",
    "Auth0 integration agency",
    "role-based access control development",
    "SaaS architecture agency USA",
    "React Next.js SaaS development",
  ],
  openGraph: {
    title: "SaaS Platform Development Agency USA — Multi-Tenant, Stripe & RBAC | HotBot Studios",
    description: "Multi-tenant SaaS platforms with Stripe billing, Auth0, RBAC & analytics dashboards. 4-week MVP. US startups & businesses.",
    url: "https://hotbotstudios.com/software-development/saas-development",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "SaaS Platform Development Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Platform Development Agency USA | HotBot Studios",
    description: "Multi-tenant SaaS with Stripe billing, Auth0, RBAC & dashboards. 4-week MVP for US startups.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development/saas-development" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "SaaS Platform Development for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "SaaS Platform Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Full-stack SaaS platform development for US startups and businesses: multi-tenant architecture, Stripe subscription billing, Auth0 authentication, role-based access control, analytics dashboards, and white-label capabilities.",
  url: "https://hotbotstudios.com/software-development/saas-development",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "SaaS Platform Development", item: "https://hotbotstudios.com/software-development/saas-development" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is multi-tenant SaaS architecture and why does it matter?", acceptedAnswer: { "@type": "Answer", text: "Multi-tenant SaaS architecture means multiple customers (tenants) share a single application instance, each isolated from one another's data and configuration — as opposed to deploying a separate instance per customer. Multi-tenancy is the technical foundation of scalable SaaS businesses: it reduces infrastructure costs, simplifies deployment, enables feature rollouts to all customers simultaneously, and allows one engineering team to support thousands of customers." } },
    { "@type": "Question", name: "How do you handle Stripe subscription billing in SaaS platforms?", acceptedAnswer: { "@type": "Answer", text: "We implement Stripe Billing with Products, Prices, Subscriptions, Customer Portal, and Webhooks — covering monthly/annual plans, free trials, usage-based billing, proration on plan changes, dunning for failed payments, and Stripe Tax for US tax compliance. The customer self-service billing portal allows users to upgrade, downgrade, and cancel without support intervention." } },
    { "@type": "Question", name: "How long does it take to build a SaaS platform MVP?", acceptedAnswer: { "@type": "Answer", text: "A SaaS MVP with multi-tenant architecture, Stripe billing, Auth0 authentication, RBAC, and a core feature set takes 8–12 weeks. The MVP scope covers user onboarding, subscription checkout, the core value feature, and a basic admin dashboard. Full platforms with advanced analytics, white-label, and complex integrations take 4–8 months." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🏗️", title: "Multi-Tenant Architecture", desc: "Properly isolated multi-tenant databases and application layers — shared schema or schema-per-tenant depending on security requirements. Built to scale from 10 to 100,000 customers without architectural rework.", href: "/software-development/saas-development" },
  { icon: "💳", title: "Stripe Subscription Billing", desc: "Stripe Billing integration covering monthly/annual plans, free trials, usage-based billing, proration, dunning, tax compliance, and a self-service Customer Portal. Revenue data synced to your CRM and analytics stack.", href: "/software-development/saas-development" },
  { icon: "🔐", title: "Authentication & RBAC", desc: "Auth0 or Supabase Auth integration with social login (Google, GitHub, Microsoft), SSO (SAML, OIDC), MFA, and role-based access control (Admin, Manager, Viewer, Custom) with permission inheritance.", href: "/software-development/saas-development" },
  { icon: "📊", title: "Product Analytics & Dashboards", desc: "Built-in customer-facing analytics dashboards with usage metrics, feature adoption tracking, and exportable reports. Backend admin dashboard with MRR, churn, customer health, and cohort analysis.", href: "/software-development/saas-development" },
  { icon: "🏷️", title: "White-Label & Custom Domains", desc: "White-label capabilities allowing your customers to rebrand the platform as their own — custom domains, logo replacement, custom colour themes, and email sending domain configuration.", href: "/software-development/saas-development" },
  { icon: "🔔", title: "Notification & Workflow Infrastructure", desc: "Transactional email (Resend/SendGrid), in-app notifications, Slack webhooks, and webhook delivery infrastructure so customers can connect your SaaS to their own tools — a critical feature for enterprise sales.", href: "/software-development/saas-development" },
];

const STATS = [
  { value: 30, suffix: "+", label: "SaaS Platforms Shipped", color: "#8b5cf6" },
  { value: 8, suffix: "wk", label: "Avg SaaS MVP Delivery", color: "#3b82f6" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", color: "#22c55e" },
  { value: 100, suffix: "%", label: "Code & IP Ownership — Yours", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "SaaS Architecture Design", desc: "Tenant isolation strategy, data model design, billing plan architecture, permission system design, and infrastructure blueprint. Delivered as a Technical Design Document with diagrammed architecture before any development begins.", icon: "📋" },
  { n: 2, title: "Core Infrastructure Build", desc: "Authentication, multi-tenancy, billing, and RBAC built in Sprint 1 — the non-negotiable foundation every SaaS product needs before a single feature is built on top.", icon: "🏗️" },
  { n: 3, title: "Feature Development", desc: "2-week sprint cycles building your core product features on top of the SaaS infrastructure. Live demo at the end of every sprint with a working, deployed build you can share with pilot customers.", icon: "💻" },
  { n: 4, title: "Beta Launch & Scale", desc: "Onboard your first customers, monitor system behaviour at real load, fix edge cases, and iterate. 90 days of included post-launch support plus optional engineering retainer for ongoing feature development.", icon: "🚀" },
];

const FAQS = [
  { q: "What is multi-tenant SaaS architecture and why does it matter?", a: "Multi-tenancy means multiple customers share a single application instance with data isolation — the foundation of scalable SaaS. It reduces infrastructure costs, simplifies deployment, enables simultaneous feature rollouts, and lets one team support thousands of customers." },
  { q: "How do you handle Stripe subscription billing?", a: "We implement Stripe Billing covering monthly/annual plans, free trials, usage-based billing, proration, dunning for failed payments, and Stripe Tax for US compliance. The self-service Customer Portal lets users upgrade, downgrade, and cancel without support intervention." },
  { q: "How long does it take to build a SaaS MVP?", a: "A SaaS MVP with multi-tenancy, Stripe billing, Auth0 authentication, RBAC, and a core feature set takes 8–12 weeks. Full platforms with advanced analytics, white-label, and complex integrations take 4–8 months." },
  { q: "What authentication providers do you support?", a: "Auth0 (enterprise-grade, SAML/OIDC SSO, MFA), Supabase Auth (cost-effective, built-in row-level security), and Clerk (fastest developer experience, built-in UI components). We recommend based on your security requirements, budget, and team. Social login (Google, GitHub, Microsoft) is standard." },
  { q: "Can you build white-label features into our SaaS?", a: "Yes — white-labelling is a common requirement for SaaS companies selling to agencies or enterprise customers. We implement custom domain support (CNAME), logo/colour theme replacement, custom email sending domains, and optionally a reseller management dashboard." },
  { q: "How do you ensure data isolation between tenants?", a: "Depending on your security requirements and scale, we implement shared-schema isolation (row-level security via PostgreSQL RLS for cost efficiency) or schema-per-tenant isolation (stronger guarantees, preferred for enterprise/regulated industries). Both approaches are rigorously tested with penetration testing before launch." },
];

const RELATED = [
  { title: "Web Application Development", href: "/software-development/web-app-development", desc: "The foundational web app layer your SaaS is built on.", icon: "🌐" },
  { title: "API Development & Integration", href: "/software-development/api-integrations", desc: "Expose your SaaS functionality via APIs for enterprise customers.", icon: "🔌" },
  { title: "AI Automation", href: "/ai-automation", desc: "Add AI agents and LLM features to differentiate your SaaS.", icon: "🤖" },
];

export default function SaasDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="SaaS Platform Development USA"
        title="Build the SaaS Product Your Market Has Been Waiting For"
        subtitle="HotBot Studios engineers multi-tenant SaaS platforms from architecture to launch — covering Stripe billing, Auth0, RBAC, analytics dashboards, and white-label capabilities. Your product, your IP, your customers. 8-week MVP delivery."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">SaaS platform development (definition):</strong> The design and engineering of a Software-as-a-Service product — a cloud-hosted application delivered via subscription to multiple customers (tenants) over the internet. A production-ready SaaS platform requires multi-tenant data architecture (tenant isolation), subscription billing infrastructure (Stripe), user authentication with SSO and MFA (Auth0), role-based access control (RBAC), customer-facing analytics, and a reliable deployment pipeline with 99.9%+ uptime. Getting the foundational architecture right is critical — retrofitting multi-tenancy or billing into a poorly architected system is expensive and technically risky.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: SaaS Architecture Overview ────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">SaaS Platform Architecture — What We Build and Why It Matters</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="p-6 md:p-8">
              {/* Architecture layers */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">SaaS Platform Architecture Layers — HotBot Studios Stack</p>
              <div className="space-y-3 mb-8">
                {[
                  { layer: "Presentation Layer", tech: "Next.js 15 · React 19 · Tailwind CSS · Framer Motion", purpose: "Customer-facing app + admin dashboard", color: "#3b82f6" },
                  { layer: "Auth & Identity Layer", tech: "Auth0 / Clerk · SAML SSO · MFA · RBAC", purpose: "Secure, scalable multi-user access control", color: "#8b5cf6" },
                  { layer: "Billing & Revenue Layer", tech: "Stripe Billing · Customer Portal · Webhooks · Stripe Tax", purpose: "Subscription management, trials, usage billing", color: "#ec4899" },
                  { layer: "Application Layer", tech: "Node.js / FastAPI · GraphQL / REST · Background Jobs", purpose: "Business logic, integrations, async processing", color: "#06b6d4" },
                  { layer: "Data Layer", tech: "PostgreSQL (RLS) · Redis · S3 · Prisma ORM", purpose: "Tenant-isolated data storage and caching", color: "#22c55e" },
                  { layer: "Infrastructure Layer", tech: "AWS / Vercel · Docker · GitHub CI/CD · Datadog", purpose: "99.9% uptime, auto-scaling, monitoring", color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${row.color}08`, border: `1px solid ${row.color}18` }}>
                    <div className="w-2 h-8 rounded-full shrink-0" style={{ background: row.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold mb-0.5" style={{ color: row.color }}>{row.layer}</div>
                      <div className="text-slate-300 text-xs truncate">{row.tech}</div>
                    </div>
                    <div className="text-slate-500 text-[10px] w-40 shrink-0 hidden md:block text-right">{row.purpose}</div>
                  </div>
                ))}
              </div>

              {/* Key SaaS metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { pct: "8wk", label: "average SaaS MVP delivery at HotBot Studios", color: "#8b5cf6" },
                  { pct: "30+", label: "SaaS platforms shipped across B2B verticals", color: "#3b82f6" },
                  { pct: "99.9%", label: "uptime SLA backed by AWS infrastructure", color: "#22c55e" },
                  { pct: "0", label: "licensing fees — 100% of code and IP is yours", color: "#f59e0b" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="SaaS Platform Features We Build" columns={3} />
      <ServiceStats stats={STATS} title="SaaS Development Track Record" />
      <ProcessSteps steps={PROCESS} title="Our SaaS Platform Development Process" />

      {/* ── SaaS Billing Plan Types ────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Billing Models We Implement</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: "📅", title: "Flat-Rate Subscription", desc: "Monthly or annual flat fee per workspace or per account. Simplest implementation — best for predictable MRR and low-complexity products. Free trial with automatic conversion at trial end.", color: "#3b82f6" },
            { icon: "👤", title: "Per-Seat / Per-User", desc: "Charge per active user or seat. Aligns cost with customer value as teams grow. Requires seat management UI, overage handling, and admin controls for adding/removing users.", color: "#8b5cf6" },
            { icon: "📊", title: "Usage-Based Billing", desc: "Charge per API call, message, record, or unit of consumption. Requires metering infrastructure (event tracking, aggregation) and Stripe usage-based billing integration. Lowest barrier to entry for customers.", color: "#06b6d4" },
            { icon: "🎯", title: "Hybrid (Seat + Usage)", desc: "Base subscription fee plus usage overages — the model used by Twilio, OpenAI, and Stripe itself. Best of both worlds: predictable base MRR with upside from high-usage customers.", color: "#ec4899" },
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
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — SaaS Platform Development for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "Multi-tenant architecture, Stripe billing, Auth0, and RBAC are built first — the SaaS foundation that all features run on.",
                "8-week average SaaS MVP delivery, with a live product and first customers onboarded before the 12-week mark.",
                "Stripe Billing implementation covers subscriptions, trials, usage-based billing, dunning, proration, and US tax compliance.",
                "White-label support enables enterprise and agency customers to rebrand your platform as their own — unlocking new revenue channels.",
                "You own 100% of the SaaS platform code, database schemas, and infrastructure — no licensing fees, no lock-in.",
                "AI features (GPT-4o, Claude 3, LangChain) can be integrated as core product differentiators, not afterthoughts.",
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
        title="Ready to Build Your SaaS Platform?"
        subtitle="Share your SaaS idea — the problem, the customer, and the key feature. We'll design the architecture, scope the MVP, and ship a working product with real customers in 8 weeks. Free technical scoping call."
        formType="get-started"
      />
    </>
  );
}
