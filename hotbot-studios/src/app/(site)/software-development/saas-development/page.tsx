import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "SaaS Platform Development Agency USA — Multi-Tenant & Stripe Billing | HotBot Studios",
  description:
    "HotBot Studios builds scalable SaaS platforms for US startups and scale-ups. Multi-tenant architecture, Stripe billing, Auth0/Clerk authentication, RBAC, and white-label capabilities. Free SaaS architecture consultation.",
  keywords: [
    "SaaS development agency USA",
    "SaaS platform development USA",
    "multi-tenant SaaS development",
    "Stripe billing integration USA",
    "B2B SaaS development agency",
    "SaaS startup development USA",
    "SaaS MVP development USA",
    "white-label SaaS development",
  ],
  alternates: { canonical: "https://hotbotstudios.com/software-development/saas-development" },
  openGraph: {
    title: "SaaS Platform Development Agency USA | HotBot Studios",
    description: "Scalable multi-tenant SaaS platforms with Stripe billing, RBAC, and white-label capabilities. Built for US startups and scale-ups.",
    url: "https://hotbotstudios.com/software-development/saas-development",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "SaaS Platform Development",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "SaaS Platform & Product Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "End-to-end SaaS platform development for US businesses — multi-tenant architecture, Stripe subscription billing, role-based access control, analytics dashboards, and white-label capabilities.",
  url: "https://hotbotstudios.com/software-development/saas-development",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "SaaS Platform Development", item: "https://hotbotstudios.com/software-development/saas-development" },
  ],
};

const CONTENT = [
  {
    heading: "What Makes SaaS Development Different — and Why It Demands a Specialist",
    body: "Building a SaaS product is not the same as building a custom web application for a single organisation. SaaS platforms must serve thousands of customers from a shared infrastructure — which introduces architectural challenges that generic web development agencies are not equipped to handle: multi-tenancy (keeping each customer's data isolated and secure within a shared database), subscription lifecycle management (trials, upgrades, downgrades, dunning, cancellations), usage-based metering, scalable background job processing, and webhook delivery infrastructure for customer integrations. Get these wrong in the early architecture and you face a painful, expensive rewrite at the worst possible moment — just as your product is gaining traction. HotBot Studios has built multi-tenant SaaS products from scratch and has the architectural playbooks that prevent these problems before they happen.",
    color: "#8b5cf6",
  },
  {
    heading: "The Technical Foundation: Multi-Tenancy, Stripe, and Auth",
    body: "Every SaaS platform HotBot Studios builds is architected around three non-negotiable foundations. Multi-tenancy: we implement row-level security in PostgreSQL (or schema-based isolation for enterprise tiers) so that a bug in one tenant's workflow can never expose another tenant's data — and so that your enterprise customers can pass their own security audits without requiring a dedicated instance. Billing: we implement Stripe Billing with subscription plans, usage metering, free trial management, upgrade and downgrade flows, failed payment recovery (dunning), and customer portal integration — the complete revenue infrastructure that turns your product into a business. Authentication: we use Clerk or Auth0 for enterprise-grade authentication with social login, SSO/SAML for enterprise customers, multi-factor authentication, and team invitation flows, because rolling your own auth in 2026 is a liability you do not need.",
    color: "#3b82f6",
  },
  {
    heading: "MVP to Growth: A SaaS Product Roadmap That Scales",
    body: "The most common mistake SaaS founders make is building too much before validating. HotBot Studios uses a disciplined MVP scope: the minimum set of features that allows a real paying customer to derive real value from your product. A well-defined SaaS MVP typically includes core product workflow, user authentication and team management, Stripe checkout and subscription management, a basic analytics dashboard for your customers, and email notifications. From that foundation, we work through a prioritised product roadmap in two-week sprints — adding integrations, advanced features, white-label capabilities, and API access based on what your paying customers are actually asking for rather than what your initial spec assumed they would need. This approach gets you to revenue faster and prevents the sunken-cost trap of building features no one uses.",
    color: "#22c55e",
  },
  {
    heading: "Scalability, Reliability, and the Infrastructure Behind a Growing SaaS",
    body: "A SaaS product that goes from zero to 1,000 customers in twelve months will face infrastructure challenges that did not exist at 50 customers: database connection pooling under concurrent load, background job queues that can process thousands of tasks without blocking the user-facing application, CDN configuration for static assets, database read replicas for analytics queries, and monitoring and alerting that tells you about problems before your customers report them. HotBot Studios designs for this scale from the first deployment using AWS RDS with read replicas, Bull or BullMQ for job queues, Redis for caching and rate limiting, Datadog or Better Uptime for observability, and auto-scaling infrastructure that grows with your user base without requiring a 2am ops intervention. Request a free architecture consultation below and we will review your current or planned stack and identify the decisions that matter most at your stage.",
    color: "#f59e0b",
  },
];

export default function SaasDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Software Development", href: "/software-development" }, { label: "Saas Development" }]} />

      <PageHeader
        label="SaaS Platform Development"
        title="The Technical Foundation Your SaaS Product Needs to Scale"
        subtitle="Multi-tenant SaaS platforms with Stripe billing, Auth0/Clerk authentication, and role-based access control — built for US startups and scale-ups that need to get to revenue fast without the architecture debt."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div className="w-1 h-10 rounded-full mb-4" style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }} />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free SaaS Architecture Consultation</h2>
            <p className="text-slate-400">Describe your SaaS product idea or current architecture challenges. We will respond with an honest technical assessment and MVP scope within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="software-saas"
            accentColor="#8b5cf6"
            title="Start Your SaaS Platform Project"
            subtitle="No obligation. Share your product vision and we will outline the architecture and build roadmap."
          />
        </Reveal>
      </section>
    </>
  );
}
