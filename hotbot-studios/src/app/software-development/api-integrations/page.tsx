import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

export const metadata: Metadata = {
  title: "API Development & Integration Agency USA — REST, GraphQL & Third-Party APIs | HotBot Studios",
  description:
    "HotBot Studios builds RESTful APIs, GraphQL APIs, and third-party integrations for US businesses. Connect HubSpot, Salesforce, Stripe, Shopify, and 500+ platforms. OpenAPI spec, rate limiting, enterprise security. Free technical scoping.",
  keywords: [
    "API development agency USA",
    "REST API development USA",
    "GraphQL API development",
    "third-party API integration USA",
    "API integration agency USA",
    "HubSpot API integration",
    "Salesforce API integration agency",
    "Stripe API integration",
    "Shopify API integration",
    "API gateway development USA",
    "webhook development agency",
    "enterprise API development USA",
    "OpenAPI specification agency",
    "microservices API development USA",
  ],
  openGraph: {
    title: "API Development & Integration Agency USA — REST, GraphQL & Third-Party | HotBot Studios",
    description: "RESTful APIs, GraphQL, and third-party integrations for US businesses. Connect HubSpot, Salesforce, Stripe & 500+ platforms. OpenAPI spec.",
    url: "https://hotbotstudios.com/software-development/api-integrations",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "API Development & Integration Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "API Development & Integration Agency USA | HotBot Studios",
    description: "REST, GraphQL & third-party API integrations. Connect HubSpot, Salesforce, Stripe & 500+ platforms.",
  },
  alternates: { canonical: "https://hotbotstudios.com/software-development/api-integrations" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "API Development & Integration Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "API Development & Systems Integration",
  areaServed: { "@type": "Country", name: "United States" },
  description: "RESTful and GraphQL API development, third-party API integrations, webhook infrastructure, and system connectivity for US businesses. OpenAPI specification, rate limiting, OAuth 2.0, and enterprise-grade security.",
  url: "https://hotbotstudios.com/software-development/api-integrations",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "API Development & Integration", item: "https://hotbotstudios.com/software-development/api-integrations" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between REST and GraphQL APIs?", acceptedAnswer: { "@type": "Answer", text: "REST APIs use fixed endpoints (e.g., /users, /orders) with standard HTTP methods — simple, widely understood, and ideal for most business integrations. GraphQL uses a single endpoint with a flexible query language that lets clients request exactly the data they need, reducing over-fetching. HotBot Studios recommends REST for most business APIs and GraphQL for product APIs with complex, nested data requirements or multiple consuming clients (web, mobile, third-party)." } },
    { "@type": "Question", name: "How do you secure APIs against unauthorised access?", acceptedAnswer: { "@type": "Answer", text: "We implement OAuth 2.0 and JWT (JSON Web Token) authentication, API key management with scoped permissions, rate limiting and throttling, IP allowlisting for sensitive endpoints, HTTPS-only enforcement, and input validation to prevent injection attacks. For enterprise APIs, we support SAML 2.0 and client certificate authentication." } },
    { "@type": "Question", name: "Can you integrate HubSpot, Salesforce, or Shopify into our existing systems?", acceptedAnswer: { "@type": "Answer", text: "Yes — HubSpot, Salesforce, Shopify, Stripe, Xero, QuickBooks, Google Workspace, Slack, and 500+ other platforms are common integration projects. We build bidirectional data sync, webhook listeners, field mapping, error handling, and retry logic to ensure your integrations are robust and maintainable." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🔌", title: "RESTful API Development", desc: "Clean, well-documented REST APIs built to OpenAPI 3.0 specification — versioned, rate-limited, and secured with OAuth 2.0 and JWT. Includes Postman/Swagger documentation delivered with every API.", href: "/software-development/api-integrations" },
  { icon: "🕸️", title: "GraphQL API Development", desc: "Flexible GraphQL APIs for products with complex, nested data or multiple consuming clients (web app, mobile app, third-party). Schema-first design, resolver optimisation, and persisted queries for performance.", href: "/software-development/api-integrations" },
  { icon: "🔗", title: "Third-Party API Integrations", desc: "Bidirectional integrations with HubSpot, Salesforce, Stripe, Shopify, Xero, QuickBooks, Google Workspace, Slack, and 500+ platforms. Field mapping, data transformation, webhook listeners, and error handling included.", href: "/software-development/api-integrations" },
  { icon: "📨", title: "Webhook Infrastructure", desc: "Outbound webhook delivery systems for your product — allowing customers to receive real-time event notifications in their own systems. Includes delivery guarantees, retry logic, event logs, and a developer dashboard.", href: "/software-development/api-integrations" },
  { icon: "🛡️", title: "API Gateway & Security", desc: "AWS API Gateway or Kong configuration with rate limiting, IP allowlisting, bot protection, DDoS mitigation, and API key management. Enterprise API security hardened to OWASP API Security Top 10.", href: "/software-development/api-integrations" },
  { icon: "🔄", title: "Legacy System Integration", desc: "Connect modern applications to legacy ERP, CRM, or database systems via middleware adapters, ETL pipelines, and message queues (RabbitMQ, AWS SQS). Transform and migrate data without disrupting existing operations.", href: "/software-development/api-integrations" },
];

const STATS = [
  { value: 50, suffix: "+", label: "Platforms We Integrate", color: "#06b6d4" },
  { value: 99.9, suffix: "%", label: "API Uptime SLA", color: "#22c55e" },
  { value: 150, suffix: "+", label: "API Projects Delivered", color: "#3b82f6" },
  { value: 100, suffix: "ms", label: "Avg API Response Time Target", color: "#8b5cf6" },
];

const PROCESS = [
  { n: 1, title: "API Design & Specification", desc: "Define the API contract — endpoints, request/response schemas, authentication method, rate limits, versioning strategy, and error codes — before any code is written. OpenAPI 3.0 spec delivered for review and approval.", icon: "📋" },
  { n: 2, title: "Security Architecture", desc: "Authentication flow design (OAuth 2.0, JWT, API keys), permission scoping, rate limiting rules, and data exposure audit. Security is designed in, not bolted on.", icon: "🔐" },
  { n: 3, title: "Development & Testing", desc: "API built to spec with comprehensive unit and integration tests. Postman collection and Swagger UI documentation generated automatically from the OpenAPI spec. Load testing to verify performance under expected traffic.", icon: "💻" },
  { n: 4, title: "Deploy, Document & Monitor", desc: "Production deployment with API gateway, Datadog/Sentry monitoring for error rates and latency, and developer documentation published. Ongoing support for API versioning and breaking changes.", icon: "🚀" },
];

const FAQS = [
  { q: "What is the difference between REST and GraphQL APIs?", a: "REST APIs use fixed endpoints with standard HTTP methods — simple and widely understood, ideal for most business integrations. GraphQL uses a single endpoint with a flexible query language that lets clients request exactly the data they need. We recommend REST for most business APIs and GraphQL for products with complex nested data or multiple consuming clients." },
  { q: "How do you secure APIs against unauthorised access?", a: "OAuth 2.0 and JWT authentication, API key management with scoped permissions, rate limiting and throttling, IP allowlisting for sensitive endpoints, HTTPS-only enforcement, and input validation. Enterprise APIs support SAML 2.0 and client certificate authentication." },
  { q: "Can you integrate HubSpot, Salesforce, or Shopify into our systems?", a: "Yes — HubSpot, Salesforce, Shopify, Stripe, Xero, QuickBooks, Google Workspace, Slack, and 500+ platforms are common projects. We build bidirectional data sync, webhook listeners, field mapping, error handling, and retry logic for robust, maintainable integrations." },
  { q: "What does API versioning mean and why does it matter?", a: "API versioning (e.g., /v1/users, /v2/users) allows you to evolve your API without breaking existing integrations. We implement versioning strategy from day one — so when you need to change a response structure or deprecate a field, you can do so without disrupting partners or customers who rely on your API." },
  { q: "How do you handle API errors and reliability?", a: "Consistent error response schemas (RFC 7807 Problem Details), retry-safe idempotency keys for mutation endpoints, circuit breakers for downstream service failures, dead-letter queues for failed webhook deliveries, and Datadog alerting for error rate spikes." },
  { q: "Can you build an API that lets our customers integrate with our product?", a: "Yes — public-facing developer APIs with authentication, rate limits, sandbox environments, and developer documentation are a common project type. We also build webhook delivery systems so your customers receive real-time events in their own systems, significantly increasing your product's enterprise appeal." },
];

const RELATED = [
  { title: "SaaS Platform Development", href: "/software-development/saas-development", desc: "Expose your SaaS via APIs for enterprise and partner integrations.", icon: "☁️" },
  { title: "AI Automation (n8n)", href: "/ai-automation", desc: "Connect your APIs to 500+ tools via n8n workflow automation.", icon: "🤖" },
  { title: "Enterprise Systems & Portals", href: "/software-development/enterprise-software", desc: "Integrate APIs with your enterprise ERP and CRM systems.", icon: "🔐" },
];

export default function ApiIntegrationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="API Development & Integration USA"
        title="Connect Everything. Automate Anything. Break Nothing."
        subtitle="HotBot Studios builds RESTful APIs, GraphQL APIs, and third-party integrations that connect your systems, expose your product to partners, and eliminate manual data transfer between tools. OpenAPI spec, enterprise security, and 99.9% uptime."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">API development & integration (definition):</strong> An API (Application Programming Interface) is the standardised contract that allows software systems to communicate — sending and receiving data in a structured format (JSON, XML) over HTTP or messaging protocols. API development is the creation of these interfaces; API integration is the process of connecting existing systems (HubSpot, Salesforce, Shopify) to each other or to your custom software. In 2026, the average enterprise uses 1,000+ SaaS applications — the vast majority of operational inefficiency comes from systems that don&apos;t communicate. Every hour your team spends copying data between tools is an API integration that hasn&apos;t been built yet.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Integration Ecosystem ────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Platforms We Integrate — The HotBot Studios Integration Ecosystem</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { category: "CRM & Sales", tools: ["HubSpot", "Salesforce", "Pipedrive", "Close CRM"], color: "#3b82f6" },
                  { category: "Payments & Finance", tools: ["Stripe", "Xero", "QuickBooks", "Plaid"], color: "#22c55e" },
                  { category: "Commerce", tools: ["Shopify", "WooCommerce", "Magento", "BigCommerce"], color: "#ec4899" },
                  { category: "Productivity", tools: ["Google Workspace", "Slack", "Notion", "Airtable"], color: "#f59e0b" },
                ].map((col, i) => (
                  <div key={i} className="p-4 rounded-2xl" style={{ background: `${col.color}10`, border: `1px solid ${col.color}25` }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: col.color }}>{col.category}</div>
                    <div className="space-y-1.5">
                      {col.tools.map((tool, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                          <span className="text-slate-300 text-xs">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* API performance benchmarks */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">API Performance Standards We Engineer To</p>
              <div className="space-y-3">
                {[
                  { label: "Response time (GET endpoints)", target: "< 100ms p50", pct: 92, color: "#06b6d4" },
                  { label: "Response time (POST mutations)", target: "< 300ms p50", pct: 85, color: "#3b82f6" },
                  { label: "API availability SLA", target: "99.9% uptime", pct: 95, color: "#22c55e" },
                  { label: "Webhook delivery success rate", target: "> 99.5%", pct: 90, color: "#8b5cf6" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-52 shrink-0 text-right hidden md:block">{row.label}</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">{row.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">All APIs include Datadog monitoring with alerting for error rate spikes and latency degradation.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="API Services We Build" columns={3} />
      <ServiceStats stats={STATS} title="API Development Track Record" />
      <ProcessSteps steps={PROCESS} title="Our API Development Process" />

      {/* ── REST vs GraphQL Decision Guide ────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">REST vs GraphQL — When to Use Each</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              icon: "🔌", title: "Choose REST When…", color: "#3b82f6",
              points: ["Your API serves a single client type (e.g., web app only)", "Simplicity and developer familiarity matter most", "Caching of responses is important (CDN-cacheable GET requests)", "Integration with third-party tools and n8n/Zapier is required", "You're building a public-facing API for third-party developers"],
            },
            {
              icon: "🕸️", title: "Choose GraphQL When…", color: "#8b5cf6",
              points: ["Multiple clients with different data needs (web + mobile + partner)", "Complex, nested data relationships (reduce round trips)", "Rapid frontend iteration without backend changes (schema flexibility)", "Real-time subscriptions via GraphQL subscriptions (WebSocket)", "You want automatic API documentation via schema introspection"],
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-3 text-lg">{item.title}</h3>
                <div className="space-y-2">
                  {item.points.map((point, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5" style={{ color: item.color }}>✓</span>
                      <span className="text-slate-400 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — API Development & Integration for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios builds REST and GraphQL APIs to OpenAPI 3.0 specification with Postman/Swagger documentation included.",
                "We integrate with 50+ platforms including HubSpot, Salesforce, Stripe, Shopify, Google Workspace, Slack, and more.",
                "All APIs are secured with OAuth 2.0, JWT, rate limiting, and OWASP API Security compliance.",
                "Webhook delivery infrastructure with retry logic, dead-letter queues, and developer dashboards enables enterprise product integrations.",
                "API performance targets: <100ms response time (GET), 99.9% uptime SLA, monitored via Datadog.",
                "Legacy system integration via middleware adapters and ETL pipelines — connecting modern apps to existing ERP/CRM without disruption.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Ready to Connect Your Systems?"
        subtitle="Tell us which platforms you need integrated and what data needs to flow between them. We'll design the integration architecture and deliver a working, tested API — with full documentation. Free technical scoping call."
        formType="get-started"
      />
    </>
  );
}
