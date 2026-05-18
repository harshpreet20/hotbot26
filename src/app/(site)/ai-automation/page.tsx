import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { N8nWorkflowWidget } from "@/components/sections/N8nWorkflowWidget";
import { PRODUCTS } from "@/lib/constants";
import { GlassCard } from "@/components/shared/GlassCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best AI Automation in the United States | HotBot Studios",
  description:
    "HotBot Studios is the best AI automation agency in the United States — custom AI agents, voice AI, chatbots & n8n workflows that save 200+ hrs/month. Get your free AI audit today.",
  keywords: [
    "best AI automation in the United States",
    "AI automation agency USA",
    "AI automation company USA",
    "AI automation services United States",
    "custom AI agents for business",
    "AI chatbot development company USA",
    "n8n workflow automation agency",
    "voice AI for business USA",
    "business process automation USA",
    "GPT-4o integration services",
    "LLM application development USA",
    "AI automation ROI",
  ],
  openGraph: {
    title: "Best AI Automation in the United States | HotBot Studios",
    description: "HotBot Studios is the best AI automation agency in the United States — custom AI agents, voice AI, chatbots & n8n workflows that save 200+ hrs/month. Get your free AI audit today.",
    url: "https://hotbotstudios.com/ai-automation",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Best AI Automation in the United States - HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best AI Automation in the United States | HotBot Studios",
    description: "HotBot Studios is the best AI automation agency in the United States — custom AI agents, voice AI, chatbots & n8n workflows that save 200+ hrs/month. Get your free AI audit today.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ai-automation" },
};

// ── Schema Markup ───────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "HotBot Studios - AI Automation Services",
  url: "https://hotbotstudios.com/ai-automation",
  description: "Custom AI agents, voice AI (Heka), chatbots, n8n workflow automation, and LLM integrations for US businesses. Save 200+ hours monthly.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "AI Automation & Workflow Automation",
  priceRange: "$$-$$$",
  telephone: "+91-9700001534",
  email: "hotbotstudios@gmail.com",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "AI Automation", item: "https://hotbotstudios.com/ai-automation" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What AI automation services does HotBot Studios offer for US businesses?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios offers custom AI agents, voice AI receptionists (Heka), website and WhatsApp chatbots, n8n workflow automations, GPT-4o and Claude LLM integrations, and AI analytics dashboards - all built specifically for US businesses." } },
    { "@type": "Question", name: "What ROI can I expect from AI automation?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios clients typically save 200+ hours per month in manual work within 90 days. AI-powered lead qualification has driven 40–60% increases in sales conversion. Most engagements pay for themselves within 2–3 months." } },
    { "@type": "Question", name: "How quickly can we go live with an AI automation system?", acceptedAnswer: { "@type": "Answer", text: "Simple chatbots and n8n workflow automations ship in 1–2 weeks. Full AI agent systems with custom LLM integrations take 4–8 weeks. Phased delivery ensures you see value within the first two weeks." } },
  ],
};

// ── Content Data ─────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🤖", title: "Custom AI Agents", desc: "Autonomous AI agents built on GPT-4o, Claude 3, and Gemini that handle complex multi-step workflows, research, lead qualification, and decision-making - running 24/7 without human intervention.", href: "/ai-automation/custom-ai-agents" },
  { icon: "🎙️", title: "Voice AI - Heka", desc: "AI voice receptionist powered by Sarvam AI that qualifies inbound leads, answers FAQs, and books calendar appointments around the clock. Integrates with Salesforce, HubSpot, and Calendly.", href: "/ai-automation/voice-ai-heka" },
  { icon: "💬", title: "AI Chatbots", desc: "Intelligent conversational AI for your website, WhatsApp Business, Telegram, and Instagram DMs. Converts visitors into qualified leads at scale, 24/7.", href: "/ai-automation/ai-chatbots" },
  { icon: "⚙️", title: "Workflow Automation (n8n)", desc: "Connect your CRM (HubSpot, Salesforce, Pipedrive), email (Gmail, Outlook), Slack, Google Sheets, Notion, and 500+ tools into trigger-based automated workflows. Zero manual data entry.", href: "/ai-automation/n8n-workflow-automation" },
  { icon: "📊", title: "AI Analytics & Business Intelligence", desc: "Intelligent data pipelines, predictive forecasting models, and real-time BI dashboards powered by your own first-party data. Integrates with GA4, Looker Studio, and BigQuery.", href: "/ai-automation/ai-analytics" },
  { icon: "🧠", title: "LLM & GPT Integration", desc: "Custom GPT-4o, Claude 3 Opus, and Gemini Pro integrations embedded into your internal tools, customer-facing products, and business processes. Fine-tuning and RAG (Retrieval-Augmented Generation) available.", href: "/ai-automation/llm-gpt-integration" },
];

const STATS = [
  { value: 80, suffix: "%", label: "Query Automation Rate", color: "#3b82f6" },
  { value: 200, suffix: "hrs", label: "Monthly Hours Saved", color: "#8b5cf6" },
  { value: 15, suffix: "+", label: "Platforms Integrated", color: "#06b6d4" },
  { value: 99, suffix: "%", label: "Uptime Guarantee", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Automation Audit", desc: "We map every manual, repetitive task your team performs and rank by automation value - time savings, error reduction, and revenue impact. Delivered as a prioritized automation roadmap.", icon: "🔍" },
  { n: 2, title: "Architecture Design", desc: "Our AI architects design a scalable system: right LLM models (GPT-4o, Claude, Gemini), integration points, data flows, and fallback logic for your specific business.", icon: "📐" },
  { n: 3, title: "Build & Stress-Test", desc: "We develop, train, and rigorously test every AI workflow with real business scenarios, edge cases, and adversarial inputs before any production deployment.", icon: "🛠️" },
  { n: 4, title: "Deploy, Monitor & Improve", desc: "Launch with full observability - error alerts, usage dashboards, and continuous improvement loops. Your AI systems get smarter the more they run.", icon: "🚀" },
];

const FAQS = [
  { q: "What AI automation services does HotBot Studios offer for US businesses?", a: "We offer custom AI agents (GPT-4o, Claude, Gemini), voice AI receptionists (Heka via Sarvam AI), website and WhatsApp chatbots, n8n workflow automations, LLM integrations, and AI analytics dashboards. If your team is doing it manually, we can almost certainly automate it." },
  { q: "What ROI can I expect from AI automation?", a: "Our US clients typically save 200+ hours per month within the first 90 days. AI-powered lead qualification has driven 40–60% increases in sales conversion. Most engagements pay for themselves within 2–3 months. We track and report ROI from day one." },
  { q: "How quickly can we go live with an AI system?", a: "Simple chatbots and n8n workflow automations ship in 1–2 weeks. Full AI agent systems with custom LLM integrations take 4–8 weeks. We use phased delivery so you start seeing value within the first two weeks." },
  { q: "Do I need a technical team to manage AI automations?", a: "No. Every system is designed for non-technical operators. Your team gets an intuitive dashboard, full onboarding training, and we remain available for support and updates post-launch." },
  { q: "Which tools can you integrate AI with?", a: "HubSpot, Salesforce, Pipedrive, Google Workspace, Slack, Notion, Telegram, WhatsApp Business, Zapier, n8n, and 500+ platforms via API. If your stack has an API, we connect to it." },
  { q: "What makes HotBot Studios different from other AI automation agencies?", a: "We combine deep LLM expertise with full-stack marketing and software capabilities. Our AI systems aren't siloed - they feed directly into your marketing workflows, CRM, and analytics stack. One team builds the whole growth engine. See our related services: digital marketing and software development." },
];

const RELATED = [
  { title: "Digital Marketing", href: "/digital-marketing", desc: "Amplify AI automation with full-funnel performance marketing.", icon: "📣" },
  { title: "Software Development", href: "/software-development", desc: "Build the apps and platforms your AI systems power.", icon: "💻" },
  { title: "Content Studio", href: "/content-studio", desc: "AI-enhanced content production at scale.", icon: "🎬" },
  { title: "n8n Workflow Automation", href: "/ai-automation/n8n-workflow-automation", desc: "Connect 500+ tools into trigger-based automated workflows.", icon: "⚙️" },
  { title: "AI Analytics", href: "/ai-automation/ai-analytics", desc: "Turn data into predictive insights and real-time dashboards.", icon: "📊" },
  { title: "Custom AI Agents", href: "/ai-automation/custom-ai-agents", desc: "Autonomous agents that run complex workflows 24/7.", icon: "🤖" },
];

export default function AIAutomationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "AI Automation", href: "/ai-automation" }]} />

      <PageHeader
        label="AI Automation Agency USA"
        title="Stop Working for Your Business. Let AI Work for You."
        subtitle="HotBot Studios builds custom AI agents, voice assistants, chatbots, and n8n workflow automations for US businesses. Eliminate manual work, qualify more leads, and scale operations - without adding headcount."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">AI automation for business (definition):</strong> The use of artificial intelligence - including large language models (LLMs) like GPT-4o and Claude, robotic process automation (RPA), and workflow orchestration tools like n8n - to perform repetitive, rule-based, and decision-heavy tasks without human intervention. For US businesses, this means saving 200+ hours/month in manual work, reducing errors, and scaling operations at a fraction of traditional headcount costs.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Why AI Automation ────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Why US Businesses Are Investing in AI Automation in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "68%", label: "of US SMBs report AI saves 5+ hours per week", color: "#3b82f6" },
                  { pct: "3.5×", label: "average ROI on AI automation investment", color: "#8b5cf6" },
                  { pct: "$2.9T", label: "estimated global productivity gain from AI by 2030 (McKinsey)", color: "#06b6d4" },
                  { pct: "55%", label: "reduction in human error via automated workflows", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Bar chart: hours saved by automation type */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Estimated Hours Saved Monthly per Automation Type (HotBot Studios client data)</p>
              <div className="space-y-3">
                {[
                  { label: "Lead qualification & AI follow-up", hrs: 60, max: 60, color: "#3b82f6" },
                  { label: "Customer support (AI chat + voice)", hrs: 55, max: 60, color: "#8b5cf6" },
                  { label: "Data entry & CRM sync (n8n)", hrs: 45, max: 60, color: "#06b6d4" },
                  { label: "Reporting & analytics automation", hrs: 30, max: 60, color: "#22c55e" },
                  { label: "Email & notification workflows", hrs: 20, max: 60, color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-52 shrink-0 text-right hidden md:block">{row.label}</span>
                    <span className="text-slate-400 text-xs shrink-0 md:hidden">{row.hrs}h</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(row.hrs / row.max) * 100}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">{row.hrs}h/mo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <N8nWorkflowWidget />

      {/* ── AI Products ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto py-8">
        <Reveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}>
              🚀 Ready-to-Deploy AI Products
            </div>
            <h2 className="text-3xl font-bold text-white">AI Products Built for US Businesses</h2>
            <p className="text-slate-400 mt-2 max-w-xl mx-auto">Battle-tested AI products that plug into your business in days - no months of custom development required. Already deployed across 42+ US clients.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <SubServices services={SUB_SERVICES} title="AI Automation Services We Build" columns={3} />
      <ServiceStats stats={STATS} title="Proven Results for US Businesses" />
      <ProcessSteps steps={PROCESS} title="Our AI Automation Build Process" />

      {/* ── Comparison Table ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">HotBot Studios AI Automation vs. Traditional Alternatives</h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(59,130,246,0.08)" }}>
                  <th className="text-left p-4 text-slate-300 font-semibold">Factor</th>
                  <th className="text-center p-4 text-blue-400 font-semibold">HotBot Studios AI</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">Hiring Staff</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">Generic SaaS Tools</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Setup time", "1–8 weeks", "3–6 months", "Days (limited scope)"],
                  ["Monthly cost", "$1,500–$5,000", "$4,000–$8,000/person", "$200–$800 (per tool)"],
                  ["Scales with demand", "✅ Instant", "❌ Hire more", "⚠️ Plan limits"],
                  ["Custom to your workflow", "✅ 100% custom", "✅ Yes", "❌ Generic"],
                  ["24/7 operation", "✅ Always on", "❌ Business hours", "✅ Yes"],
                  ["Integrated with your stack", "✅ 500+ integrations", "✅ Manual", "⚠️ Limited"],
                ].map(([factor, ours, staff, saas], i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="p-4 text-slate-300 font-medium">{factor}</td>
                    <td className="p-4 text-center text-blue-300 font-semibold">{ours}</td>
                    <td className="p-4 text-center text-slate-400">{staff}</td>
                    <td className="p-4 text-center text-slate-400">{saas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Customize Your Own AI ────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-16">
        <Reveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
              ✨ Fully Custom AI Builds
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Customize Your Own AI Solution</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              The most powerful AI automations are built specifically for your workflows, your data, and your goals. Tell us what you want to automate and we&apos;ll architect and build it - from custom AI agents to fine-tuned LLM applications.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: "🤖", title: "Custom AI Agent", desc: "An autonomous agent (built on GPT-4o, Claude 3, or Gemini) that researches, decides, and acts - handling complex multi-step tasks without human intervention. Ideal for sales ops, customer support, and research.", color: "#3b82f6" },
            { icon: "🔄", title: "Custom Workflow Automation", desc: "Map any business process - from lead nurturing to invoice processing - and we automate it end-to-end across your entire tool stack via n8n, Zapier, or custom API integrations.", color: "#8b5cf6" },
            { icon: "🧠", title: "Custom LLM Application", desc: "A private GPT or Claude app trained on your own data. Internal knowledge bases, industry-specific AI assistants, or customer-facing AI products - fine-tuned and RAG-powered.", color: "#06b6d4" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="rounded-3xl p-8 md:p-10 text-center"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <h3 className="text-xl font-bold text-white mb-3">How Custom AI Builds Work - 3 Steps</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                { step: "01", title: "Pitch Your Idea", desc: "Describe your process, pain point, or outcome. No technical knowledge required. A 30-min call is enough." },
                { step: "02", title: "We Scope It", desc: "Our AI architects design the system, select the right models and integrations, and provide a clear timeline and fixed cost." },
                { step: "03", title: "We Build & Ship", desc: "Custom-built AI solution, fully tested, deployed, and handed over with documentation and team training." },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-black mb-2" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {s.step}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{s.title}</h4>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/25"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              Pitch Your AI Idea →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways - AI Automation for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "AI automation using GPT-4o, Claude 3, and n8n can save US businesses 200+ hours/month.",
                "Heka Voice AI (powered by Sarvam AI) handles inbound calls, qualifies leads, and books appointments 24/7.",
                "Custom AI agents replace repetitive tasks in sales, support, and operations - at a fraction of hiring costs.",
                "HotBot Studios integrates AI with HubSpot, Salesforce, Google Workspace, Slack, and 500+ platforms.",
                "Most AI automation projects at HotBot Studios achieve positive ROI within 60–90 days.",
                "Explore our related services: digital marketing automation, software development, and marketing consulting.",
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
        title="Ready to Automate Your US Business?"
        subtitle="Join 42+ US companies that cut 200+ hours of manual work every month - and redirected that capacity into revenue-generating activities. Get your free AI automation audit today."
        formType="get-started"
      />
    </>
  );
}
