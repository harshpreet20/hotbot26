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
  title: "Custom AI Agents for Business Automation — GPT-4o & Claude 3 | HotBot Studios",
  description: "HotBot Studios builds autonomous AI agents on GPT-4o, Claude 3, and Gemini that handle multi-step workflows, lead qualification, research, and decision-making 24/7. US-focused. Book a free strategy call.",
  keywords: [
    "custom AI agents USA",
    "autonomous AI agents for business",
    "GPT-4o business agents",
    "Claude 3 AI automation",
    "AI workflow agents USA",
    "multi-step AI automation",
    "AI lead qualification agent",
    "business process AI agents",
    "LLM agents for enterprise",
    "AI agent development company USA"
  ],
  openGraph: {
    title: "Custom AI Agents for Business Automation — GPT-4o & Claude 3 | HotBot Studios",
    description: "HotBot Studios builds autonomous AI agents on GPT-4o, Claude 3, and Gemini that handle multi-step workflows, lead qualification, research, and decision-making 24/7. US-focused. Book a free strategy call.",
    url: "https://hotbotstudios.com/ai-automation/custom-ai-agents",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Custom AI Agents Built to Run Your Business on Autopilot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom AI Agents for Business Automation — GPT-4o & Claude 3 | HotBot Studios",
    description: "HotBot Studios builds autonomous AI agents on GPT-4o, Claude 3, and Gemini that handle multi-step workflows, lead qualification, research, and decision-making 24/7. US-focused. Book a free strategy call.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ai-automation/custom-ai-agents" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom AI Agents Built to Run Your Business on Autopilot",
  "description": "HotBot Studios builds autonomous AI agents on GPT-4o, Claude 3, and Gemini that handle multi-step workflows, lead qualification, research, and decision-making 24/7. US-focused. Book a free strategy call.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "AI Agents",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/ai-automation/custom-ai-agents"
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
      "name": "Custom AI Agents",
      "item": "https://hotbotstudios.com/ai-automation/custom-ai-agents"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which AI models do you use to build agents?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We primarily use OpenAI GPT-4o, Anthropic Claude 3 Opus/Sonnet, and Google Gemini Pro. Model selection depends on your task requirements — GPT-4o excels at reasoning and tool use; Claude 3 handles very long documents; Gemini processes images and video."
      }
    },
    {
      "@type": "Question",
      "name": "Can agents integrate with our existing software stack?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We build native integrations via APIs for HubSpot, Salesforce, Pipedrive, Google Workspace, Slack, Notion, Airtable, Jira, and most enterprise SaaS tools. If it has an API, we can connect to it."
      }
    },
    {
      "@type": "Question",
      "name": "How do you ensure agents don't make costly mistakes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We implement human-in-the-loop gates for high-stakes actions, confidence thresholds that trigger escalation, sandbox testing before production deployment, and full audit logging so every decision is traceable and reversible."
      }
    },
    {
      "@type": "Question",
      "name": "Do we need to provide our own AI API keys?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You have the option to use your own OpenAI, Anthropic, or Google API keys (giving you full cost control and data privacy), or we can manage API access on your behalf within our secure infrastructure."
      }
    }
  ]
};

const STATS = [
    { value: 80, suffix: "%", label: "average reduction in time spent on targeted repetitive workflows", color: "#8b5cf6" },
    { value: 24, suffix: "/7", label: "agent uptime — no sick days, holidays, or overtime costs", color: "#06b6d4" },
    { value: 6, suffix: "wk", label: "average time from brief to deployed production agent", color: "#10b981" },
    { value: 12, suffix: "×", label: "average ROI in year one versus equivalent human headcount", color: "#f59e0b" }
];

const PROCESS = [
    { n: 1, title: "Workflow Discovery", desc: "We map your existing processes, identify the highest-ROI automation targets, and define agent goals, tools, and success metrics.", icon: "🔭" },
    { n: 2, title: "Agent Architecture Design", desc: "We design the agent loop: model selection, tool definitions, memory strategy, error handling, and escalation rules.", icon: "📐" },
    { n: 3, title: "Build, Test & Refine", desc: "Agents are built, tested against real business data in a sandbox, and refined until they perform reliably across edge cases.", icon: "🔧" },
    { n: 4, title: "Production Deploy & Monitor", desc: "We deploy to your infrastructure (AWS Lambda, GCP Cloud Run, or self-hosted), set up monitoring dashboards, and hand over full documentation.", icon: "🚀" }
];

const FAQS = [
    { q: "Which AI models do you use to build agents?", a: "We primarily use OpenAI GPT-4o, Anthropic Claude 3 Opus/Sonnet, and Google Gemini Pro. Model selection depends on your task requirements — GPT-4o excels at reasoning and tool use; Claude 3 handles very long documents; Gemini processes images and video." },
    { q: "Can agents integrate with our existing software stack?", a: "Yes. We build native integrations via APIs for HubSpot, Salesforce, Pipedrive, Google Workspace, Slack, Notion, Airtable, Jira, and most enterprise SaaS tools. If it has an API, we can connect to it." },
    { q: "How do you ensure agents don't make costly mistakes?", a: "We implement human-in-the-loop gates for high-stakes actions, confidence thresholds that trigger escalation, sandbox testing before production deployment, and full audit logging so every decision is traceable and reversible." },
    { q: "Do we need to provide our own AI API keys?", a: "You have the option to use your own OpenAI, Anthropic, or Google API keys (giving you full cost control and data privacy), or we can manage API access on your behalf within our secure infrastructure." }
];

const RELATED = [
    { title: "n8n Workflow Automation", href: "/ai-automation/n8n-workflow-automation", desc: "Connect your entire tool stack into trigger-based automated workflows without custom code.", icon: "⚙️" },
    { title: "LLM & GPT Integration", href: "/ai-automation/llm-gpt-integration", desc: "Embed GPT-4o and Claude 3 directly into your existing products and internal tools.", icon: "🧠" },
    { title: "AI Analytics & Business Intelligence", href: "/ai-automation/ai-analytics", desc: "Turn your data into predictive insights and real-time dashboards powered by AI.", icon: "📊" }
];

export default function CustomAiAgentsPage() {
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
          <li className="text-slate-400">Custom AI Agents</li>
        </ol>
      </nav>

      <PageHeader
        label="AI Agents"
        title="Custom AI Agents Built to Run Your Business on Autopilot"
        subtitle="Autonomous agents that research, decide, and act — replacing repetitive high-cost human tasks across sales, operations, and customer service."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Custom AI Agent:</strong>{" "}
              A custom AI agent is a software system powered by a large language model (GPT-4o, Claude 3, Gemini) that autonomously executes multi-step tasks — browsing the web, calling APIs, reading documents, making decisions, and taking actions — without human intervention. Unlike simple chatbots, agents plan, adapt, and complete complex goals end-to-end.
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
        <div key="Multi-Model Intelligence" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🧠`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Multi-Model Intelligence`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Select the right LLM per task: GPT-4o for reasoning, Claude 3 Opus for long-context analysis, Gemini for multimodal inputs. Agents switch models within a single workflow.`}</p>
        </div>
        <div key="Autonomous Multi-Step Execution" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🔄`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Autonomous Multi-Step Execution`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Agents break goals into sub-tasks, execute them in sequence, handle errors, and retry — completing workflows that previously required a full-time employee.`}</p>
        </div>
        <div key="Deep Tool Integration" className="p-5 rounded-2xl border" style={{ background: "#10b98110", borderColor: "#10b98125" }}>
          <div className="text-2xl mb-3">{String.raw`🔌`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Deep Tool Integration`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Connect agents to your CRM (HubSpot, Salesforce), databases, Google Workspace, Slack, email, and 500+ APIs. Agents read, write, and act across your entire stack.`}</p>
        </div>
        <div key="Human-in-the-Loop Controls" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🛡️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Human-in-the-Loop Controls`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Define approval gates for high-stakes decisions. Agents escalate to humans when confidence is low, maintaining control without sacrificing speed.`}</p>
        </div>
        <div key="Memory & Learning" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📈`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Memory & Learning`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Agents store context across sessions using vector databases (Pinecone, Weaviate). They remember past interactions, user preferences, and business rules — improving with every run.`}</p>
        </div>
        <div key="Full Audit Trails" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Full Audit Trails`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Every agent decision, action, and output is logged with timestamps. Full observability for compliance, debugging, and continuous improvement.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="Sales Teams" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Sales Teams`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`SDRs spending 70% of their time on research and data entry instead of selling`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`AI agents that research prospects, personalise outreach, update CRM records, and flag hot leads — fully automatically`}</p>
        </div>
        <div key="E-Commerce Operators" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`E-Commerce Operators`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Manual order processing, supplier communications, and inventory reconciliation eating into margins`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`End-to-end order management agents that handle supplier emails, update inventory, flag anomalies, and process refunds`}</p>
        </div>
        <div key="Law Firms & Professional Services" className="p-6 rounded-2xl border" style={{ background: "#10b98108", borderColor: "#10b98120" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#10b981" }}>{String.raw`Law Firms & Professional Services`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Junior staff spending hours on document review, due diligence, and research`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Document analysis agents that read, summarize, and extract key clauses from contracts — delivering 10-page briefs in minutes`}</p>
        </div>
        <div key="Marketing Agencies" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`Marketing Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Reporting, competitive monitoring, and content brief creation taking days per week`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Agents that monitor competitor activity, pull campaign data, generate reports, and create SEO-optimized content briefs on schedule`}</p>
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
            style={{ background: "#8b5cf605", borderColor: "#8b5cf618" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Hours saved per week on targeted workflow`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Task completion accuracy rate (% of runs requiring no human correction)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Cost-per-completed-task vs. human baseline`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Agent uptime and error rate`}</li>
          <li className="text-slate-300 text-sm">{String.raw`CRM data quality score (completeness, freshness)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Time-to-decision for escalated tasks`}</li>
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
            <span>{String.raw`AI agents can eliminate 60–80% of repetitive knowledge work in targeted workflows — freeing your team to focus on strategy and relationships`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`The best agent implementations start small: automate one high-frequency, well-defined process and expand from there`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Human-in-the-loop controls are not a limitation — they are a feature that builds trust and enables agents to be deployed in higher-stakes contexts`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Memory via vector databases is what separates a one-off automation from an agent that genuinely improves over time`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Model selection matters: the cheapest model that meets your accuracy requirements delivers the best unit economics at scale`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Full observability (logging, dashboards, alerting) is non-negotiable for production agents — you need to know when something goes wrong before your customers do`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Ready to Put Your Workflows on Autopilot?"
        subtitle="Book a free 30-minute discovery call. We'll identify the top 3 agent automation opportunities in your business and estimate ROI before you commit to anything."
        formType="contact"
      />
    </>
  );
}
