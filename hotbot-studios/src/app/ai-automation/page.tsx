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
import { PRODUCTS } from "@/lib/constants";
import { GlassCard } from "@/components/shared/GlassCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Automation Services USA | HotBot Studios",
  keywords: ["AI automation services USA", "AI chatbot development", "n8n automation agency", "workflow automation USA", "voice AI business", "AI agent development"],
  alternates: { canonical: "https://hotbotstudios.com/ai-automation" },
  description:
    "Custom AI agents, voice assistants, chatbots, and intelligent automation for US businesses. Powered by the latest LLMs and Sarvam AI.",
};

const SUB_SERVICES = [
  { icon: "🤖", title: "Custom AI Agents", desc: "Autonomous agents that handle complex workflows, research, and decision-making." },
  { icon: "🎙️", title: "Voice AI (Heka)", desc: "24/7 AI voice receptionist that qualifies leads, answers queries, and books appointments." },
  { icon: "💬", title: "AI Chatbots", desc: "Intelligent conversational AI for your website, WhatsApp, Telegram, and more." },
  { icon: "⚙️", title: "Workflow Automation", desc: "Connect 15+ business tools into unified, automated workflows with n8n." },
  { icon: "📊", title: "AI Analytics", desc: "Intelligent data pipelines, forecasting models, and real-time business intelligence." },
  { icon: "🧠", title: "LLM Integration", desc: "Custom GPT-4o, Claude, and Gemini integrations for your internal tools and products." },
];

const STATS = [
  { value: 80, suffix: "%", label: "Query Automation Rate", color: "#3b82f6" },
  { value: 200, suffix: "hrs", label: "Monthly Hours Saved", color: "#8b5cf6" },
  { value: 15, suffix: "+", label: "Platforms Integrated", color: "#06b6d4" },
  { value: 99, suffix: "%", label: "Uptime Guarantee", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Discovery", desc: "We audit your current workflows, tools, and pain points to identify the highest-value automation opportunities.", icon: "🔍" },
  { n: 2, title: "Architecture", desc: "Design a scalable automation architecture with the right AI models, integrations, and data flows for your business.", icon: "📐" },
  { n: 3, title: "Build & Test", desc: "Develop, train, and rigorously test your AI systems with real business scenarios and edge cases.", icon: "🛠️" },
  { n: 4, title: "Deploy & Monitor", desc: "Launch with full monitoring, error handling, and continuous improvement loops to ensure peak performance.", icon: "🚀" },
];

const FAQS = [
  { q: "What types of AI automation do you build?", a: "We build voice AI receptionists, chatbots, multi-step workflow automations, autonomous AI agents, LLM integrations, and fully custom AI products. If your team is doing it manually, we can almost certainly automate it." },
  { q: "What kind of ROI can I expect?", a: "Our clients typically save 200+ hours per month in manual work within the first 90 days. Beyond time savings, AI-powered lead qualification and follow-up have driven 40-60% increases in sales conversion for several clients." },
  { q: "How quickly can we go live?", a: "Simple chatbots and automations ship in 1-2 weeks. Full AI agent systems with custom integrations take 4-8 weeks. We use phased delivery so you start seeing value early." },
  { q: "Do I need a technical team to manage it?", a: "No. Every system we build is designed for non-technical operators. Your team gets a dashboard, full training, and we remain available for support after launch." },
  { q: "Can you integrate with the tools we already use?", a: "Yes — HubSpot, Salesforce, Google Workspace, Slack, Telegram, WhatsApp, Zapier, and 500+ platforms. If your stack has an API, we connect to it." },
];

const RELATED = [
  { title: "Software Development", href: "/software-development", desc: "Build the apps and platforms your AI systems power.", icon: "💻" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Amplify your AI tools with performance marketing.", icon: "📣" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Beautiful interfaces for your AI products.", icon: "🎨" },
];


const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AI Automation Services",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "AI Automation",
  "areaServed": { "@type": "Country", "name": "United States" },
  "description": "Custom AI agents, chatbots, voice AI, and workflow automation for US businesses.",
  "url": "https://hotbotstudios.com/ai-automation",
  "offers": { "@type": "Offer", "priceCurrency": "USD", "availability": "https://schema.org/InStock" }
};

export default function AIAutomationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      
      <PageHeader
        label="AI & Automation"
        title="Stop Working for Your Business. Let AI Work for You."
        subtitle="Every hour your team spends on repetitive tasks is an hour not spent on growth. We build AI agents, voice assistants, and automation workflows that handle the operational workload — so your people focus on decisions that matter."
      />

      {/* Products section */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto py-8">
        <Reveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}>
              🚀 Our AI Products
            </div>
            <h2 className="text-3xl font-bold text-white">Ready-to-Deploy AI Products</h2>
            <p className="text-slate-400 mt-2 max-w-xl mx-auto">Ready-to-deploy, proven AI products that plug into your business immediately — no months of development, no guesswork.</p>
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

      <SubServices services={SUB_SERVICES} title="What We Build" columns={3} />
      <ServiceStats stats={STATS} title="Results That Speak" />
      <ProcessSteps steps={PROCESS} title="Our AI Build Process" />
      <FAQSection faqs={FAQS} />

      {/* Customize Your Own AI Section */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-16">
        <Reveal>
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}
            >
              ✨ Build Anything
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Customize Your Own AI
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Don&apos;t see exactly what your business needs? Good — the most powerful AI solutions are the ones built specifically for your workflows, your data, and your goals. Tell us what you want to automate or build, and we&apos;ll make it happen.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: "🤖",
              title: "Custom AI Agent",
              desc: "An autonomous agent that researches, decides, and acts on your behalf — handling complex multi-step tasks without human intervention.",
              color: "#3b82f6",
            },
            {
              icon: "🔄",
              title: "Custom Workflow Automation",
              desc: "Map any business process — from lead nurturing to invoice processing — and we&apos;ll automate it end-to-end across your entire tool stack.",
              color: "#8b5cf6",
            },
            {
              icon: "🧠",
              title: "Custom AI Model / LLM App",
              desc: "Need a GPT trained on your own data? A private LLM for internal knowledge management? A specialized AI for your industry? We build it.",
              color: "#06b6d4",
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div
            className="rounded-3xl p-8 md:p-10 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-3">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                { step: "01", title: "Pitch Your Idea", desc: "Describe your process, pain point, or the outcome you want. No technical knowledge required." },
                { step: "02", title: "We Scope It", desc: "Our AI architects design the system, choose the right models and integrations, and give you a clear timeline." },
                { step: "03", title: "We Build & Ship", desc: "You get a custom-built AI solution, fully tested, deployed, and handed over with training and documentation." },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-4xl font-black mb-2"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {s.step}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{s.title}</h4>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/25"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
            >
              Pitch Your AI Idea →
            </Link>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection title="Ready to Automate Your Business?" subtitle="Join 42+ US companies that cut 200+ hours of manual work monthly — and redirected that time into growth." formType="get-started" />
    </>
  );
}
