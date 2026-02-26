import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Highlight } from "@/components/shared/Highlight";
import { ContentBlock } from "@/components/shared/ContentBlock";

export const metadata: Metadata = {
  title: "Best Digital Marketing Services USA | HotBot Studios",
  keywords: ["digital marketing services USA", "SEO agency USA", "PPC management USA", "social media marketing", "email marketing agency", "CRO agency"],
  alternates: { canonical: "https://hotbotstudios.com/marketing-services" },
  description:
    "SEO, SEM, social media marketing, PPC, email marketing, and performance marketing for US businesses. Data-driven strategies that deliver measurable ROI.",
};

const SUB_SERVICES = [
  { icon: "🔍", title: "SEO & Content", desc: "Technical SEO, content strategy, and link building that ranks you for your highest-value keywords." },
  { icon: "📱", title: "Social Media Marketing", desc: "Platform-specific strategies for Instagram, LinkedIn, Twitter, and TikTok that build communities." },
  { icon: "💰", title: "PPC & Paid Ads", desc: "Google Ads, Meta Ads, and LinkedIn Ads managed for maximum ROAS with AI bidding." },
  { icon: "📧", title: "Email Marketing", desc: "Automated email sequences, newsletters, and drip campaigns that convert and retain customers." },
  { icon: "📊", title: "Analytics & Attribution", desc: "GA4 setup, custom dashboards, and multi-touch attribution to understand your true marketing ROI." },
  { icon: "🎯", title: "Conversion Rate Optimization", desc: "A/B testing, landing page optimization, and UX improvements that turn visitors into customers." },
];

const STATS = [
  { value: 200, suffix: "%", label: "Average Conversion Increase", color: "#3b82f6" },
  { value: 3, suffix: "x", label: "Average ROAS", color: "#8b5cf6" },
  { value: 85, suffix: "%", label: "Client Retention Rate", color: "#22c55e" },
  { value: 150, suffix: "+", label: "Campaigns Managed", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Audit & Strategy", desc: "Deep dive into your current marketing, competitor landscape, and audience to craft a winning strategy.", icon: "🔍" },
  { n: 2, title: "Channel Selection", desc: "Identify the highest-ROI channels for your specific business, audience, and budget.", icon: "📍" },
  { n: 3, title: "Campaign Launch", desc: "Build, launch, and A/B test campaigns across all selected channels simultaneously.", icon: "🚀" },
  { n: 4, title: "Optimize & Scale", desc: "Weekly optimization cycles to cut waste, double down on winners, and scale profitably.", icon: "📈" },
];

const FAQS = [
  { q: "How long before I see results from digital marketing?", a: "SEO typically takes 3-6 months for significant results. PPC and social ads can drive leads within days. We set realistic expectations from day one." },
  { q: "Do you specialise in any particular industry?", a: "We work across B2B, e-commerce, professional services, and consumer brands. Our team has specialists in retail, finance, tech, and healthcare." },
  { q: "What's your minimum monthly retainer?", a: "Our digital marketing retainers start at $2,500/month. We also offer project-based work for one-off campaigns or audits." },
  { q: "How do you measure marketing success?", a: "We set KPIs from day one — typically revenue, ROAS, cost per acquisition, and lead quality. You get weekly dashboards and monthly reviews." },
];

const RELATED = [
  { title: "Content Production", href: "/content-studio", desc: "Fuel your marketing with premium content.", icon: "🎬" },
  { title: "AI Automation", href: "/ai-automation", desc: "Automate your marketing workflows with AI.", icon: "🤖" },
  { title: "Public Relations", href: "/public-relations", desc: "Amplify your brand with strategic PR.", icon: "📰" },
];

export default function MarketingServicesPage() {
  return (
    <>
      <PageHeader
        label="Digital Marketing"
        title="Performance Marketing That Actually Performs"
        subtitle="Your competitors are running ads right now. The question is whether those ads are profitable. We build and manage data-driven marketing systems — SEO, PPC, social — engineered to turn spend into revenue, not just clicks."
      />
      <ContentBlock>
        <Highlight
          icon="📈"
          title="Mark-Tech Approach"
          text="We pair deep marketing expertise with AI tools — machine learning for campaign optimization, predictive analytics for smarter budget allocation, and automated personalization that speaks to the right buyer at the right moment — all tracked in one dashboard."
          color="#3b82f6"
        />
      </ContentBlock>
      <SubServices services={SUB_SERVICES} title="Our Marketing Services" columns={3} />
      <ServiceStats stats={STATS} title="Our Track Record" />
      <ProcessSteps steps={PROCESS} title="How We Drive Growth" />
      <FAQSection faqs={FAQS} />
      <RelatedServices services={RELATED} />
      <CTASection title="Ready to Grow Your Business?" subtitle="Find out where your current marketing is leaking revenue — and what it would take to fix it. Free audit, no strings." formType="strategy-call" />
    </>
  );
}
