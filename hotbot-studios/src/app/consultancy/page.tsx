import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";

export const metadata: Metadata = {
  title: "Marketing Consulting UK | HotBot Studios",
  description:
    "Strategic marketing consulting, digital transformation, and growth advisory for UK businesses ready to scale.",
};

const SUB_SERVICES = [
  { icon: "🗺️", title: "Growth Strategy", desc: "Build a clear, executable roadmap from where you are to where you want to be." },
  { icon: "🔄", title: "Digital Transformation", desc: "Modernise your marketing stack, processes, and team capabilities." },
  { icon: "📊", title: "Marketing Audit", desc: "Comprehensive review of your current marketing to identify gaps and opportunities." },
  { icon: "🏗️", title: "MarTech Stack Design", desc: "Select and implement the right tools for your team size, budget, and goals." },
  { icon: "👥", title: "Team Building", desc: "Help you hire, structure, and upskill your in-house marketing team." },
  { icon: "🌍", title: "Market Entry", desc: "Research, strategy, and execution support for entering new UK or international markets." },
];

const STATS = [
  { value: 3, suffix: "x", label: "Avg Revenue Multiplier", color: "#3b82f6" },
  { value: 50, suffix: "+", label: "Consulting Engagements", color: "#8b5cf6" },
  { value: 12, suffix: "wk", label: "Avg Engagement Length", color: "#22c55e" },
  { value: 100, suffix: "%", label: "Strategic Clarity Post-Audit", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Discovery Call", desc: "Free 30-minute call to understand your business, goals, and current challenges.", icon: "📞" },
  { n: 2, title: "Audit & Analysis", desc: "Deep-dive audit of your marketing, operations, and competitive position.", icon: "🔍" },
  { n: 3, title: "Strategy Development", desc: "Build a bespoke growth strategy with clear priorities, timelines, and success metrics.", icon: "📐" },
  { n: 4, title: "Implementation Support", desc: "Weekly advisory sessions and hands-on support as you execute the strategy.", icon: "🤝" },
];

const FAQS = [
  { q: "What types of businesses do you consult for?", a: "We work with growing SMEs, scale-ups, and enterprise teams across all industries. Sweet spot is £1M-£50M revenue businesses." },
  { q: "Is consulting a one-time engagement or ongoing?", a: "Both. We offer one-off strategy audits (4-6 weeks) and ongoing advisory retainers (monthly) for continued support." },
  { q: "How quickly will we see a return on consulting investment?", a: "Most clients see a clear ROI within 60-90 days through waste reduction and higher-value activities. We set measurable goals from day one." },
  { q: "Do you also help with implementation?", a: "Yes. We're different from typical consultants — we roll up our sleeves and help you execute, not just advise." },
];

const RELATED = [
  { title: "Digital Marketing", href: "/marketing-services", desc: "Execute the strategy we build together.", icon: "📣" },
  { title: "AI Automation", href: "/ai-automation", desc: "Automate for scale after strategic clarity.", icon: "🤖" },
  { title: "Software Development", href: "/software-development", desc: "Build the tools your strategy requires.", icon: "💻" },
];

export default function ConsultancyPage() {
  return (
    <>
      <PageHeader
        label="Marketing Consulting"
        title="Clarity, Strategy, and Execution That Scales"
        subtitle="We partner with ambitious UK businesses to develop winning growth strategies, modernise their marketing operations, and build teams that deliver."
      />
      <SubServices services={SUB_SERVICES} title="Our Consulting Services" columns={3} />
      <ServiceStats stats={STATS} />
      <ProcessSteps steps={PROCESS} title="Our Consulting Process" />
      <FAQSection faqs={FAQS} />
      <RelatedServices services={RELATED} />
      <CTASection title="Book Your Free Strategy Call" subtitle="30 minutes. No pitch. Just honest insights about your biggest marketing opportunities." formType="strategy-call" />
    </>
  );
}
