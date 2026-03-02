import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "MarTech Stack Design & Implementation USA — HubSpot, Salesforce & Marketing Automation | HotBot Studios",
  description:
    "HotBot Studios designs and implements the right MarTech stack for US businesses — CRM selection, marketing automation setup, analytics configuration, and full-stack integration. Free MarTech consultation.",
  keywords: [
    "MarTech stack design USA",
    "HubSpot implementation USA",
    "Salesforce CRM setup USA",
    "marketing automation implementation USA",
    "MarTech consulting USA",
    "CRM implementation USA",
    "HubSpot consultant USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/consultancy/martech-stack" },
  openGraph: {
    title: "MarTech Stack Design & Implementation USA | HotBot Studios",
    description: "CRM selection, marketing automation setup, and analytics configuration for US businesses. HubSpot, Salesforce, and ActiveCampaign implementation specialists.",
    url: "https://hotbotstudios.com/consultancy/martech-stack",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "MarTech Stack Design & Implementation",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "MarTech Stack Design and CRM Implementation",
  areaServed: { "@type": "Country", name: "United States" },
  description: "MarTech stack design and implementation for US businesses — CRM selection and configuration, marketing automation setup, analytics infrastructure, and full-stack tool integration.",
  url: "https://hotbotstudios.com/consultancy/martech-stack",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "MarTech Stack Design & Implementation", item: "https://hotbotstudios.com/consultancy/martech-stack" },
  ],
};

const CONTENT = [
  {
    heading: "The Right MarTech Stack Is Not the Biggest One — It Is the Most Connected One",
    body: "There are over 14,000 marketing technology products available in 2026 — more than double the number from five years ago. The businesses that get the most value from their MarTech investment are not the ones that use the most tools. They are the ones whose tools share data effectively, automate the right handoffs between teams and systems, and give leadership a single, reliable view of pipeline and revenue attribution. The typical mid-market US business HotBot Studios audits spends $8,000 to $25,000 per month on MarTech subscriptions, uses fewer than 40% of the features they are paying for, and still manages critical processes manually because their tools do not talk to each other properly. The solution is not always to add more software — it is usually to configure, integrate, and automate the stack you already have more effectively, with selective additions where genuine capability gaps exist.",
    color: "#f59e0b",
  },
  {
    heading: "CRM Selection and Configuration: HubSpot, Salesforce, and Beyond",
    body: "The CRM is the spine of your MarTech stack — every other tool connects to it, and the quality of your customer data flows from how well it is configured. HotBot Studios is vendor-agnostic on CRM selection: we recommend the platform that best fits your team size, sales process complexity, integration requirements, and budget. HubSpot is typically the right choice for teams up to 50 people with a relatively straightforward B2B or B2C sales process — its marketing, sales, and service hubs integrate natively and the implementation effort is significantly lower than Salesforce. Salesforce is the right choice for larger teams, complex multi-stage sales processes, custom object requirements, or businesses that need the breadth of the Salesforce ecosystem. For teams that do not need a full CRM, Attio or Folk offer lightweight alternatives with strong integration capabilities. We scope the configuration, migrate your existing data, build the custom properties and pipeline stages that match your actual sales process, and train your team.",
    color: "#3b82f6",
  },
  {
    heading: "Marketing Automation: Building the Sequences and Workflows That Run While You Sleep",
    body: "Marketing automation done well creates a personalised, timely experience for every lead and customer at every stage of the lifecycle — without your team manually triggering each communication. HotBot Studios designs and implements automation architectures across the full customer lifecycle: lead nurturing sequences that respond to specific behaviour signals (page visits, content downloads, email engagement) rather than sending the same generic drip to every subscriber; lead scoring models that surface the contacts most likely to convert based on fit and intent signals; handoff workflows that route qualified leads to the right sales rep with full context at the right moment; and post-purchase sequences that drive product adoption, reduce churn, and generate referrals. We implement these workflows on your chosen automation platform (HubSpot, ActiveCampaign, Marketo, Klaviyo, or Braze), document every flow for your team to maintain, and build the monitoring dashboards that show you whether each automation is performing as designed.",
    color: "#8b5cf6",
  },
  {
    heading: "Analytics Infrastructure: Building the Single Source of Truth Your Team Needs",
    body: "Most marketing teams make decisions on incomplete or inaccurate data — not because the data does not exist but because it is fragmented across platforms that each tell a different version of events. Your ad platform reports one conversion count, your CRM shows a different number of leads, and your analytics tool shows a third. HotBot Studios builds the analytics infrastructure that reconciles these data sources into a single, reliable view: GA4 configuration with accurate conversion tracking and UTM standard enforcement across all channels, CRM reporting that connects marketing spend to closed revenue by channel and campaign, and a connected data warehouse (BigQuery or Redshift) with a BI layer (Looker Studio or Metabase) that gives your leadership team the dashboards they need to make confident budget decisions. Every analytics project we deliver includes documentation of the data model and training for the team members who will maintain and use the dashboards. Request a free MarTech consultation below.",
    color: "#22c55e",
  },
];

export default function MartechStackPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="MarTech Stack Design & Implementation"
        title="The Right Stack, Properly Connected, Fully Automated"
        subtitle="CRM selection, marketing automation setup, analytics configuration, and full-stack integration for US businesses — HubSpot, Salesforce, Marketo, and ActiveCampaign implementation specialists."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free MarTech Consultation</h2>
            <p className="text-slate-400">Share your current tools, team size, and biggest data or automation pain points. We will assess your stack and recommend the highest-value changes within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="consultancy-martech-stack"
            accentColor="#f59e0b"
            title="Design Your Ideal MarTech Stack"
            subtitle="No obligation. Tell us your tools, your process, and your goals and we will map the right configuration."
          />
        </Reveal>
      </section>
    </>
  );
}
