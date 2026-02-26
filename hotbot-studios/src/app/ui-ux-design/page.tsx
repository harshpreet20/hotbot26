import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";

export const metadata: Metadata = {
  title: "UI/UX Design Services USA | HotBot Studios",
  description:
    "User-centered UI/UX design, wireframing, prototyping, and design systems that convert visitors into customers.",
};

const SUB_SERVICES = [
  { icon: "🔭", title: "UX Research", desc: "User interviews, surveys, heatmaps, and A/B tests to understand what your users actually need." },
  { icon: "📐", title: "Wireframing", desc: "Low and high-fidelity wireframes that map out user journeys before a single pixel is designed." },
  { icon: "🎨", title: "UI Design", desc: "Beautiful, consistent interfaces built on solid design systems that scale." },
  { icon: "⚡", title: "Prototyping", desc: "Interactive prototypes for user testing and stakeholder sign-off before development begins." },
  { icon: "📱", title: "Mobile Design", desc: "Native iOS and Android design patterns that feel right at home on any device." },
  { icon: "♿", title: "Accessibility", desc: "WCAG 2.1 AA compliant designs that are inclusive and meet ADA & Section 508 accessibility standards." },
];

const STATS = [
  { value: 65, suffix: "%", label: "Avg Conversion Increase", color: "#8b5cf6" },
  { value: 40, suffix: "+", label: "Products Designed", color: "#3b82f6" },
  { value: 95, suffix: "%", label: "User Satisfaction Score", color: "#22c55e" },
  { value: 3, suffix: "x", label: "Faster User Task Completion", color: "#ec4899" },
];

const PROCESS = [
  { n: 1, title: "Discovery", desc: "User research, competitive analysis, and stakeholder interviews to define the design problem.", icon: "🔍" },
  { n: 2, title: "Define", desc: "User personas, journey maps, information architecture, and design principles.", icon: "📋" },
  { n: 3, title: "Design", desc: "Wireframes, high-fidelity designs, interactive prototypes, and design system creation.", icon: "🎨" },
  { n: 4, title: "Test & Iterate", desc: "Usability testing, A/B testing, and iterative refinement based on real user feedback.", icon: "🧪" },
];

const FAQS = [
  { q: "Do you design for both web and mobile?", a: "Yes. We design responsive web interfaces and native mobile apps for iOS and Android using platform-appropriate patterns." },
  { q: "What tools do you use for design?", a: "Figma is our primary tool. We also use Maze for user testing, Hotjar for analytics, and deliver Storybook component libraries for development." },
  { q: "Can you work with our existing design system?", a: "Absolutely. We frequently work within established design systems, extending and improving them rather than starting from scratch." },
  { q: "How do you measure design success?", a: "Task completion rates, conversion rates, time-on-task, NPS scores, and direct comparison of key metrics before/after redesign." },
];

const RELATED = [
  { title: "Software Development", href: "/software-development", desc: "We'll build what we design, pixel-perfect.", icon: "💻" },
  { title: "AI Automation", href: "/ai-automation", desc: "Beautiful interfaces for your AI products.", icon: "🤖" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "More traffic to your newly optimized product.", icon: "📣" },
];

export default function UIUXDesignPage() {
  return (
    <>
      <PageHeader
        label="UI/UX Design"
        title="Designs That Convert, Not Just Impress"
        subtitle="A confusing product loses customers before it ever gets a chance to keep them. We design interfaces that feel effortless — because when users achieve their goals quickly, your conversion metrics follow."
      />
      <SubServices services={SUB_SERVICES} title="Our Design Services" columns={3} />
      <ServiceStats stats={STATS} />
      <ProcessSteps steps={PROCESS} title="Our Design Process" />
      <FAQSection faqs={FAQS} />
      <RelatedServices services={RELATED} />
      <CTASection title="Ready to Transform Your Product?" subtitle="Find the leaks in your user experience — and the specific design changes that will fix them." formType="consultation" />
    </>
  );
}
