import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "MarTech Stack Design & Implementation USA | HubSpot · Salesforce | HotBot Studios",
  description:
    "MarTech stack design and implementation for US businesses. CRM (HubSpot, Salesforce), marketing automation (Marketo, ActiveCampaign), analytics, and AI tool selection, configuration, and integration.",
  keywords: [
    "MarTech stack consulting USA",
    "HubSpot implementation USA",
    "Salesforce consulting USA",
    "marketing technology stack USA",
    "CRM implementation consulting",
    "marketing automation setup USA",
    "MarTech selection USA",
    "marketing stack integration",
    "HubSpot setup agency USA",
    "Marketo implementation USA",
  ],
  openGraph: {
    title: "MarTech Stack Design & Implementation USA | HotBot Studios",
    description: "CRM, marketing automation, and analytics tool selection, configuration, and integration for US businesses. HubSpot, Salesforce, Marketo, ActiveCampaign.",
    url: "https://hotbotstudios.com/consultancy/martech-stack",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "MarTech Stack Design & Implementation USA | HotBot Studios", description: "CRM, automation, and analytics stack design for US businesses." },
  alternates: { canonical: "https://hotbotstudios.com/consultancy/martech-stack" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "MarTech Stack Design & Implementation",
  description: "Select, configure, and integrate the right CRM, marketing automation, analytics, and AI tools for your US business — HubSpot, Salesforce, Marketo, ActiveCampaign, and more.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "MarTech Stack Design & Implementation",
  url: "https://hotbotstudios.com/consultancy/martech-stack",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Consultancy", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "MarTech Stack", item: "https://hotbotstudios.com/consultancy/martech-stack" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is a MarTech stack and what tools should it include?", acceptedAnswer: { "@type": "Answer", text: "A MarTech (Marketing Technology) stack is the integrated set of software tools your marketing team uses to attract, engage, convert, and retain customers. A modern stack includes: a CRM (HubSpot or Salesforce) as the data core; marketing automation (HubSpot, Marketo, ActiveCampaign, or Klaviyo for email/nurture); analytics (GA4 + Looker Studio); advertising platforms (Google Ads, Meta); and AI automation tools (n8n, Zapier, or custom integrations). The right stack depends on your team size, budget, and technical capability." } },
    { "@type": "Question", name: "HubSpot or Salesforce — which CRM is right for our business?", acceptedAnswer: { "@type": "Answer", text: "HubSpot is generally best for SMBs and growth-stage companies ($1M–$50M revenue) — it's faster to implement, has a better-designed UX, includes built-in marketing automation, and requires less technical resource to maintain. Salesforce is better for enterprise companies ($50M+) with complex sales processes, high customization requirements, large sales teams, and existing Salesforce ecosystem investments. We evaluate your specific requirements and recommend based on fit, not platform preference." } },
    { "@type": "Question", name: "How long does CRM implementation take?", acceptedAnswer: { "@type": "Answer", text: "HubSpot CRM implementation (for a B2B company with 1–10 sales reps, standard pipeline, and email automation) takes 6–10 weeks: 2 weeks for data migration and configuration, 2 weeks for automation sequence build, 2 weeks for integration setup and testing, 1 week for training, and 1 week for launch and hypercare. Salesforce implementations with customization, Apex development, or complex integrations run 3–6 months." } },
    { "@type": "Question", name: "Can you integrate our CRM with our existing tools (Shopify, Stripe, Slack, etc.)?", acceptedAnswer: { "@type": "Answer", text: "Yes — third-party integration is a core part of every MarTech implementation. We connect CRMs to e-commerce platforms (Shopify, WooCommerce), payment processors (Stripe), communication tools (Slack, Intercom), advertising platforms (Google Ads, Meta), and custom internal systems via API. Where native integrations don't exist, we build custom workflows using n8n, Zapier, or direct API development." } },
    { "@type": "Question", name: "What does a MarTech stack cost to implement?", acceptedAnswer: { "@type": "Answer", text: "MarTech implementation cost has two components: software licensing (typically $500–$5,000/month depending on CRM tier and automation platform) and implementation services. A HubSpot implementation engagement with HotBot Studios typically runs $8,000–$25,000 depending on complexity. A full MarTech stack design and build (CRM + automation + analytics + integrations) runs $20,000–$80,000. The ROI is typically realized within 6–12 months through improved team efficiency and reduced wasted ad spend." } },
    { "@type": "Question", name: "Do you provide ongoing MarTech support after implementation?", acceptedAnswer: { "@type": "Answer", text: "Yes — we offer ongoing MarTech support retainers for clients who want continued optimization, new automation builds, integration management, and platform updates. Monthly retainers include a set number of hours for changes, troubleshooting, training new team members, and strategic advice as your stack evolves. We also offer ad-hoc project support for specific builds (new automation sequences, new integrations, reporting dashboards)." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🗂️", title: "CRM Selection & Implementation", desc: "HubSpot or Salesforce implementation — pipeline setup, contact property design, lifecycle stage configuration, lead scoring, and data migration from legacy systems.", href: "/consultancy/martech-stack" },
  { icon: "⚡", title: "Marketing Automation Setup", desc: "Email nurture sequences, lead scoring workflows, lifecycle automation, and behavior-triggered campaigns in HubSpot, Marketo, ActiveCampaign, or Klaviyo.", href: "/consultancy/martech-stack" },
  { icon: "📊", title: "Analytics & Attribution Infrastructure", desc: "GA4 implementation, custom event tracking, conversion goal setup, Looker Studio dashboard build, and multi-touch attribution model configuration.", href: "/consultancy/martech-stack" },
  { icon: "🔗", title: "Tool Integration & API Connectivity", desc: "Connect your CRM to Shopify, Stripe, Slack, Intercom, Google Ads, Meta, and custom internal systems — via native integrations, Zapier, n8n, or direct API development.", href: "/consultancy/martech-stack" },
  { icon: "🤖", title: "AI Tool Integration", desc: "Integrate AI capabilities into your stack — GPT-powered content generation, AI lead scoring, predictive churn models, and intelligent chatbot qualification workflows.", href: "/consultancy/martech-stack" },
  { icon: "🗺️", title: "MarTech Stack Audit & Optimization", desc: "Audit your existing stack for redundancies, unused tools, integration gaps, and data quality issues — then redesign and consolidate for cost efficiency and maximum effectiveness.", href: "/consultancy/martech-stack" },
];

const STATS = [
  { value: 9800, suffix: "+", label: "MarTech Tools Available in 2026", color: "#f59e0b" },
  { value: 30, suffix: "%", label: "Avg Tool Capability Utilization Before Optimization", color: "#f59e0b" },
  { value: 25, suffix: "%", label: "Avg MarTech Cost Reduction After Audit", color: "#f59e0b" },
  { value: 6, suffix: "wk", label: "Typical HubSpot Implementation Timeline", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Requirements & Stack Design", desc: "Map your team size, budget, technical capability, data requirements, and integration needs — then design the right stack architecture with specific tool recommendations and rationale.", icon: "📐" },
  { n: 2, title: "Vendor Selection & Procurement", desc: "Negotiate with vendors, review contracts, validate pricing tiers for your usage volume, and confirm implementation partner status where applicable (HubSpot Solutions Partner, Salesforce Partner).", icon: "🤝" },
  { n: 3, title: "Configuration & Integration Build", desc: "Configure the CRM, build automation sequences, set up analytics tracking, and build all required integrations — in a staging environment before live deployment.", icon: "🏗️" },
  { n: 4, title: "Data Migration, Training & Launch", desc: "Clean and migrate existing data, deliver role-specific training, run parallel operation period (old system + new system), then cut over and provide 30-day hypercare support.", icon: "🚀" },
];

const FAQS = [
  { q: "What is a MarTech stack and what tools should it include?", a: "A MarTech stack is the integrated set of software tools your marketing team uses to attract, engage, convert, and retain customers. A modern stack includes a CRM (HubSpot or Salesforce), marketing automation, analytics (GA4), advertising platforms, and AI automation tools. The right stack depends on your team size, budget, and technical capability." },
  { q: "HubSpot or Salesforce — which CRM is right for our business?", a: "HubSpot is generally best for SMBs and growth-stage companies ($1M–$50M revenue) — faster to implement, better UX, built-in marketing automation, lower technical overhead. Salesforce is better for enterprise companies ($50M+) with complex sales processes and high customization requirements. We evaluate your specific requirements and recommend based on fit." },
  { q: "How long does CRM implementation take?", a: "HubSpot implementation (B2B, 1–10 sales reps, standard pipeline and email automation) takes 6–10 weeks. Salesforce implementations with customization, Apex development, or complex integrations run 3–6 months." },
  { q: "Can you integrate our CRM with our existing tools (Shopify, Stripe, Slack, etc.)?", a: "Yes — third-party integration is a core part of every MarTech implementation. We connect CRMs to e-commerce platforms, payment processors, communication tools, advertising platforms, and custom internal systems via native integrations, Zapier, n8n, or direct API development." },
  { q: "What does a MarTech stack cost to implement?", a: "Software licensing typically runs $500–$5,000/month depending on CRM tier. HotBot Studios implementation engagements run $8,000–$25,000 for HubSpot and $20,000–$80,000 for a full stack build. ROI is typically realized within 6–12 months through improved team efficiency and reduced wasted spend." },
  { q: "Do you provide ongoing MarTech support after implementation?", a: "Yes — we offer ongoing support retainers with a set monthly hours for changes, troubleshooting, training new team members, and strategic advice as your stack evolves. Ad-hoc project support is also available for specific builds." },
];

const RELATED = [
  { title: "Digital Transformation", href: "/consultancy/digital-transformation", desc: "Broader digital transformation strategy the MarTech stack sits within.", icon: "🔄" },
  { title: "AI Automation Services", href: "/ai-automation", desc: "Custom AI automations that plug into your new MarTech stack.", icon: "🤖" },
  { title: "Marketing Audit & Gap Analysis", href: "/consultancy/marketing-audit", desc: "Audit current stack effectiveness before designing a new one.", icon: "🔍" },
];

const stackLayers = [
  { layer: "CRM & Contact Data", tools: ["HubSpot CRM", "Salesforce", "Pipedrive"], color: "#f59e0b" },
  { layer: "Marketing Automation", tools: ["HubSpot Marketing", "Marketo", "ActiveCampaign", "Klaviyo"], color: "#ec4899" },
  { layer: "Analytics & Attribution", tools: ["GA4", "Looker Studio", "Northbeam", "Triple Whale"], color: "#3b82f6" },
  { layer: "AI & Workflow Automation", tools: ["n8n", "Zapier", "Make", "Custom GPT API"], color: "#8b5cf6" },
  { layer: "Advertising Platforms", tools: ["Google Ads", "Meta Ads", "LinkedIn Ads", "Programmatic"], color: "#06b6d4" },
];

export default function MartechStackPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="MarTech Stack Design & Implementation"
        title="The Right Tools, Configured Correctly, Talking to Each Other"
        subtitle="There are 9,800+ MarTech tools available in 2026. Most US businesses have too many, configured incorrectly, with broken integrations and duplicate data. HotBot Studios cuts through the noise — selecting the right stack for your team, budget, and growth stage, then implementing it properly."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#f59e0b" }}>Definition — MarTech Stack</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              A <strong className="text-white">MarTech stack</strong> (Marketing Technology stack) is the integrated collection of software platforms your marketing team uses to execute and measure their work. The critical word is <em>integrated</em> — individual tools are only as valuable as their ability to share data and work together. A well-designed MarTech stack gives every team member a single view of customer data, enables automation of repetitive workflows, and produces attribution-accurate reporting that supports confident budget decisions.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Recommended MarTech Stack Architecture</h2>
          <div className="space-y-3">
            {stackLayers.map((row, i) => (
              <div key={row.layer} className="flex items-center gap-4">
                <div className="flex-1 rounded-xl p-4"
                  style={{ background: `${row.color}08`, border: `1px solid ${row.color}20` }}>
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <span className="text-sm font-bold shrink-0" style={{ color: row.color }}>{row.layer}</span>
                    <div className="flex flex-wrap gap-2">
                      {row.tools.map((tool) => (
                        <span key={tool} className="text-xs px-2 py-0.5 rounded-full text-slate-300"
                          style={{ background: `${row.color}15`, border: `1px solid ${row.color}25` }}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-slate-600 text-xs w-4 text-center hidden md:block">{5 - i}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="MarTech Implementation Services" columns={3} />
      <ServiceStats stats={STATS} title="The MarTech Reality Check" />
      <ProcessSteps steps={PROCESS} title="Our MarTech Implementation Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "There are 9,800+ MarTech tools in 2026 — the problem is not finding tools, it is choosing the right ones",
                "Most businesses use only 30% of their existing stack's capabilities — optimize before buying more",
                "HubSpot for SMBs ($1M–$50M); Salesforce for enterprise ($50M+) — match to team size and complexity",
                "Integrations are as important as the tools themselves — broken data flow defeats the purpose of any stack",
                "AI automation (n8n, Zapier, GPT API) multiplies the output of every tool in the stack",
                "30-day hypercare support period included — data migration has a rollback plan and parallel-run safety net",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                  <span style={{ color: "#22c55e" }} className="mt-0.5 shrink-0">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Design Your Optimal MarTech Stack"
        subtitle="Tell us your team size, budget, and growth goals — we'll recommend the exact tools, integrations, and implementation plan that gives your marketing team maximum leverage."
        formType="strategy-call"
      />
    </>
  );
}
