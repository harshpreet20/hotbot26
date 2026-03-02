import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Web Application Development Agency USA — React, Next.js & Node.js | HotBot Studios",
  description:
    "HotBot Studios builds custom web applications for US businesses using React 19, Next.js 15, and Node.js on AWS. Dashboards, B2B platforms, internal tools, and AI-powered apps. 4-week MVP. Free technical scoping call.",
  keywords: [
    "web application development agency USA",
    "React development agency USA",
    "Next.js development company USA",
    "custom web app development USA",
    "TypeScript web development agency",
    "full stack web development USA",
    "Node.js web application agency",
    "SaaS web app development USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/software-development/web-app-development" },
  openGraph: {
    title: "Web Application Development Agency USA | HotBot Studios",
    description: "Custom React, Next.js, and Node.js web apps for US businesses — dashboards, B2B platforms, and internal tools. 4-week MVP delivery.",
    url: "https://hotbotstudios.com/software-development/web-app-development",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Web Application Development",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Custom Web Application Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom web application development using React 19, Next.js 15, TypeScript, and Node.js for US businesses. Scalable dashboards, multi-user platforms, and internal tools.",
  url: "https://hotbotstudios.com/software-development/web-app-development",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "Web Application Development", item: "https://hotbotstudios.com/software-development/web-app-development" },
  ],
};

const CONTENT = [
  {
    heading: "Custom Web Apps Beat Off-the-Shelf Software for Growing US Businesses",
    body: "Generic SaaS tools are built for the average business — which means they fit your workflows partially, force workarounds everywhere else, and charge you per seat forever. Custom web applications are built around the exact way your business operates: your data model, your user roles, your reporting needs, and your integration requirements. The ROI calculation shifts once you cross a certain team size or process complexity: a bespoke internal tool that takes eight weeks to build often replaces three separate SaaS subscriptions costing $2,000 per month, pays for itself within a year, and scales with your business without subscription creep. HotBot Studios builds web applications for US businesses that are outgrowing their current tooling and need software that works exactly the way they work — not the way a product manager somewhere assumed they would.",
    color: "#3b82f6",
  },
  {
    heading: "Our Tech Stack: React 19, Next.js 15, Node.js, and AWS",
    body: "Every web application we build uses a production-grade, battle-tested technology stack. Frontend: React 19 with TypeScript for type-safe, maintainable UI code; Next.js 15 App Router for server-side rendering, edge performance, and SEO; Tailwind CSS for consistent, responsive design systems. Backend: Node.js or Python FastAPI for API layers; PostgreSQL or MongoDB for structured and document data; Redis for caching and session management. Infrastructure: AWS (EC2, RDS, S3, Lambda, CloudFront) or Vercel for edge-deployed Next.js apps, with Docker containerisation and GitHub Actions CI/CD pipelines that deploy tested code automatically. This is the stack that reliable, scalable web applications are built on, and it is the stack our engineers know deeply enough to build fast and maintain long-term.",
    color: "#8b5cf6",
  },
  {
    heading: "From Technical Brief to Working MVP in Four Weeks",
    body: "Our development process starts with a Technical Scoping session where we map your requirements to a concrete system design: data models, API contracts, user roles, third-party integrations, and the explicit definition of what is in and out of scope for the MVP. From that brief, we build in two-week sprints with a staging deployment at the end of every sprint — so you see working software every two weeks, not a finished product after three months. The MVP milestone is a fully deployed, production-quality application with core features complete, authentication working, and your team able to use it. Post-MVP, we continue in fortnightly sprints adding the feature roadmap items that were de-scoped from v1.",
    color: "#22c55e",
  },
  {
    heading: "AI Integration, Performance, and Long-Term Support",
    body: "Modern web applications increasingly need AI capabilities embedded natively. HotBot Studios integrates GPT-4o, Claude 3.5, and custom fine-tuned models directly into web app workflows: intelligent search, automated data analysis, natural language interfaces, AI-powered recommendations, and document processing pipelines. Every application we ship is performance-optimised at the architecture level: Core Web Vitals targets baked into the design, database query optimisation, CDN configuration, and load testing before production deployment. We also offer post-launch support and maintenance retainers, ensuring your application stays updated, secure, and performant as your user base and data volume grow. Request a free scoping call below and we will respond with a technical proposal within 24 hours.",
    color: "#06b6d4",
  },
];

export default function WebAppDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Web Application Development"
        title="Software Built Around Your Business, Not the Other Way Around"
        subtitle="Custom React, Next.js, and Node.js web applications for US businesses — dashboards, B2B platforms, internal tools, and AI-powered apps. Built in sprints. Deployed on AWS."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Technical Scoping Call</h2>
            <p className="text-slate-400">Describe what you need to build. We will respond with a system design overview and project estimate within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="software-web-app"
            accentColor="#3b82f6"
            title="Start Your Web App Project"
            subtitle="No obligation. Share your requirements and we will scope the technical approach and timeline."
          />
        </Reveal>
      </section>
    </>
  );
}
