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
  title: "AI Chatbots for Lead Generation & Customer Support — US Businesses | HotBot Studios",
  description: "HotBot Studios builds AI chatbots for websites, WhatsApp Business, Telegram, and Instagram DMs. Converts visitors into qualified leads 24/7. GPT-4o powered. Book a free demo.",
  keywords: [
    "AI chatbot for business USA",
    "GPT-4o website chatbot",
    "WhatsApp Business AI chatbot",
    "AI lead generation chatbot",
    "intelligent chatbot USA",
    "AI customer support chatbot",
    "conversational AI for websites",
    "Instagram DM AI chatbot",
    "AI chat lead qualifier",
    "custom AI chatbot development USA"
  ],
  openGraph: {
    title: "AI Chatbots for Lead Generation & Customer Support — US Businesses | HotBot Studios",
    description: "HotBot Studios builds AI chatbots for websites, WhatsApp Business, Telegram, and Instagram DMs. Converts visitors into qualified leads 24/7. GPT-4o powered. Book a free demo.",
    url: "https://hotbotstudios.com/ai-automation/ai-chatbots",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "AI Chatbots That Qualify Leads and Convert Visitors — 24/7" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chatbots for Lead Generation & Customer Support — US Businesses | HotBot Studios",
    description: "HotBot Studios builds AI chatbots for websites, WhatsApp Business, Telegram, and Instagram DMs. Converts visitors into qualified leads 24/7. GPT-4o powered. Book a free demo.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ai-automation/ai-chatbots" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AI Chatbots That Qualify Leads and Convert Visitors — 24/7",
  "description": "HotBot Studios builds AI chatbots for websites, WhatsApp Business, Telegram, and Instagram DMs. Converts visitors into qualified leads 24/7. GPT-4o powered. Book a free demo.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "AI Chatbots",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/ai-automation/ai-chatbots"
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
      "name": "AI Chatbots",
      "item": "https://hotbotstudios.com/ai-automation/ai-chatbots"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is your AI chatbot different from tools like Intercom or Drift?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Platform chatbots use templates and limited NLP. Our chatbots are built on GPT-4o with custom-trained knowledge bases specific to your business — delivering far more accurate, nuanced responses and deeper integration with your qualification and sales workflows."
      }
    },
    {
      "@type": "Question",
      "name": "Will the chatbot give wrong or made-up answers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We implement Retrieval-Augmented Generation (RAG) — the chatbot only answers from your approved knowledge base. For questions outside its knowledge, it routes to a human rather than hallucinating. This is critical for accuracy in sensitive industries."
      }
    },
    {
      "@type": "Question",
      "name": "Can we customise the chatbot's personality and tone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. We define a custom persona — name, tone of voice, formality level, and brand language — so the chatbot feels like a natural extension of your brand, not a generic bot."
      }
    },
    {
      "@type": "Question",
      "name": "Does it work in languages other than English?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GPT-4o supports over 50 languages natively. We can deploy multilingual chatbots for US brands serving diverse markets, or for international expansion."
      }
    }
  ]
};

const STATS = [
    { value: 67, suffix: "%", label: "of consumers prefer messaging a chatbot over calling for support (Salesforce)", color: "#10b981" },
    { value: 3, suffix: "×", label: "more leads captured vs. contact forms alone — chatbots engage passive visitors", color: "#06b6d4" },
    { value: 60, suffix: "%", label: "average reduction in support ticket volume after AI chatbot deployment", color: "#8b5cf6" },
    { value: 4, suffix: "wk", label: "average time to full production deployment with CRM integration", color: "#f59e0b" }
];

const PROCESS = [
    { n: 1, title: "Conversation Design", desc: "We map your buyer journey, define qualification criteria, and design conversation flows that feel natural — not scripted or robotic.", icon: "🗺️" },
    { n: 2, title: "Knowledge Base Build", desc: "We upload your product documentation, FAQs, case studies, and pricing to train the chatbot's knowledge base for accurate, on-brand responses.", icon: "📚" },
    { n: 3, title: "Integration & Testing", desc: "CRM, calendar, and channel integrations are connected and tested end-to-end. We run hundreds of test conversations to validate accuracy and edge-case handling.", icon: "🔧" },
    { n: 4, title: "Launch & Continuous Optimisation", desc: "Post-launch, we monitor conversation quality, fallback rates, and lead conversion weekly — updating the knowledge base and flows based on real user data.", icon: "📈" }
];

const FAQS = [
    { q: "How is your AI chatbot different from tools like Intercom or Drift?", a: "Platform chatbots use templates and limited NLP. Our chatbots are built on GPT-4o with custom-trained knowledge bases specific to your business — delivering far more accurate, nuanced responses and deeper integration with your qualification and sales workflows." },
    { q: "Will the chatbot give wrong or made-up answers?", a: "We implement Retrieval-Augmented Generation (RAG) — the chatbot only answers from your approved knowledge base. For questions outside its knowledge, it routes to a human rather than hallucinating. This is critical for accuracy in sensitive industries." },
    { q: "Can we customise the chatbot's personality and tone?", a: "Absolutely. We define a custom persona — name, tone of voice, formality level, and brand language — so the chatbot feels like a natural extension of your brand, not a generic bot." },
    { q: "Does it work in languages other than English?", a: "GPT-4o supports over 50 languages natively. We can deploy multilingual chatbots for US brands serving diverse markets, or for international expansion." }
];

const RELATED = [
    { title: "Voice AI — Heka", href: "/ai-automation/voice-ai-heka", desc: "AI phone receptionist for inbound calls — the voice equivalent of your chatbot.", icon: "🎙️" },
    { title: "n8n Workflow Automation", href: "/ai-automation/n8n-workflow-automation", desc: "Automate what happens after the chatbot qualifies a lead — follow-up emails, tasks, and CRM updates.", icon: "⚙️" },
    { title: "Custom AI Agents", href: "/ai-automation/custom-ai-agents", desc: "Take chatbot-captured leads further with autonomous agents that research and personalise follow-up.", icon: "🤖" }
];

export default function AiChatbotsPage() {
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
          <li className="text-slate-400">AI Chatbots</li>
        </ol>
      </nav>

      <PageHeader
        label="AI Chatbots"
        title="AI Chatbots That Qualify Leads and Convert Visitors — 24/7"
        subtitle="Custom AI chatbots that engage every website visitor, qualify prospects with natural conversation, and hand off warm leads to your sales team — across web, WhatsApp, and social."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#10b98108", borderColor: "#10b98120" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">AI Chatbot:</strong>{" "}
              An AI chatbot is a conversational interface powered by a large language model (GPT-4o or Claude 3) that understands natural language, maintains conversation context, and takes action — qualifying leads, answering complex product questions, booking demos, and escalating to humans when needed. Unlike rule-based bots with rigid decision trees, AI chatbots handle open-ended questions with human-like intelligence.
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
        <div key="GPT-4o Conversational Intelligence" className="p-5 rounded-2xl border" style={{ background: "#10b98110", borderColor: "#10b98125" }}>
          <div className="text-2xl mb-3">{String.raw`🧠`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`GPT-4o Conversational Intelligence`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Powered by the latest GPT-4o model, our chatbots understand nuance, context, and intent — handling complex objections and multi-turn conversations that rule-based bots cannot.`}</p>
        </div>
        <div key="Omnichannel Deployment" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📱`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Omnichannel Deployment`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Deploy on your website, WhatsApp Business API, Telegram, Instagram DMs, and Facebook Messenger — with unified conversation history across channels in one dashboard.`}</p>
        </div>
        <div key="Custom Lead Qualification Logic" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`📋`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Custom Lead Qualification Logic`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`We program your ideal lead profile into the bot — company size, budget, pain points, timeline — and it qualifies every visitor against these criteria in real time.`}</p>
        </div>
        <div key="CRM & Calendar Integration" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`CRM & Calendar Integration`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Qualified leads are pushed directly to HubSpot, Salesforce, or Pipedrive. The bot can also book discovery calls via Calendly or Google Calendar without human intervention.`}</p>
        </div>
        <div key="Knowledge Base Training" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📚`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Knowledge Base Training`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Upload your product docs, FAQs, pricing pages, and case studies. The chatbot answers questions from your own knowledge base — not generic AI responses.`}</p>
        </div>
        <div key="Human Handoff" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🔄`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Human Handoff`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`When a prospect is sales-ready or frustrated, the bot escalates instantly to a live agent via your preferred platform (Intercom, Freshdesk, Slack) with full conversation context.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#10b98108", borderColor: "#10b98120" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#10b981" }}>{String.raw`SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Website visitors leaving without converting because they can't find answers to pre-sale questions at 2am`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`AI chatbot answers product, pricing, and integration questions 24/7 and books product demos for qualified prospects directly into AE calendars`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`High cart abandonment and support ticket volume from shipping, returns, and product questions`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Chatbot handles order tracking, return requests, product recommendations, and size guidance — deflecting 60% of support tickets automatically`}</p>
        </div>
        <div key="Financial Services & Insurance" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Financial Services & Insurance`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Compliance-sensitive product questions that require accurate, consistent answers at scale`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Knowledge-base-trained chatbot delivers compliant, accurate answers from approved content — with escalation for regulated advice scenarios`}</p>
        </div>
        <div key="Education & Coaching" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`Education & Coaching`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Prospective students asking admissions, course, and pricing questions across website and Instagram DMs`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Omnichannel chatbot qualifies enrolment intent, answers programme questions, and books discovery calls with enrolment advisors`}</p>
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
            style={{ background: "#10b98105", borderColor: "#10b98118" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Chatbot engagement rate (% of website visitors who start a conversation)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Lead qualification rate (% of conversations that meet ICP criteria)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Containment rate (% of queries resolved without human escalation)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Demo/call booking conversion rate from chatbot conversations`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Average conversation duration and message depth`}</li>
          <li className="text-slate-300 text-sm">{String.raw`CRM lead volume attributed to chatbot channel`}</li>
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
            <span>{String.raw`AI chatbots capture leads from visitors who would never fill in a contact form — passive browsers who respond to conversation but not static CTAs`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Knowledge-base training (RAG) is the difference between a chatbot that builds trust and one that erodes it with hallucinated answers`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Omnichannel deployment (website + WhatsApp + Instagram) multiplies lead capture touchpoints without multiplying your team`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Defining a clear qualification threshold — and routing unqualified leads to nurture sequences — prevents your sales team from being overwhelmed with low-quality conversations`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Human handoff with full conversation context is not optional — it is what makes AI + human collaboration seamless`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Continuous optimisation based on actual conversation data typically improves lead qualification rates by 20–40% in the first three months`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Turn Your Website Into a 24/7 Lead Machine"
        subtitle="Book a free chatbot strategy session. We'll show you a live demo tailored to your industry and map out how a custom chatbot would integrate with your sales workflow."
        formType="contact"
      />
    </>
  );
}
