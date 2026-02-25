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

export const metadata: Metadata = {
  title: "AI Automation Services UK | HotBot Studios",
  description:
    "Custom AI agents, voice assistants, chatbots, and intelligent automation for UK businesses. Powered by the latest LLMs and Sarvam AI.",
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
  { q: "What types of AI automation do you build?", a: "We build voice AI receptionists, chatbots, workflow automations, AI agents, LLM integrations, and custom AI products. If it involves AI, we can build it." },
  { q: "Which AI models do you work with?", a: "We work with GPT-4o, Claude (Anthropic), Gemini, Mistral, and open-source models. We also use Sarvam AI for Indian language voice processing." },
  { q: "How long does an AI automation project take?", a: "Simple chatbots take 1-2 weeks. Complex AI agents and voice systems typically take 4-8 weeks depending on integrations required." },
  { q: "Do I need technical knowledge to use your AI systems?", a: "No. We design all interfaces for non-technical users. Your team gets full training and ongoing support." },
  { q: "Can AI automation integrate with my existing tools?", a: "Yes. We integrate with CRMs (HubSpot, Salesforce), Google Workspace, Slack, Telegram, WhatsApp, and 500+ other platforms via n8n." },
];

const RELATED = [
  { title: "Software Development", href: "/software-development", desc: "Build the apps and platforms your AI systems power.", icon: "💻" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Amplify your AI tools with performance marketing.", icon: "📣" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Beautiful interfaces for your AI products.", icon: "🎨" },
];

export default function AIAutomationPage() {
  return (
    <>
      <PageHeader
        label="AI & Automation"
        title="Intelligent Automation That Works While You Sleep"
        subtitle="Custom AI agents, voice assistants, and workflow automation systems that handle the repetitive — so your team can focus on what matters."
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
            <p className="text-slate-400 mt-2 max-w-xl mx-auto">Launch in days, not months — with our pre-built AI products tailored for UK businesses.</p>
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
      <RelatedServices services={RELATED} />
      <CTASection title="Ready to Automate Your Business?" subtitle="Join 42+ UK companies using HotBot Studios AI automation to save 200+ hours monthly." formType="get-started" />
    </>
  );
}
