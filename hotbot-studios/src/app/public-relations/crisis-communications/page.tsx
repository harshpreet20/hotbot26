import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Crisis Communications Agency USA — Brand Reputation Management & Rapid Response | HotBot Studios",
  description:
    "HotBot Studios provides 24/7 crisis communications support for US businesses — rapid response strategy, media holding statements, spokesperson preparation, and proactive narrative control to protect brand reputation.",
  keywords: [
    "crisis communications agency USA",
    "brand reputation management USA",
    "crisis PR agency USA",
    "reputation management USA",
    "media crisis response USA",
    "corporate crisis communications",
    "rapid response PR USA",
    "brand crisis management USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/public-relations/crisis-communications" },
  openGraph: {
    title: "Crisis Communications Agency USA — Brand Reputation Management | HotBot Studios",
    description: "24/7 crisis communications and reputation management for US businesses. Rapid response, media holding statements, and proactive narrative control.",
    url: "https://hotbotstudios.com/public-relations/crisis-communications",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Crisis Communications",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Crisis Communications and Reputation Management",
  areaServed: { "@type": "Country", name: "United States" },
  description: "24/7 crisis communications support for US businesses — rapid response strategy, media holding statements, spokesperson preparation, and brand reputation management.",
  url: "https://hotbotstudios.com/public-relations/crisis-communications",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Crisis Communications", item: "https://hotbotstudios.com/public-relations/crisis-communications" },
  ],
};

const CONTENT = [
  {
    heading: "The First 24 Hours Determine How a Crisis Ends",
    body: "In a reputational crisis, the window between the first negative story appearing and the narrative becoming fixed in the public's mind is measured in hours, not days. Businesses that respond within the first four hours with a clear, credible statement from a named spokesperson almost always recover faster and more completely than those that go silent while lawyers deliberate. Silence is interpreted as guilt; a slow, lawyered response is interpreted as evasion; a panicked, inconsistent response accelerates the story. The organisations that navigate crises successfully do so because they have a crisis communications plan in place before the crisis occurs — they know who speaks, what the first statement says, which media relationships to activate, and what the escalation protocol is if the story grows. HotBot Studios helps US businesses develop pre-crisis preparedness plans and provides immediate, experienced crisis communications support when a reputational threat materialises.",
    color: "#ef4444",
  },
  {
    heading: "Rapid Response: Holding Statements, Spokesperson Preparation, and Narrative Control",
    body: "The immediate priorities in a crisis are to stop the narrative vacuum (which media and social media will fill with speculation) and to establish your organisation as the authoritative, accountable source of information about what happened and what you are doing about it. HotBot Studios drafts holding statements within two hours of being briefed — short, factual statements that acknowledge the situation, express appropriate concern, commit to transparency, and buy time for a more complete response. We prepare your designated spokesperson for media interviews with message discipline training, likely question preparation, and on-camera coaching. We also activate media relationships to ensure that the accurate version of events is the one that reaches journalists first — countering misinformation before it spreads. Every crisis is different, but the fundamentals of effective crisis communications are consistent: speed, transparency, accountability, and a clear path to resolution.",
    color: "#f59e0b",
  },
  {
    heading: "Digital Reputation Management: Search Results, Social Media, and Review Platforms",
    body: "Modern crises do not stay in traditional media — they spread through social media, get indexed by Google where they surface in brand searches for months, and generate review platform activity that affects new customer acquisition. HotBot Studios manages the digital dimension of reputational crises: monitoring Twitter, LinkedIn, Reddit, and industry forums for developing narratives and responding appropriately; working with review platforms (Google, Glassdoor, Trustpilot) to flag and remove policy-violating content and to develop a strategy for building positive reviews that improve your aggregate rating over time; and creating and optimising positive content — case studies, awards, news coverage, executive profiles — that displaces negative search results from the first page of Google for branded searches. The goal is not to suppress legitimate criticism but to ensure that your organisation's authentic story is as visible as any negative coverage.",
    color: "#8b5cf6",
  },
  {
    heading: "Post-Crisis: Reputation Rebuilding and Ongoing Monitoring",
    body: "Once the immediate crisis has been managed, the work of reputation rebuilding begins — and this phase is where most organisations under-invest, assuming the crisis is over once the news cycle moves on. The reputational damage from a crisis often persists in search results, industry memory, and customer sentiment long after the triggering event has been resolved. HotBot Studios develops and executes post-crisis reputation rebuilding programmes: a sustained earned media campaign that generates positive coverage to displace negative search results, stakeholder communication plans that restore confidence with key audiences (investors, partners, employees, customers), thought leadership content that repositions your leadership team as credible forward-thinking voices in your industry, and ongoing reputation monitoring that gives you early warning of any resurgence in negative sentiment. Contact us below for a confidential consultation — whether you are in the middle of a crisis or want to prepare before one happens.",
    color: "#3b82f6",
  },
];

export default function CrisisCommunicationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Crisis Communications"
        title="Protect Your Brand Before, During, and After a Reputational Crisis"
        subtitle="24/7 crisis communications for US businesses — rapid response strategy, media holding statements, spokesperson preparation, and digital reputation management when it matters most."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Confidential Crisis Consultation</h2>
            <p className="text-slate-400">Describe your situation — whether you are in a crisis now or want to prepare. We respond to crisis enquiries within two hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="pr-crisis-comms"
            accentColor="#ef4444"
            title="Talk to Our Crisis Team"
            subtitle="Confidential. Share the situation and we will call you back within two hours to discuss the response strategy."
          />
        </Reveal>
      </section>
    </>
  );
}
