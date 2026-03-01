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
  title: "Digital Transformation Consulting USA | MarTech & AI Modernization | HotBot Studios",
  description:
    "Digital transformation consulting for US businesses. Modernize your marketing tech stack (MarTech), automate manual processes with AI, and upskill your team for the digital-first era. HotBot Studios.",
  keywords: [
    "digital transformation consulting USA",
    "MarTech modernization USA",
    "marketing technology consulting",
    "AI transformation consulting",
    "digital transformation agency USA",
    "marketing automation consulting",
    "CRM implementation consulting USA",
    "MarTech stack consulting",
    "business digital transformation USA",
    "process automation consulting",
  ],
  openGraph: {
    title: "Digital Transformation Consulting USA | HotBot Studios",
    description: "Modernize your MarTech stack, automate manual processes with AI, and transform your team's digital capabilities. HotBot Studios.",
    url: "https://hotbotstudios.com/consultancy/digital-transformation",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Digital Transformation Consulting USA | HotBot Studios", description: "MarTech modernization and AI transformation for US businesses." },
  alternates: { canonical: "https://hotbotstudios.com/consultancy/digital-transformation" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Digital Transformation Consulting",
  description: "Digital transformation consulting for US businesses — modernizing marketing tech stacks, automating manual processes with AI, and building the digital capabilities needed to compete in the AI era.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Digital Transformation Consulting",
  url: "https://hotbotstudios.com/consultancy/digital-transformation",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Consultancy", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Digital Transformation", item: "https://hotbotstudios.com/consultancy/digital-transformation" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What does digital transformation mean for a mid-sized US business?", acceptedAnswer: { "@type": "Answer", text: "For a mid-sized US business, digital transformation means replacing manual, spreadsheet-driven, or legacy software marketing processes with modern, integrated, AI-capable systems. In practice, this means: implementing a best-fit CRM (HubSpot or Salesforce), connecting it to your marketing automation platform, setting up GA4 and proper attribution tracking, automating repetitive workflows that currently consume team hours, and enabling your team to make decisions from a single source of data truth." } },
    { "@type": "Question", name: "How long does a digital transformation project typically take?", acceptedAnswer: { "@type": "Answer", text: "Scope determines timeline. A focused MarTech audit and stack redesign takes 4–8 weeks. A full digital transformation covering CRM implementation, marketing automation setup, analytics infrastructure, and team training typically runs 3–6 months. Enterprise-scale transformations with legacy system migration, custom integrations, and organisation-wide change management run 6–18 months. We always start with a scope-definition phase to give you an accurate timeline." } },
    { "@type": "Question", name: "We already have a CRM and marketing automation platform — do we need transformation consulting?", acceptedAnswer: { "@type": "Answer", text: "Having tools is not the same as using them effectively. Most businesses with existing MarTech stacks are using less than 30% of their platform capabilities, have data silos between systems, and lack the attribution visibility to make confident budget decisions. A MarTech audit frequently reveals that existing tools are poorly configured, poorly integrated, or simply wrong for current needs — and that switching or reconfiguring would dramatically improve marketing effectiveness." } },
    { "@type": "Question", name: "How do you handle AI integration within digital transformation?", acceptedAnswer: { "@type": "Answer", text: "AI integration is central to our digital transformation approach. We identify the highest-ROI AI automation opportunities in your marketing workflow — content generation, lead scoring, email personalization, chatbot qualification, reporting automation — and implement them via n8n, Zapier, HubSpot AI, or custom API integrations. We treat AI as a practical productivity and capability multiplier, not a buzzword." } },
    { "@type": "Question", name: "What happens to our existing data during a MarTech migration?", acceptedAnswer: { "@type": "Answer", text: "Data migration is the highest-risk element of any MarTech transformation, and we treat it accordingly. We audit your existing data for quality (duplicates, incomplete records, outdated contacts), design a migration plan with a staging environment test, validate data integrity post-migration, and maintain the legacy system in read-only mode for 30 days post-migration as a rollback safety net." } },
    { "@type": "Question", name: "Do you train our team on new tools as part of the engagement?", acceptedAnswer: { "@type": "Answer", text: "Yes — tool adoption is the #1 reason digital transformations fail, and training is non-negotiable in our approach. We deliver role-specific training for all key users (marketing ops, campaign managers, analytics, leadership), create internal documentation and SOPs, and include 30 days of post-implementation support to answer questions as the team encounters real use cases." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🗺️", title: "Digital Transformation Roadmap", desc: "A phased transformation plan — from current-state audit through MarTech selection, implementation sequencing, team training, and change management — with realistic timelines and budgets.", href: "/consultancy/digital-transformation" },
  { icon: "🔧", title: "MarTech Stack Audit & Design", desc: "Audit your existing tools for effectiveness, identify gaps and redundancies, and design the optimal MarTech stack for your team size, budget, and growth stage.", href: "/consultancy/digital-transformation" },
  { icon: "🤖", title: "AI & Automation Integration", desc: "Identify the highest-ROI AI automation opportunities in your marketing workflow and implement them via n8n, Zapier, HubSpot AI, or custom API integrations.", href: "/consultancy/digital-transformation" },
  { icon: "📊", title: "Analytics & Data Infrastructure", desc: "GA4 implementation, custom event tracking, attribution model design, and data warehouse setup — so your team can make budget decisions from a single data truth.", href: "/consultancy/digital-transformation" },
  { icon: "🔄", title: "CRM & Marketing Automation Setup", desc: "HubSpot or Salesforce CRM configuration, lifecycle stage setup, lead scoring models, email automation sequences, and integration with your advertising and analytics stack.", href: "/consultancy/digital-transformation" },
  { icon: "🎓", title: "Team Training & Change Management", desc: "Role-specific tool training, SOP documentation, internal playbooks, and 30-day post-implementation support to drive genuine adoption across your marketing team.", href: "/consultancy/digital-transformation" },
];

const STATS = [
  { value: 70, suffix: "%", label: "of Digital Transformations Fail Without Change Mgmt", color: "#06b6d4" },
  { value: 30, suffix: "%", label: "Avg MarTech Capability Utilization Before Audit", color: "#06b6d4" },
  { value: 4, suffix: "×", label: "Marketing Output With Full Automation Stack", color: "#06b6d4" },
  { value: 6, suffix: "mo", label: "Typical Full Transformation Timeline", color: "#06b6d4" },
];

const PROCESS = [
  { n: 1, title: "Current-State Assessment", desc: "Audit your existing tools, workflows, data quality, team capabilities, and integration points to understand what's working, what's broken, and what's missing.", icon: "🔍" },
  { n: 2, title: "Future-State Design", desc: "Design the target MarTech architecture — tool selection, integration map, data flow, automation workflows, and reporting structure — aligned with your team's actual capabilities and budget.", icon: "🗺️" },
  { n: 3, title: "Phased Implementation", desc: "Execute the transformation in sequenced phases — starting with data foundation (analytics), then CRM, then automation — minimizing disruption while building compounding capability.", icon: "🏗️" },
  { n: 4, title: "Training, Adoption & Ongoing Support", desc: "Role-specific training, SOP documentation, 30-day hypercare support, and monthly check-ins to track adoption, resolve blockers, and iterate on the stack as business needs evolve.", icon: "🎓" },
];

const FAQS = [
  { q: "What does digital transformation mean for a mid-sized US business?", a: "It means replacing manual, spreadsheet-driven, or legacy marketing processes with modern, integrated, AI-capable systems — implementing a best-fit CRM, connecting it to marketing automation, setting up GA4 and proper attribution, automating repetitive workflows, and enabling data-driven decisions from a single source of truth." },
  { q: "How long does a digital transformation project typically take?", a: "A focused MarTech audit and stack redesign takes 4–8 weeks. A full digital transformation covering CRM, marketing automation, analytics infrastructure, and team training runs 3–6 months. Enterprise-scale transformations run 6–18 months. We always start with a scope-definition phase to give you an accurate timeline." },
  { q: "We already have a CRM and marketing automation — do we need transformation consulting?", a: "Having tools is not the same as using them effectively. Most businesses use less than 30% of their platform capabilities, have data silos between systems, and lack attribution visibility. A MarTech audit frequently reveals that existing tools are poorly configured, poorly integrated, or simply wrong for current needs." },
  { q: "How do you handle AI integration within digital transformation?", a: "AI integration is central to our approach. We identify the highest-ROI automation opportunities in your marketing workflow — content generation, lead scoring, email personalization, chatbot qualification, reporting automation — and implement them via n8n, Zapier, HubSpot AI, or custom API integrations." },
  { q: "What happens to our existing data during a MarTech migration?", a: "Data migration is the highest-risk element of any MarTech transformation. We audit existing data quality, design a migration plan with a staging environment test, validate data integrity post-migration, and maintain the legacy system in read-only mode for 30 days post-migration as a rollback safety net." },
  { q: "Do you train our team on new tools as part of the engagement?", a: "Yes — tool adoption is the #1 reason digital transformations fail. We deliver role-specific training for all key users, create internal documentation and SOPs, and include 30 days of post-implementation support to answer questions as the team encounters real use cases." },
];

const RELATED = [
  { title: "MarTech Stack Design & Implementation", href: "/consultancy/martech-stack", desc: "Deep-dive into CRM, automation, and analytics tool selection.", icon: "🏗️" },
  { title: "AI Automation Services", href: "/ai-automation", desc: "Build custom AI automations that amplify your transformed stack.", icon: "🤖" },
  { title: "Growth Strategy & Roadmap", href: "/consultancy/growth-strategy", desc: "Revenue roadmap that the transformed tech stack enables.", icon: "🗺️" },
];

const transformationLayers = [
  { layer: "Data & Analytics Foundation", tools: "GA4 · BigQuery · Looker Studio · Attribution Model", color: "#06b6d4", order: 1 },
  { layer: "CRM & Contact Management", tools: "HubSpot · Salesforce · Pipedrive · Contact Scoring", color: "#3b82f6", order: 2 },
  { layer: "Marketing Automation", tools: "HubSpot Flows · ActiveCampaign · Marketo · Klaviyo", color: "#8b5cf6", order: 3 },
  { layer: "AI & Workflow Automation", tools: "n8n · Zapier · Make · GPT API · Custom Agents", color: "#f59e0b", order: 4 },
  { layer: "Content & Campaign Execution", tools: "CMS · Ad Platforms · Email · Social Scheduling", color: "#22c55e", order: 5 },
];

export default function DigitalTransformationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Digital Transformation Consulting"
        title="Modernize Your Marketing Engine for the AI Era"
        subtitle="Legacy tools, disconnected data, and manual workflows are a growth ceiling. HotBot Studios replaces the chaos with an integrated, AI-enabled marketing stack — CRM, automation, analytics, and AI workflows that give your team 4× the output with the same headcount."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#06b6d4" }}>Definition — Digital Transformation</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Digital transformation</strong> is the process of replacing manual, disconnected, or outdated marketing processes and technology with integrated, data-driven, and AI-capable systems. For marketing teams, it means moving from spreadsheet-based tracking to real-time attribution dashboards, from manual email sending to intelligent automation sequences, and from reactive decision-making to predictive, data-backed strategy — giving small teams the output of organizations twice their size.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Modern Marketing Tech Stack — Layer Architecture</h2>
          <div className="space-y-3">
            {transformationLayers.map((row) => (
              <div key={row.layer} className="flex items-center gap-4">
                <span className="text-slate-500 text-xs w-6 shrink-0 text-right font-bold">{row.order}</span>
                <div className="flex-1 rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-2"
                  style={{ background: `${row.color}10`, border: `1px solid ${row.color}25` }}>
                  <span className="text-sm font-bold" style={{ color: row.color }}>{row.layer}</span>
                  <span className="text-slate-400 text-xs md:ml-4">{row.tools}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">Build from the bottom up — data foundation first, execution layer last.</p>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Digital Transformation Services" columns={3} />
      <ServiceStats stats={STATS} title="The Digital Transformation Imperative" />
      <ProcessSteps steps={PROCESS} title="Our Transformation Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "70% of digital transformations fail — change management and team training are as important as the technology",
                "Most businesses use only 30% of their existing MarTech capabilities — fix that before buying new tools",
                "Build the stack in order: data foundation first, CRM second, automation third, AI/execution layer last",
                "AI workflow automation (n8n, Zapier, GPT API) gives small marketing teams enterprise-scale output",
                "Data migration gets 30-day rollback safety net — legacy system stays live in read-only mode post-migration",
                "HotBot Studios uniquely offers both transformation consulting AND full implementation execution",
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
        title="Transform Your Marketing Stack — Start With a Free Audit"
        subtitle="Book a free 30-minute discovery call and we'll identify the 3 biggest bottlenecks in your current MarTech stack before any engagement begins."
        formType="strategy-call"
      />
    </>
  );
}
