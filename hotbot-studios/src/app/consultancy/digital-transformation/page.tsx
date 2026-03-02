import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Digital Transformation Consulting USA — MarTech Modernisation & Process Automation | HotBot Studios",
  description:
    "HotBot Studios leads digital transformation for US businesses — modernising marketing tech stacks, automating manual processes, and upskilling teams. Proven from $2M to $200M in revenue. Free transformation audit.",
  keywords: [
    "digital transformation consulting USA",
    "MarTech modernisation USA",
    "marketing technology consulting USA",
    "marketing automation consulting USA",
    "tech stack modernisation USA",
    "business process automation USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/consultancy/digital-transformation" },
  openGraph: {
    title: "Digital Transformation Consulting USA | HotBot Studios",
    description: "Modernise your marketing tech stack, automate manual processes, and upskill your team. Digital transformation for US businesses from $2M to $200M.",
    url: "https://hotbotstudios.com/consultancy/digital-transformation",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Transformation Consulting",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Digital Transformation and MarTech Consulting",
  areaServed: { "@type": "Country", name: "United States" },
  description: "End-to-end digital transformation consulting for US businesses — MarTech stack modernisation, process automation, data infrastructure, and team capability building.",
  url: "https://hotbotstudios.com/consultancy/digital-transformation",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Digital Transformation", item: "https://hotbotstudios.com/consultancy/digital-transformation" },
  ],
};

const CONTENT = [
  {
    heading: "What Digital Transformation Actually Means for a Mid-Market US Business",
    body: "Digital transformation has become one of the most overloaded phrases in business consulting — used to describe everything from installing a new CRM to reorganising entire enterprise IT estates. For the US businesses HotBot Studios works with — typically $2M to $200M in revenue, with marketing teams of 3 to 30 people — digital transformation means something specific and practical: replacing the manual, disconnected, and duplicated processes that slow your team down with integrated, automated systems that let your existing team achieve more with the same headcount. This is not about technology for technology's sake. It is about identifying the ten or twenty hours per week your marketing and operations teams are spending on tasks that software should handle — lead routing, campaign reporting, content publishing, customer data synchronisation, invoice reconciliation — and building the technical infrastructure that reclaims that time for higher-value work.",
    color: "#06b6d4",
  },
  {
    heading: "MarTech Stack Assessment: What to Keep, What to Replace, and What to Add",
    body: "Most businesses that have been operating for more than three years have a MarTech stack that evolved organically — tools added one at a time to solve immediate problems, without a coherent architecture underneath. The result is data silos (your email platform, your CRM, your ad accounts, and your website analytics all hold different versions of the same customer data), redundant functionality (three tools that all claim to do email automation, none of which are used fully), and integration debt (manual exports and spreadsheet transfers filling the gaps between systems). HotBot Studios conducts a MarTech stack assessment that maps every tool your team uses, its actual utilisation rate, what it costs, what it connects to, and what it is missing. The output is a rationalised stack architecture — which tools to keep, which to retire, which to replace, and which new capabilities to add — with a vendor shortlist, total cost comparison, and a phased implementation plan that minimises disruption during the transition.",
    color: "#8b5cf6",
  },
  {
    heading: "Process Automation: Eliminating the Manual Work That Slows Your Team Down",
    body: "After the stack architecture is defined, the next priority is identifying and automating the manual processes that consume the most time and introduce the most errors. HotBot Studios maps your team's workflows — lead qualification and routing, campaign briefing and approval, content publishing, performance reporting, customer onboarding sequences, renewal reminders — and designs automation architectures using your existing tools or purpose-built automation platforms (n8n, Zapier, Make, HubSpot Workflows, or custom API integrations). Every automation we design is documented in a process specification that your team can maintain and extend after our engagement ends. We also build the monitoring and alerting infrastructure that catches automation failures before they cause downstream problems — because an unmonitored automation that breaks silently is worse than no automation at all.",
    color: "#3b82f6",
  },
  {
    heading: "Change Management: Getting Your Team to Actually Use the New Systems",
    body: "Technology implementations fail far more often from adoption problems than from technical problems. A new CRM that your sales team does not log into is worse than the spreadsheet it replaced, because it costs more and produces less accurate data. HotBot Studios treats change management as a first-class deliverable in every digital transformation engagement: we map the stakeholders whose workflows will change, identify the resistance points before implementation begins, design training programmes that focus on the specific tasks each role needs to perform (rather than generic platform walkthroughs), and build feedback loops that surface adoption problems early. We also structure implementation in phases that give your team time to adapt to each change before the next one begins — because the biggest risk in transformation is moving faster than your organisation can absorb. Request a free audit below and we will assess your current stack and process maturity within 48 hours.",
    color: "#22c55e",
  },
];

export default function DigitalTransformationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Digital Transformation"
        title="Replace Manual Processes with Systems That Scale"
        subtitle="MarTech stack modernisation, process automation, and team capability building for US businesses — practical digital transformation that reclaims your team's time and improves data quality."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Digital Transformation Audit</h2>
            <p className="text-slate-400">Tell us about your current tech stack and the manual processes that slow your team down most. We will respond with an initial assessment within 48 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="consultancy-digital-transformation"
            accentColor="#06b6d4"
            title="Start Your Digital Transformation"
            subtitle="No obligation. Share your stack and pain points and we will map the modernisation path."
          />
        </Reveal>
      </section>
    </>
  );
}
