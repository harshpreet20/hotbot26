import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "API Development & Integration Services USA — REST, GraphQL & Webhooks | HotBot Studios",
  description:
    "HotBot Studios builds and integrates RESTful and GraphQL APIs for US businesses. Connect your CRM, ERP, payment processors, and third-party tools into a unified data layer. OpenAPI documentation included. Free API scoping call.",
  keywords: [
    "API development agency USA",
    "REST API development USA",
    "GraphQL API development USA",
    "API integration services USA",
    "third-party API integration USA",
    "webhook integration development",
    "CRM API integration USA",
    "custom API development USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/software-development/api-integrations" },
  openGraph: {
    title: "API Development & Integration Services USA | HotBot Studios",
    description: "RESTful and GraphQL API development and third-party integration for US businesses. Connect your entire software stack into a single data layer.",
    url: "https://hotbotstudios.com/software-development/api-integrations",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "API Development & Integration",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "API Development and Systems Integration",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom RESTful and GraphQL API development and third-party integration services for US businesses. OpenAPI documentation, rate limiting, authentication, and enterprise-grade security included.",
  url: "https://hotbotstudios.com/software-development/api-integrations",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "API Development & Integration", item: "https://hotbotstudios.com/software-development/api-integrations" },
  ],
};

const CONTENT = [
  {
    heading: "APIs Are the Connective Tissue of the Modern Software Stack",
    body: "Every growing US business runs on a collection of software tools that do not talk to each other natively — a CRM, an ERP or inventory system, a payment processor, a marketing automation platform, a customer support tool, and often several internal databases. The manual work of keeping data consistent across these systems is the invisible tax on your operations team's time, and the data inconsistencies it produces are the invisible tax on your decision-making quality. A well-designed API layer eliminates both taxes: it creates a single authoritative source of truth for your business data, exposes that data to every tool that needs it through documented, versioned endpoints, and automates the synchronisation that your team currently handles with spreadsheets and manual exports. HotBot Studios designs API architectures that integrate your existing tools and serve as the foundation for the new products and workflows you have not built yet.",
    color: "#22c55e",
  },
  {
    heading: "REST vs GraphQL: Choosing the Right API Paradigm for Your Use Case",
    body: "REST APIs are the right choice for most use cases: they are simple, widely understood, easy to cache, and compatible with every HTTP client. RESTful APIs with OpenAPI 3 specifications are our default for internal APIs, third-party integrations, and public developer APIs where documentation and client library generation matter. GraphQL is the right choice when your frontend applications need to query complex, nested data relationships efficiently and when you are building a single API that serves multiple clients (web app, mobile app, third-party integrations) with different data requirements. HotBot Studios has built both at production scale and will recommend the appropriate paradigm for your specific use case rather than applying a one-size-fits-all approach. We also implement gRPC for high-throughput internal microservice communication where performance is critical.",
    color: "#3b82f6",
  },
  {
    heading: "Third-Party Integrations: CRMs, Payment Processors, ERPs, and AI Services",
    body: "The most common API integration requests we handle are Salesforce and HubSpot CRM bidirectional sync (keeping lead and deal data consistent between your product and your sales tools), Stripe and Braintree payment processing (building checkout flows, subscription management, and payment reconciliation pipelines), Shopify and WooCommerce e-commerce data (syncing orders, inventory, and customer data into your operational systems), QuickBooks and Xero accounting integration (automating invoice creation and revenue recognition), and AI service integrations (OpenAI, Anthropic, Google AI) for adding LLM capabilities to existing products. We also build webhook infrastructure that allows your product to notify external systems in real time when events occur, and we implement the retry logic, signature verification, and dead-letter queues that make webhooks reliable in production.",
    color: "#8b5cf6",
  },
  {
    heading: "Security, Documentation, Rate Limiting, and API Versioning",
    body: "A production API is only as good as its security and documentation. HotBot Studios implements OAuth 2.0 and API key authentication with scope-based access control, so that each consumer of your API has access only to the endpoints and data it needs. Rate limiting and throttling protect your infrastructure from abuse and ensure fair usage across API consumers. All APIs we build are documented with OpenAPI 3 specifications and interactive Swagger UI documentation, so your internal developers and external integrators can understand and test every endpoint without reading your codebase. API versioning strategy (URL versioning vs header versioning) is designed from the start so that breaking changes can be introduced without breaking existing integrations. Request a free API scoping call below and we will assess your integration requirements and propose a data architecture within 24 hours.",
    color: "#ec4899",
  },
];

export default function ApiIntegrationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Software Development", href: "/software-development" }, { label: "Api Integrations" }]} />

      <PageHeader
        label="API Development & Integration"
        title="Connect Every Tool in Your Stack Into a Single Source of Truth"
        subtitle="RESTful and GraphQL API development and third-party integration for US businesses — CRM, ERP, payment processors, and AI services unified into a documented, versioned data layer."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free API Architecture Review</h2>
            <p className="text-slate-400">Describe your integration challenges or the API you need to build. We will respond with an architecture proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="software-api-integrations"
            accentColor="#22c55e"
            title="Start Your API Integration Project"
            subtitle="No obligation. Share the systems you need to connect and we will scope the integration approach."
          />
        </Reveal>
      </section>
    </>
  );
}
