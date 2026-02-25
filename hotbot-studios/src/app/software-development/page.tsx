import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";

export const metadata: Metadata = {
  title: "Software Development Services UK | HotBot Studios",
  description:
    "Custom software development, web apps, mobile apps, SaaS platforms, and API integrations for UK businesses.",
};

const SUB_SERVICES = [
  { icon: "🌐", title: "Web Applications", desc: "Scalable web apps built with Next.js, React, and modern cloud infrastructure." },
  { icon: "📱", title: "Mobile Apps", desc: "iOS and Android apps built with React Native and Flutter for cross-platform performance." },
  { icon: "☁️", title: "SaaS Platforms", desc: "Multi-tenant SaaS platforms with billing, auth, analytics, and admin panels." },
  { icon: "🔌", title: "API Development", desc: "RESTful and GraphQL APIs that integrate your tools and power your products." },
  { icon: "🛒", title: "E-Commerce", desc: "Custom Shopify, WooCommerce, and headless commerce solutions that convert." },
  { icon: "🔐", title: "Enterprise Systems", desc: "CRM, ERP, and enterprise workflow tools built to your exact specifications." },
];

const STATS = [
  { value: 100, suffix: "+", label: "Apps Shipped", color: "#3b82f6" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", color: "#22c55e" },
  { value: 4, suffix: "wk", label: "MVP Delivery", color: "#8b5cf6" },
  { value: 50, suffix: "+", label: "Tech Integrations", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Requirements", desc: "Detailed requirements gathering, technical architecture planning, and project scoping.", icon: "📋" },
  { n: 2, title: "Design", desc: "UI/UX wireframes, user journey mapping, and technical design documents.", icon: "🎨" },
  { n: 3, title: "Development", desc: "Agile 2-week sprints with demo reviews, continuous integration, and code reviews.", icon: "💻" },
  { n: 4, title: "Launch & Support", desc: "QA testing, deployment, monitoring setup, and ongoing support and maintenance.", icon: "🚀" },
];

const FAQS = [
  { q: "What technologies do you use?", a: "React, Next.js, Node.js, Python, TypeScript, PostgreSQL, MongoDB, AWS, Vercel, and Docker. We pick the right tools for each project." },
  { q: "How long does a typical project take?", a: "MVPs take 4-8 weeks. Full SaaS platforms take 3-6 months. We break projects into phases to deliver value early and often." },
  { q: "Do you offer ongoing maintenance?", a: "Yes. All projects include 90 days of post-launch support. Ongoing maintenance retainers are available from £1,500/month." },
  { q: "Who owns the code?", a: "You do — 100%. We transfer full ownership of all code, assets, and infrastructure to you at project completion." },
];

const RELATED = [
  { title: "AI Automation", href: "/ai-automation", desc: "Add intelligent AI capabilities to your software.", icon: "🤖" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Beautiful user experiences for your applications.", icon: "🎨" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Launch your product to the right audience.", icon: "📣" },
];

export default function SoftwareDevelopmentPage() {
  return (
    <>
      <PageHeader
        label="Software Development"
        title="Software That Scales With Your Ambition"
        subtitle="From MVPs to enterprise platforms — we build robust, beautiful software that solves real problems and delivers measurable business value."
      />
      <SubServices services={SUB_SERVICES} title="What We Build" columns={3} />
      <ServiceStats stats={STATS} />
      <ProcessSteps steps={PROCESS} title="Our Development Process" />
      <FAQSection faqs={FAQS} />
      <RelatedServices services={RELATED} />
      <CTASection title="Have a Software Idea?" subtitle="We'll take it from concept to production — with speed, quality, and transparency." formType="get-started" />
    </>
  );
}
