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
  title: "Enterprise Software Development USA — Custom CRM, ERP & Internal Portals | HotBot Studios",
  description:
    "HotBot Studios builds custom enterprise software for US businesses: CRM systems, ERP integrations, internal portals, workflow tools, and compliance-grade applications. SSO, RBAC, SOC 2 ready. Free technical discovery.",
  keywords: [
    "enterprise software development USA",
    "custom CRM development USA",
    "ERP integration agency USA",
    "internal portal development USA",
    "enterprise web application USA",
    "custom enterprise software USA",
    "SSO integration development",
    "SAML authentication development",
    "enterprise workflow software",
    "compliance software development USA",
    "SOC 2 software development",
    "HIPAA compliant software development",
    "legacy system modernisation USA",
    "B2B enterprise platform development",
  ],
  openGraph: {
    title: "Enterprise Software Development USA — Custom CRM, ERP & Internal Portals | HotBot Studios",
    description: "Custom enterprise software for US businesses: CRM systems, ERP integrations, internal portals & compliance-grade apps. SSO, RBAC, SOC 2 ready.",
    url: "https://hotbotstudios.com/software-development/enterprise-software",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Enterprise Software Development USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Software Development USA | HotBot Studios",
    description: "Custom CRM, ERP integrations & internal portals for US enterprises. SSO, RBAC, SOC 2 compliant.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development/enterprise-software" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Enterprise Software Development for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Enterprise Software Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom enterprise software development for US businesses: CRM systems, ERP integrations, internal portals, workflow management tools, and compliance-grade applications with SSO, RBAC, and audit trail capabilities.",
  url: "https://hotbotstudios.com/software-development/enterprise-software",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "Enterprise Systems & Portals", item: "https://hotbotstudios.com/software-development/enterprise-software" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between a custom CRM and an off-the-shelf CRM?", acceptedAnswer: { "@type": "Answer", text: "An off-the-shelf CRM (Salesforce, HubSpot) provides generic sales pipeline and contact management tools designed to serve thousands of business types. A custom CRM is built around your specific sales process, data model, and workflow — capturing exactly the data your team needs, automating your unique follow-up sequences, and integrating with your proprietary systems. Custom CRMs typically cost less per year than Salesforce Enterprise at scale and provide a competitive moat your team can't recreate in a generic tool." } },
    { "@type": "Question", name: "How do you handle SSO and enterprise authentication?", acceptedAnswer: { "@type": "Answer", text: "We implement SAML 2.0 and OIDC-based SSO via Auth0, Okta, or Azure AD — allowing enterprise employees to log in with their existing corporate credentials. This includes Just-In-Time (JIT) provisioning (accounts created on first SSO login), group-to-role mapping from your identity provider, and session management aligned with your corporate security policies." } },
    { "@type": "Question", name: "Can you build software that meets HIPAA or SOC 2 compliance requirements?", acceptedAnswer: { "@type": "Answer", text: "Yes. For HIPAA, we implement required technical safeguards: data encryption at rest and in transit (AES-256, TLS 1.3), audit logs for all PHI access, role-based access control, automatic session timeout, and BAA (Business Associate Agreement) compatibility. For SOC 2, we architect security controls (CC6.1–CC9.2) and can provide evidence documentation for your auditor. We recommend engaging a compliance consultant alongside our engineering work for regulated industries." } },
  ],
};

const SUB_SERVICES = [
  { icon: "📋", title: "Custom CRM Systems", desc: "Bespoke CRM applications built around your exact sales process — custom pipeline stages, automated follow-up sequences, lead scoring, activity tracking, and deep integration with your email, calendar, and marketing stack.", href: "/software-development/enterprise-software" },
  { icon: "🏭", title: "ERP Integration & Custom ERP Modules", desc: "Connect modern applications to your ERP (SAP, Oracle, Microsoft Dynamics, NetSuite) via API middleware, or build custom ERP modules for processes your enterprise software doesn't handle natively.", href: "/software-development/enterprise-software" },
  { icon: "🏢", title: "Employee & Customer Portals", desc: "Self-service portals for employees (HR, IT, benefits, onboarding) and customers (account management, billing, support, usage dashboards) — reducing support volume and improving experience simultaneously.", href: "/software-development/enterprise-software" },
  { icon: "⚙️", title: "Workflow & Approval Systems", desc: "Custom workflow management tools with configurable approval chains, notification rules, SLA tracking, audit trails, and escalation logic — replacing email-based workflows with structured, accountable processes.", href: "/software-development/enterprise-software" },
  { icon: "🔐", title: "SSO & Enterprise Authentication", desc: "SAML 2.0 and OIDC SSO integration with Okta, Azure AD, and Google Workspace. JIT provisioning, group-to-role mapping, MFA enforcement, and session policies aligned with corporate security requirements.", href: "/software-development/enterprise-software" },
  { icon: "🏥", title: "Compliance-Grade Applications", desc: "Software built to HIPAA, SOC 2, CCPA, and GDPR technical requirements — encryption at rest and in transit, comprehensive audit logs, data residency controls, and right-to-erasure functionality.", href: "/software-development/enterprise-software" },
];

const STATS = [
  { value: 50, suffix: "+", label: "Enterprise Systems Delivered", color: "#3b82f6" },
  { value: 99.9, suffix: "%", label: "Uptime SLA — AWS Enterprise", color: "#22c55e" },
  { value: 100, suffix: "%", label: "IP & Code Ownership — Yours", color: "#8b5cf6" },
  { value: 90, suffix: "day", label: "Post-Launch Support Included", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Enterprise Discovery", desc: "Stakeholder interviews, process mapping, compliance requirements gathering, existing system audit, and integration point identification. Delivered as a Requirements Specification and Technical Architecture document.", icon: "🔍" },
  { n: 2, title: "Security & Compliance Architecture", desc: "Authentication model (SSO, RBAC), data classification, encryption requirements, audit log design, and compliance control mapping — designed before any development begins.", icon: "🔐" },
  { n: 3, title: "Phased Development", desc: "Enterprise projects are delivered in phases — core infrastructure first, then modules in priority order. Each phase delivers usable, tested software. No 12-month waterfall projects where you see nothing until the end.", icon: "💻" },
  { n: 4, title: "UAT, Rollout & Handover", desc: "User acceptance testing with your internal teams, staged rollout (pilot group then full organisation), admin training, technical documentation, and transition to your internal IT team or our ongoing maintenance retainer.", icon: "🚀" },
];

const FAQS = [
  { q: "What is the difference between a custom CRM and an off-the-shelf CRM?", a: "Off-the-shelf CRMs (Salesforce, HubSpot) are designed for thousands of business types — generic pipelines and generic data models. A custom CRM is built around your exact process, capturing only the data you need and automating your unique workflows. At scale, custom CRMs typically cost less than Salesforce Enterprise licences and provide a competitive moat." },
  { q: "How do you handle SSO and enterprise authentication?", a: "SAML 2.0 and OIDC-based SSO via Auth0, Okta, or Azure AD — allowing employees to log in with existing corporate credentials. Includes JIT provisioning (accounts created on first SSO login), group-to-role mapping from your identity provider, and session policies aligned with corporate security." },
  { q: "Can you build software that meets HIPAA or SOC 2 compliance requirements?", a: "Yes. HIPAA: AES-256 encryption at rest, TLS 1.3 in transit, comprehensive PHI access audit logs, RBAC, automatic session timeout, BAA-compatible architecture. SOC 2: security controls (CC6.1–CC9.2) with evidence documentation for your auditor." },
  { q: "How do you handle legacy system integration?", a: "We build middleware adapters, ETL pipelines, and API translation layers that connect modern applications to legacy ERP, CRM, and database systems — without requiring changes to the legacy system. Message queues (RabbitMQ, AWS SQS) handle async integration for systems that don't support real-time APIs." },
  { q: "Do you provide documentation and training for enterprise software?", a: "Yes — enterprise deliverables include a Technical Architecture Document, Admin User Guide, End-User Documentation, API documentation (if applicable), and a Runbook for your IT team. Training sessions for admin users and pilot groups are included in the project scope." },
  { q: "What is the typical timeline for an enterprise software project?", a: "Enterprise projects typically follow a phased approach: Phase 1 (core infrastructure, auth, RBAC) in 6–8 weeks, Phase 2 (primary workflows) in 8–12 weeks, Phase 3 (integrations, reporting) in 4–8 weeks. Total: 4–6 months for most enterprise projects. We can accelerate with a larger team if timeline is critical." },
];

const RELATED = [
  { title: "API Development & Integration", href: "/software-development/api-integrations", desc: "Connect your enterprise software to ERP, CRM, and third-party systems.", icon: "🔌" },
  { title: "AI Automation", href: "/ai-automation", desc: "Add AI agents to automate enterprise workflows and decisions.", icon: "🤖" },
  { title: "Web Application Development", href: "/software-development/web-app-development", desc: "The web application foundation your enterprise software runs on.", icon: "🌐" },
];

export default function EnterpriseSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Enterprise Software Development USA"
        title="Enterprise-Grade Software Built Exactly for Your Business"
        subtitle="Off-the-shelf enterprise tools compromise your process to fit their product. HotBot Studios builds custom CRM systems, ERP integrations, employee portals, and compliance-grade workflow tools that fit your organisation exactly — with SSO, RBAC, and full audit trails."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Enterprise software development (definition):</strong> The design and engineering of large-scale, mission-critical software applications for use within organisations — including custom CRM systems, ERP integration middleware, employee and customer portals, internal workflow tools, and compliance-grade platforms. Enterprise software must meet requirements that consumer applications do not: Single Sign-On (SSO) with corporate identity providers, Role-Based Access Control (RBAC) with granular permissions, comprehensive audit logs for compliance, high availability (99.9%+ SLA), and integration with existing enterprise systems such as Salesforce, SAP, Oracle, or Microsoft Dynamics.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Enterprise Software ROI ───────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">When Custom Enterprise Software Pays for Itself</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "40%", label: "of enterprise software licences are unused or underutilised (Gartner 2025)", color: "#3b82f6" },
                  { pct: "74%", label: "of organisations say custom software gives competitive advantage over SaaS alternatives", color: "#8b5cf6" },
                  { pct: "$9,100", label: "average annual per-user cost of Salesforce Enterprise — custom CRM often 3–5× cheaper at scale", color: "#ec4899" },
                  { pct: "18mo", label: "average payback period for custom enterprise software vs equivalent SaaS licences", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-xl md:text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Enterprise requirements checklist */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Enterprise Software Requirements — What We Build In By Default</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { req: "SAML / OIDC SSO", detail: "Okta, Azure AD, Google Workspace", color: "#3b82f6" },
                  { req: "Role-Based Access Control", detail: "Granular permissions, inheritance", color: "#8b5cf6" },
                  { req: "Audit Logs", detail: "Every action logged with user, timestamp, IP", color: "#06b6d4" },
                  { req: "Data Encryption", detail: "AES-256 at rest, TLS 1.3 in transit", color: "#22c55e" },
                  { req: "99.9% Uptime SLA", detail: "AWS multi-AZ, auto-scaling, Datadog", color: "#f59e0b" },
                  { req: "Compliance Ready", detail: "HIPAA, SOC 2, CCPA, GDPR controls", color: "#ec4899" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <div className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.req}</div>
                    <div className="text-slate-500 text-[10px]">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Enterprise Software We Build" columns={3} />
      <ServiceStats stats={STATS} title="Enterprise Delivery Track Record" />
      <ProcessSteps steps={PROCESS} title="Our Enterprise Software Development Process" />

      {/* ── Custom vs Off-the-Shelf Enterprise ────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Custom Enterprise Software vs Generic SaaS — The Real Comparison</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              icon: "✅", title: "Build Custom When…", color: "#22c55e",
              points: [
                "Your process is a competitive differentiator that off-the-shelf tools would commoditise",
                "You're spending $50K+/year in enterprise SaaS that still doesn't do what you need",
                "Compliance (HIPAA, SOC 2) requires data residency or controls a SaaS vendor won't provide",
                "Deep integration with proprietary or legacy systems is required",
                "Multi-tenant or white-label capabilities are needed for your own customers",
                "You want to own the system outright — no vendor lock-in, no per-seat licence inflation",
              ],
            },
            {
              icon: "⚠️", title: "Stick with SaaS When…", color: "#f59e0b",
              points: [
                "Your needs are generic and fully served by an existing enterprise tool",
                "Speed of deployment is more important than fit (you need it live next week)",
                "Your team lacks the internal capacity to manage a custom system long-term",
                "The total licence cost is lower than the custom development + maintenance cost",
                "The vendor's roadmap is aligned with your feature needs for the next 2+ years",
                "You're in a pre-revenue or very early stage where assumptions are still being validated",
              ],
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold mb-3 text-lg" style={{ color: item.color }}>{item.title}</h3>
                <div className="space-y-2">
                  {item.points.map((point, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 text-slate-500">›</span>
                      <span className="text-slate-400 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
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
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Enterprise Software Development for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "Custom enterprise software delivers competitive advantage that off-the-shelf tools cannot replicate — 74% of enterprises report this.",
                "40% of enterprise SaaS licences are unused — custom software eliminates licence waste and adapts to your exact process.",
                "All enterprise software includes SAML/OIDC SSO, RBAC, AES-256 encryption, and comprehensive audit logs by default.",
                "HIPAA and SOC 2 compliant architectures available — encryption, audit trails, data residency, and compliance control documentation.",
                "Phased delivery: core infrastructure in 6–8 weeks, primary workflows in 8–12 weeks — no 12-month waterfall projects.",
                "You own 100% of the code, data models, and infrastructure — no vendor lock-in, no per-seat licence inflation at scale.",
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
        title="Ready to Replace Your Legacy Enterprise Tools?"
        subtitle="Tell us the system you need — a custom CRM, internal portal, or workflow tool — and the enterprise requirements it must meet. We'll design the architecture and deliver a phased build that goes live in weeks, not months."
        formType="get-started"
      />
    </>
  );
}
