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
  title: "n8n Workflow Automation for US Businesses, HubSpot, Salesforce & 500+ Tools | HotBot Studios",
  description: "HotBot Studios builds n8n automation workflows that connect your CRM, email, Slack, Google Sheets, and 500+ tools, eliminating manual data entry and repetitive tasks. Book a free workflow audit.",
  keywords: [
    "n8n workflow automation USA",
    "business process automation USA",
    "HubSpot automation workflows",
    "Salesforce workflow automation",
    "no-code automation USA",
    "Zapier alternative n8n",
    "CRM automation workflows",
    "Slack automation integration",
    "automated business workflows",
    "n8n developer USA"
  ],
  openGraph: {
    title: "n8n Workflow Automation for US Businesses, HubSpot, Salesforce & 500+ Tools | HotBot Studios",
    description: "HotBot Studios builds n8n automation workflows that connect your CRM, email, Slack, Google Sheets, and 500+ tools, eliminating manual data entry and repetitive tasks. Book a free workflow audit.",
    url: "https://hotbotstudios.com/ai-automation/n8n-workflow-automation",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "n8n Workflow Automation, Connect Everything, Automate Anything" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "n8n Workflow Automation for US Businesses, HubSpot, Salesforce & 500+ Tools | HotBot Studios",
    description: "HotBot Studios builds n8n automation workflows that connect your CRM, email, Slack, Google Sheets, and 500+ tools, eliminating manual data entry and repetitive tasks. Book a free workflow audit.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ai-automation/n8n-workflow-automation" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "n8n Workflow Automation, Connect Everything, Automate Anything",
  "description": "HotBot Studios builds n8n automation workflows that connect your CRM, email, Slack, Google Sheets, and 500+ tools, eliminating manual data entry and repetitive tasks. Book a free workflow audit.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "Workflow Automation",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/ai-automation/n8n-workflow-automation"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://hotbotstudios.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "AI Automation",
      "item": "https://hotbotstudios.com/ai-automation"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "n8n Workflow Automation",
      "item": "https://hotbotstudios.com/ai-automation/n8n-workflow-automation"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is n8n better than Zapier or Make for our business?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "n8n offers self-hosted deployment (your data never leaves your servers), no per-task pricing at scale, more powerful branching and error-handling logic, and the ability to embed AI steps (GPT-4o, Claude) directly into workflows. For high-volume or data-sensitive automations, n8n significantly outperforms Zapier and Make."
      }
    },
    {
      "@type": "Question",
      "name": "Do we need to manage n8n's server infrastructure ourselves?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. HotBot Studios fully manages your n8n instance on AWS or GCP, including server setup, updates, backups, monitoring, and scaling. You interact only with the n8n visual editor, or we manage it entirely on your behalf."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a workflow fails?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We configure automatic failure alerts (Slack or email) and implement retry logic for transient errors. For critical workflows, we set up backup execution paths. Every failed execution is logged with full debug information so issues are resolved quickly."
      }
    },
    {
      "@type": "Question",
      "name": "Can you automate workflows that involve AI decisions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. n8n has native OpenAI and Anthropic integrations. We build hybrid workflows where n8n handles data movement and triggering, and GPT-4o or Claude 3 handles intelligent decisions, like classifying emails, scoring leads, or generating personalised content at scale."
      }
    }
  ]
};

const STATS = [
    { value: 12, suffix: "hrs", label: "average hours saved per team member per week after workflow automation", color: "#f59e0b" },
    { value: 500, suffix: "+", label: "native app connectors available in n8n without custom code", color: "#8b5cf6" },
    { value: 99.9, suffix: "%", label: "workflow uptime on our managed n8n infrastructure", color: "#06b6d4" },
    { value: 3, suffix: "wk", label: "average time from workflow design to production deployment", color: "#10b981" }
];

const PROCESS = [
    { n: 1, title: "Workflow Mapping", desc: "We document your current manual processes, identify automation opportunities, and prioritise by ROI, starting with the highest-volume, most repetitive workflows.", icon: "🗺️" },
    { n: 2, title: "Architecture & Security Design", desc: "We design the workflow logic, choose self-hosted vs. cloud deployment based on your data requirements, and set up secure API credential management.", icon: "🏗️" },
    { n: 3, title: "Build, Test & Validate", desc: "Workflows are built, tested with real data, and validated for edge cases, including error handling, retry logic, and failure notifications.", icon: "🔧" },
    { n: 4, title: "Deploy, Train & Maintain", desc: "We deploy workflows, document each one, train your team on monitoring and simple modifications, and provide ongoing maintenance and updates.", icon: "📈" }
];

const FAQS = [
    { q: "How is n8n better than Zapier or Make for our business?", a: "n8n offers self-hosted deployment (your data never leaves your servers), no per-task pricing at scale, more powerful branching and error-handling logic, and the ability to embed AI steps (GPT-4o, Claude) directly into workflows. For high-volume or data-sensitive automations, n8n significantly outperforms Zapier and Make." },
    { q: "Do we need to manage n8n's server infrastructure ourselves?", a: "No. HotBot Studios fully manages your n8n instance on AWS or GCP, including server setup, updates, backups, monitoring, and scaling. You interact only with the n8n visual editor, or we manage it entirely on your behalf." },
    { q: "What happens if a workflow fails?", a: "We configure automatic failure alerts (Slack or email) and implement retry logic for transient errors. For critical workflows, we set up backup execution paths. Every failed execution is logged with full debug information so issues are resolved quickly." },
    { q: "Can you automate workflows that involve AI decisions?", a: "Yes. n8n has native OpenAI and Anthropic integrations. We build hybrid workflows where n8n handles data movement and triggering, and GPT-4o or Claude 3 handles intelligent decisions, like classifying emails, scoring leads, or generating personalised content at scale." }
];

const RELATED = [
    { title: "Custom AI Agents", href: "/ai-automation/custom-ai-agents", desc: "Autonomous AI agents for complex multi-step tasks that go beyond simple trigger-based automation.", icon: "🤖" },
    { title: "AI Chatbots", href: "/ai-automation/ai-chatbots", desc: "Capture leads via chatbot and feed them directly into your n8n automation workflows.", icon: "💬" },
    { title: "LLM & GPT Integration", href: "/ai-automation/llm-gpt-integration", desc: "Embed GPT-4o intelligence as decision-making steps inside your n8n workflows.", icon: "🧠" }
];

export default function N8nWorkflowAutomationPage() {
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
          <li><Link href="/" className="hover:text-slate-300 transition-colors">Home</Link></li>
          <li className="text-slate-700">/</li>
          <li><Link href="/ai-automation" className="hover:text-slate-300 transition-colors">AI Automation</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">n8n Workflow Automation</li>
        </ol>
      </nav>

      <PageHeader
        label="Workflow Automation"
        title="n8n Workflow Automation, Connect Everything, Automate Anything"
        subtitle="Trigger-based automation workflows that connect your CRM, email, Slack, Google Sheets, Notion, and 500+ tools, eliminating manual handoffs and data silos forever."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">n8n Workflow Automation:</strong>{" "}
              n8n is an open-source workflow automation platform that connects 500+ apps and APIs via visual trigger-based workflows. Unlike Zapier or Make, n8n can be self-hosted for complete data control, supports complex branching logic, and handles high-volume automations without per-task pricing. HotBot Studios builds, hosts, and maintains n8n workflows that replace entire categories of manual work.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">What We Deliver</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div key="500+ Native Integrations" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`⚙️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`500+ Native Integrations`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Connect HubSpot, Salesforce, Pipedrive, Gmail, Outlook, Slack, Notion, Airtable, Google Sheets, Jira, Stripe, Shopify, and 500+ tools via native connectors, no custom code required.`}</p>
        </div>
        <div key="AI-Enhanced Workflows" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🧠`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`AI-Enhanced Workflows`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Embed GPT-4o or Claude 3 steps directly into workflows for intelligent data processing, email classification, lead scoring, content generation, and sentiment analysis at scale.`}</p>
        </div>
        <div key="Complex Branching Logic" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🔀`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Complex Branching Logic`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Build workflows with conditional branches, loops, error handling, and parallel execution paths, handling edge cases that simpler tools cannot.`}</p>
        </div>
        <div key="Self-Hosted Data Security" className="p-5 rounded-2xl border" style={{ background: "#10b98110", borderColor: "#10b98125" }}>
          <div className="text-2xl mb-3">{String.raw`🔒`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Self-Hosted Data Security`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Unlike Zapier or Make, n8n can run on your own infrastructure (AWS, GCP, or on-premise), keeping sensitive customer and business data within your security perimeter.`}</p>
        </div>
        <div key="Real-Time Monitoring" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Real-Time Monitoring`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Every workflow execution is logged with inputs, outputs, timing, and error details. Instant Slack or email alerts when a workflow fails, before it impacts your business.`}</p>
        </div>
        <div key="No Per-Task Pricing" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`💰`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`No Per-Task Pricing`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Unlike Zapier (which charges per task), n8n on self-hosted infrastructure scales to millions of executions per month without incremental cost, critical for high-volume automations.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="Sales Operations Teams" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`Sales Operations Teams`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`SDRs manually moving leads between spreadsheets, email, Slack, and CRM, losing data and wasting 2+ hours daily`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`n8n workflow: New form submission → enrich with Clearbit → score lead → create HubSpot contact → assign to rep → Slack notification → sequence enrollment`}</p>
        </div>
        <div key="E-Commerce & DTC Brands" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`E-Commerce & DTC Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Order data scattered across Shopify, Klaviyo, Google Sheets, and accounting software, requiring manual reconciliation weekly`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Real-time Shopify → Google Sheets → Klaviyo → QuickBooks sync with automatic refund processing and inventory alerts`}</p>
        </div>
        <div key="Marketing Agencies" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Marketing Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Manual client reporting taking 4–6 hours per week pulling data from GA4, Meta Ads, Google Ads, and HubSpot into spreadsheets`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Automated weekly report workflow: pull data from all sources → calculate KPIs → populate Google Sheets → generate PDF → email to client automatically`}</p>
        </div>
        <div key="HR & People Ops Teams" className="p-6 rounded-2xl border" style={{ background: "#10b98108", borderColor: "#10b98120" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#10b981" }}>{String.raw`HR & People Ops Teams`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`New hire onboarding requires creating accounts across 8+ tools, sending welcome emails, and scheduling first-week meetings manually`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Single trigger from HRIS (new hire added) auto-creates GSuite account, Slack invite, Notion workspace, Jira access, and sends personalised welcome sequence`}</p>
        </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="Our Engagement Process" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Report On</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "#f59e0b05", borderColor: "#f59e0b18" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Hours saved per week on automated workflows`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Workflow execution success rate (% completing without error)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Data accuracy rate (reduction in manual data entry errors)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Lead response time (from form fill to CRM contact creation + rep notification)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Report delivery time (from days to minutes)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Cost per workflow execution vs. manual equivalent`}</li>
            </ul>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Key Takeaways</h2>
          <ul className="space-y-4">
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`The best automation candidates are high-frequency, multi-system, rule-based tasks, not creative or relationship work`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Self-hosted n8n eliminates per-task costs that make Zapier prohibitively expensive at scale, a single high-volume workflow can save \$2,000+/month in tool costs alone`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`AI-enhanced workflows (n8n + GPT-4o) can handle tasks that pure automation cannot, like classifying messy data, drafting personalised responses, and making nuanced routing decisions`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Error handling and monitoring are not optional, an unmonitored workflow that silently fails is worse than no automation at all`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Start with one end-to-end workflow (e.g., lead intake to CRM to Slack) and prove value before automating complex processes`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Documentation of each workflow is critical, well-documented automations are maintained and extended by your team; undocumented ones become black boxes`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Automate the Workflows That Are Draining Your Team"
        subtitle="Book a free workflow audit. We'll map your top 3 automation opportunities and show you what a working n8n workflow looks like for your specific processes."
        formType="contact"
      />
    </>
  );
}
