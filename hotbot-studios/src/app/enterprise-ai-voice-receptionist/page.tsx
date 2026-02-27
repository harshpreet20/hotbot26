import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enterprise AI Voice Receptionist for US Businesses | HotBot Studios",
  description:
    "Enterprise AI voice receptionist with CRM integration, automated call routing, and lead qualification built for US B2B organizations.",
  keywords: [
    "enterprise ai voice receptionist",
    "enterprise ai call automation",
    "ai phone answering system with crm integration",
    "ai inbound call qualification software",
    "enterprise conversational ai platform",
    "ai call routing for multi location companies",
    "ai voice agent for sales teams",
    "b2b voice automation software",
    "ai voice receptionist integrated with salesforce",
    "enterprise call automation with analytics dashboard",
  ],
  openGraph: {
    title: "Enterprise AI Voice Receptionist | Heka Voice AI",
    description:
      "Automate inbound calls, qualify leads, and integrate directly with CRM systems using enterprise-grade conversational AI.",
    url: "https://hotbotstudios.com/enterprise-ai-voice-receptionist",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Enterprise AI Voice Receptionist — HotBot Studios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise AI Voice Receptionist | Heka Voice AI",
    description:
      "Automate inbound calls, qualify leads, and integrate directly with CRM systems using enterprise-grade conversational AI.",
  },
  alternates: { canonical: "https://hotbotstudios.com/enterprise-ai-voice-receptionist" },
};

// ── Schema Markup ─────────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Enterprise AI Voice Receptionist for US Businesses",
  description:
    "Enterprise AI voice receptionist with CRM integration, automated call routing, and lead qualification built for US B2B organizations.",
  provider: {
    "@type": "Organization",
    name: "HotBot Studios",
    url: "https://hotbotstudios.com",
  },
  serviceType: "Enterprise AI Voice Automation",
  areaServed: { "@type": "Country", name: "United States" },
  url: "https://hotbotstudios.com/enterprise-ai-voice-receptionist",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    {
      "@type": "ListItem",
      position: 2,
      name: "AI Automation",
      item: "https://hotbotstudios.com/ai-automation",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Enterprise AI Voice Receptionist",
      item: "https://hotbotstudios.com/enterprise-ai-voice-receptionist",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is this different from IVR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IVR systems rely on static menu trees. Heka uses conversational AI to interpret intent and collect structured information dynamically.",
      },
    },
    {
      "@type": "Question",
      name: "Can it integrate with Salesforce?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Native and API-based integrations support bidirectional CRM synchronization.",
      },
    },
    {
      "@type": "Question",
      name: "Does it replace human receptionists entirely?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can automate repetitive intake and qualification while escalating complex interactions to humans when required.",
      },
    },
    {
      "@type": "Question",
      name: "Is call data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Data handling policies are configurable. Encryption and access controls are built into the infrastructure.",
      },
    },
  ],
};

const STATS = [
  { value: 100, suffix: "%", label: "Inbound Call Coverage", color: "#3b82f6" },
  { value: 40, suffix: "%", label: "Qualification Improvement", color: "#8b5cf6" },
  { value: 0, suffix: " manual entry", label: "After Each Call", color: "#06b6d4" },
  { value: 7, suffix: " days", label: "Enterprise Deployment", color: "#22c55e" },
];

const PROCESS = [
  {
    n: 1,
    title: "Intake Mapping",
    desc: "Define qualification criteria, routing logic, escalation rules, and integration requirements. Delivered as a complete system blueprint within 48 hours of kickoff.",
    icon: "🔍",
  },
  {
    n: 2,
    title: "Integration Configuration",
    desc: "Connect Heka to your CRM, calendar systems, and backend platforms. Supports Salesforce, HubSpot, Microsoft Dynamics, and custom API environments.",
    icon: "⚙️",
  },
  {
    n: 3,
    title: "Conversational Modeling",
    desc: "Build qualification logic trees aligned to your operational workflows. Test against 100+ simulated call scenarios before going to production.",
    icon: "🧪",
  },
  {
    n: 4,
    title: "Launch and Optimization",
    desc: "Deploy on your existing enterprise phone infrastructure. Weekly performance reports. Scripts refine automatically based on live call data.",
    icon: "🚀",
  },
];

const FAQS = [
  {
    q: "How is this different from IVR?",
    a: "IVR systems rely on static menu trees. Heka uses conversational AI to interpret intent and collect structured information dynamically, adapting to caller responses rather than forcing selection from predefined options.",
  },
  {
    q: "Can it integrate with Salesforce?",
    a: "Yes. Native and API-based integrations support bidirectional CRM synchronization including lead creation, field mapping, pipeline stage updates, and task assignment.",
  },
  {
    q: "Does it replace human receptionists entirely?",
    a: "It automates repetitive intake and qualification workflows while escalating complex interactions to human team members when required. Escalation rules are configurable per call type.",
  },
  {
    q: "Is call data secure?",
    a: "Data handling policies are fully configurable. Encrypted call handling, configurable retention policies, audit logs, and role-based access controls are built into the enterprise infrastructure.",
  },
];

const RELATED = [
  {
    title: "AI Automation Services",
    href: "/ai-automation",
    desc: "Custom AI agents, chatbots, and workflow automation for US enterprises.",
    icon: "🤖",
  },
  {
    title: "Analytics and Attribution",
    href: "/marketing-services",
    desc: "GA4, CRM, and revenue attribution reporting for enterprise marketing teams.",
    icon: "📊",
  },
  {
    title: "Growth Strategy and Roadmap",
    href: "/consultancy",
    desc: "Enterprise digital transformation and go-to-market strategy consulting.",
    icon: "🗺️",
  },
];

const USE_CASES = [
  {
    segment: "B2B SaaS Organizations",
    desc: "Qualify demo requests before routing to regional sales teams. Capture prospect size, use case, and timeline during the initial call.",
    color: "#3b82f6",
  },
  {
    segment: "Healthcare Networks",
    desc: "Route patients by specialty, capture intake data securely, and reduce front desk call volume without sacrificing patient experience.",
    color: "#8b5cf6",
  },
  {
    segment: "Professional Services Firms",
    desc: "Pre-screen inquiries against matter type, urgency, and budget before routing to partner-level consultations.",
    color: "#06b6d4",
  },
  {
    segment: "Multi-Location Enterprises",
    desc: "Route calls dynamically based on region, department, and team availability across distributed operations.",
    color: "#22c55e",
  },
  {
    segment: "Franchise Systems",
    desc: "Centralize intake and qualification at the corporate level while preserving local brand engagement per location.",
    color: "#f59e0b",
  },
  {
    segment: "Enterprise Sales Teams",
    desc: "Qualify inbound pipeline at volume, capture structured buying intent, and route high-value opportunities to senior representatives.",
    color: "#ec4899",
  },
];

const INTEGRATION_FEATURES = [
  { label: "CRM Integration", items: ["Salesforce", "HubSpot", "Microsoft Dynamics", "Custom API"] },
  { label: "Calendar Systems", items: ["Google Calendar", "Outlook", "Calendly", "HubSpot Meetings"] },
  { label: "Analytics", items: ["GA4", "UTM tagging", "Revenue attribution", "Custom dashboards"] },
  { label: "Security", items: ["Encrypted calls", "Audit logs", "Access controls", "Configurable retention"] },
];

export default function EnterpriseAIVoiceReceptionistPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-24 pb-0 px-6 max-w-5xl mx-auto">
        <ol className="flex items-center gap-2 text-xs text-slate-500">
          <li>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
          </li>
          <li className="text-slate-700">/</li>
          <li>
            <Link href="/ai-automation" className="hover:text-slate-300 transition-colors">
              AI Automation
            </Link>
          </li>
          <li className="text-slate-700">/</li>
          <li>
            <Link href="/products/heka-voice-ai" className="hover:text-slate-300 transition-colors">
              Heka Voice AI
            </Link>
          </li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">Enterprise</li>
        </ol>
      </nav>

      {/* Enterprise Badge */}
      <Reveal>
        <div className="pt-8 pb-0 px-6 max-w-5xl mx-auto flex justify-center">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#93c5fd",
            }}
          >
            Enterprise
          </span>
        </div>
      </Reveal>

      <PageHeader
        label="Enterprise AI Voice Receptionist"
        title="Enterprise AI Voice Receptionist for US Businesses"
        subtitle="Replace inconsistent call handling with structured, CRM-integrated conversational AI that qualifies leads, routes conversations intelligently, and logs every interaction into your enterprise systems automatically."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Enterprise AI Voice Receptionist:</strong>{" "}
              An enterprise-grade conversational AI system that automates inbound and outbound voice
              interactions across sales, support, and operations. It replaces manual intake and static
              IVR trees with dynamic qualification logic, real-time CRM synchronization, and structured
              data capture designed for US B2B organizations operating at scale.
            </p>
          </div>
        </section>
      </Reveal>

      {/* What enterprises get wrong */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            What Enterprise Organizations Get Wrong About Call Automation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                title: "Routing Over Qualification",
                desc: "Traditional IVR trees move callers but do not capture structured buying intent. Routing without qualification creates pipeline noise.",
                color: "#ef4444",
              },
              {
                n: "02",
                title: "Disconnected Revenue Systems",
                desc: "Calls logged manually outside CRM break attribution and reporting. Voice becomes an invisible revenue channel that cannot be measured.",
                color: "#f59e0b",
              },
              {
                n: "03",
                title: "Intake Variability",
                desc: "Different representatives gather different information on the same call type. Data quality degrades across locations, reducing operational consistency.",
                color: "#8b5cf6",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="p-6 rounded-2xl border"
                style={{ background: `${item.color}08`, borderColor: `${item.color}20` }}
              >
                <div
                  className="text-3xl font-black mb-3 opacity-40"
                  style={{ color: item.color }}
                >
                  {item.n}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="Enterprise Performance Benchmarks" />

      {/* Integration Architecture */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Enterprise Integration Architecture
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INTEGRATION_FEATURES.map((group) => (
              <div
                key={group.label}
                className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
              >
                <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-300 text-xs">
                      <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Reveal delay={0.15}>
            <p className="text-slate-400 text-sm text-center mt-8 max-w-2xl mx-auto leading-relaxed">
              Data captured during calls triggers CRM workflows, assigns ownership automatically, and
              updates pipeline stages in real time. Voice becomes a structured data source inside
              enterprise infrastructure — not a disconnected channel.
            </p>
          </Reveal>
        </section>
      </Reveal>

      {/* Enterprise Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Enterprise Use Cases
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {USE_CASES.map((uc) => (
            <Reveal key={uc.segment}>
              <div
                className="p-5 rounded-2xl border"
                style={{ background: `${uc.color}08`, borderColor: `${uc.color}20` }}
              >
                <h3 className="font-semibold mb-2 text-sm" style={{ color: uc.color }}>
                  {uc.segment}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">{uc.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Security and Compliance */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Security, Compliance, and Operational Control
          </h2>
          <div
            className="p-8 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}
          >
            {[
              "Encrypted call handling end-to-end",
              "Configurable data retention policies",
              "Full audit logs per call session",
              "Role-based access control layers",
              "Human escalation routing with fallback",
              "Organization retains full data ownership",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="Enterprise Deployment Process" />

      {/* FAQ */}
      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Summary
          </h2>
          <ul className="space-y-4">
            {[
              "Enterprise organizations that rely on inbound calls cannot afford inconsistent intake, missed demand, or untracked revenue influence",
              "Heka Voice AI replaces manual bottlenecks with structured conversational automation across departments and locations",
              "Direct integration with Salesforce, HubSpot, and custom CRM environments converts voice into structured pipeline data",
              "Revenue attribution through UTM tagging, CRM event creation, and GA4 integration makes voice measurable",
              "Security controls, audit logs, and configurable data retention satisfy enterprise procurement and compliance requirements",
              "Enterprise deployment is operational within weeks with no technical setup required from your internal team",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* Related */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Schedule an Enterprise Technical Walkthrough"
        subtitle="Evaluate system fit, integration requirements, and deployment timeline for your organization. No commitment required."
        formType="get-started"
      />
    </>
  );
}
