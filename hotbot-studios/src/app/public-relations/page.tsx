import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";

export const metadata: Metadata = {
  title: "Public Relations Services USA | HotBot Studios",
  description:
    "Strategic PR campaigns, media outreach, crisis communications, and brand reputation management for US businesses.",
};

const SUB_SERVICES = [
  { icon: "📰", title: "Media Relations", desc: "Relationships with 500+ US journalists and editors across national and trade publications." },
  { icon: "🗞️", title: "Press Release Writing", desc: "Compelling press releases that journalists actually want to cover." },
  { icon: "🎯", title: "Crisis Communications", desc: "Rapid response PR strategy to protect and restore your brand reputation." },
  { icon: "🏆", title: "Awards & Speaking", desc: "Industry award submissions and conference speaking opportunities to position you as a thought leader." },
  { icon: "👥", title: "Influencer & Podcast PR", desc: "Podcast guest placements and influencer partnerships that reach your target audience." },
  { icon: "🌐", title: "Digital PR & SEO", desc: "High-authority backlink acquisition through editorial coverage in major publications." },
];

const STATS = [
  { value: 12, suffix: "+", label: "Avg Media Placements / Campaign", color: "#3b82f6" },
  { value: 50, suffix: "+", label: "Media Contacts Nationwide", color: "#8b5cf6" },
  { value: 300, suffix: "%", label: "Brand Awareness Increase", color: "#22c55e" },
  { value: 48, suffix: "hr", label: "Crisis Response Time", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Brand Audit", desc: "Analyse your current media presence, competitor coverage, and brand narrative gaps.", icon: "🔍" },
  { n: 2, title: "Strategy", desc: "Craft your core brand narrative, key messages, and media outreach strategy.", icon: "📐" },
  { n: 3, title: "Outreach", desc: "Personalised media outreach to our network of journalists, editors, and producers.", icon: "📨" },
  { n: 4, title: "Amplify", desc: "Repurpose earned media coverage across your owned channels to maximise reach.", icon: "📣" },
];

const FAQS = [
  { q: "How quickly can you get media coverage?", a: "For timely news stories, we can place articles within 24-72 hours. Feature articles and magazine placements take 2-6 weeks." },
  { q: "Which publications do you have relationships with?", a: "Forbes, TechCrunch, The Wall Street Journal, Adweek, Fast Company, Inc., and 500+ trade publications across every industry." },
  { q: "What if I have a PR crisis?", a: "We have a 24/7 crisis response team. We'll be on the phone within hours to develop a rapid response strategy." },
  { q: "How do you measure PR success?", a: "We track media impressions, domain authority of placements, share of voice vs competitors, and direct referral traffic from coverage." },
];

const RELATED = [
  { title: "Content Production", href: "/content-studio", desc: "Expert content to support your PR narrative.", icon: "✍️" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Amplify your PR wins with digital marketing.", icon: "📣" },
  { title: "Consulting", href: "/consultancy", desc: "Strategic brand positioning and messaging.", icon: "💡" },
];

export default function PublicRelationsPage() {
  return (
    <>
      <PageHeader
        label="Public Relations"
        title="Put Your Brand in the Headlines"
        subtitle="When your customers Google your company name, what do they find? A strong earned media presence in Forbes, TechCrunch, or your industry's leading publications builds instant credibility — and credibility closes deals."
      />
      <SubServices services={SUB_SERVICES} title="Our PR Services" columns={3} />
      <ServiceStats stats={STATS} />
      <ProcessSteps steps={PROCESS} title="Our PR Process" />
      <FAQSection faqs={FAQS} />
      <RelatedServices services={RELATED} />
      <CTASection title="Ready for Your Brand Moment?" subtitle="Every business has a story worth telling. Let's get yours in front of the journalists, investors, and customers who need to hear it." formType="strategy-call" />
    </>
  );
}
