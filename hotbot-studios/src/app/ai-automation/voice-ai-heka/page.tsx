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
  title: "AI Voice Receptionist for US Businesses, Heka by HotBot Studios",
  description: "Heka is HotBot Studios' AI voice receptionist that qualifies inbound leads, answers FAQs, and books calendar appointments 24/7. Integrates with HubSpot, Salesforce, and Calendly. Book a demo.",
  keywords: [
    "AI voice receptionist USA",
    "AI phone answering service business",
    "automated lead qualification phone",
    "Heka voice AI",
    "AI call answering small business USA",
    "voice AI lead qualification",
    "AI appointment booking phone",
    "Sarvam AI voice assistant",
    "24/7 AI receptionist USA",
    "AI phone bot for business"
  ],
  openGraph: {
    title: "AI Voice Receptionist for US Businesses, Heka by HotBot Studios",
    description: "Heka is HotBot Studios' AI voice receptionist that qualifies inbound leads, answers FAQs, and books calendar appointments 24/7. Integrates with HubSpot, Salesforce, and Calendly. Book a demo.",
    url: "https://hotbotstudios.com/ai-automation/voice-ai-heka",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Heka, The AI Voice Receptionist That Never Misses a Lead" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Voice Receptionist for US Businesses, Heka by HotBot Studios",
    description: "Heka is HotBot Studios' AI voice receptionist that qualifies inbound leads, answers FAQs, and books calendar appointments 24/7. Integrates with HubSpot, Salesforce, and Calendly. Book a demo.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ai-automation/voice-ai-heka" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Heka, The AI Voice Receptionist That Never Misses a Lead",
  "description": "Heka is HotBot Studios' AI voice receptionist that qualifies inbound leads, answers FAQs, and books calendar appointments 24/7. Integrates with HubSpot, Salesforce, and Calendly. Book a demo.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "Voice AI",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/ai-automation/voice-ai-heka"
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
      "name": "Voice AI, Heka",
      "item": "https://hotbotstudios.com/ai-automation/voice-ai-heka"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can Heka handle multiple calls at the same time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Heka operates on a cloud telephony infrastructure (Twilio) that supports concurrent calls, so even during peak volume, every caller is answered immediately without being placed on hold."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a caller wants to speak to a human?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Heka is programmed with escalation triggers, if a caller explicitly requests a human, expresses frustration, or if the conversation falls outside its knowledge base, it smoothly transfers the call to your team with a real-time handoff summary."
      }
    },
    {
      "@type": "Question",
      "name": "Can Heka speak languages other than English?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Currently Heka operates in US English as its primary language, with Spanish support available for markets with significant Spanish-speaking caller populations. Additional language support is on our roadmap."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to set up and go live?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most Heka deployments go live within 2–3 weeks from kickoff, including script design, integration setup, testing, and quality assurance. Simpler deployments (FAQ-only, no CRM integration) can launch in under a week."
      }
    }
  ]
};

const STATS = [
    { value: 100, suffix: "%", label: "of inbound calls answered, zero missed leads, zero hold times", color: "#06b6d4" },
    { value: 40, suffix: "%", label: "average increase in qualified appointments booked in first 90 days", color: "#8b5cf6" },
    { value: 2, suffix: "s", label: "average response time from ring to Heka answering (under 2 seconds)", color: "#10b981" },
    { value: 72, suffix: "%", label: "of callers cannot distinguish Heka from a human receptionist in blind tests", color: "#f59e0b" }
];

const PROCESS = [
    { n: 1, title: "Qualification Script Design", desc: "We work with your sales team to map your ideal lead profile, build a natural conversation script, and define qualification pass/fail criteria.", icon: "📝" },
    { n: 2, title: "Integration Setup", desc: "Heka is connected to your phone number (via Twilio), CRM, and calendar system. Test calls are run to validate the full qualification-to-booking flow.", icon: "🔌" },
    { n: 3, title: "Voice & Persona Calibration", desc: "Heka's voice, tone, and pacing are calibrated to match your brand personality, professional, warm, or energetic depending on your audience.", icon: "🎨" },
    { n: 4, title: "Launch, Monitor & Optimise", desc: "We monitor call quality, qualification accuracy, and booking rates weekly for the first 30 days, refining scripts based on real conversation data.", icon: "📈" }
];

const FAQS = [
    { q: "Can Heka handle multiple calls at the same time?", a: "Yes. Heka operates on a cloud telephony infrastructure (Twilio) that supports concurrent calls, so even during peak volume, every caller is answered immediately without being placed on hold." },
    { q: "What happens when a caller wants to speak to a human?", a: "Heka is programmed with escalation triggers, if a caller explicitly requests a human, expresses frustration, or if the conversation falls outside its knowledge base, it smoothly transfers the call to your team with a real-time handoff summary." },
    { q: "Can Heka speak languages other than English?", a: "Currently Heka operates in US English as its primary language, with Spanish support available for markets with significant Spanish-speaking caller populations. Additional language support is on our roadmap." },
    { q: "How long does it take to set up and go live?", a: "Most Heka deployments go live within 2–3 weeks from kickoff, including script design, integration setup, testing, and quality assurance. Simpler deployments (FAQ-only, no CRM integration) can launch in under a week." }
];

const RELATED = [
    { title: "AI Chatbots", href: "/ai-automation/ai-chatbots", desc: "Text-based lead qualification for your website, WhatsApp Business, and Instagram DMs.", icon: "💬" },
    { title: "n8n Workflow Automation", href: "/ai-automation/n8n-workflow-automation", desc: "Connect Heka call data to your full business workflow and CRM automation stack.", icon: "⚙️" },
    { title: "Custom AI Agents", href: "/ai-automation/custom-ai-agents", desc: "Autonomous agents that handle complex multi-step follow-up after every qualified call.", icon: "🤖" }
];

export default function VoiceAiHekaPage() {
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
          <li className="text-slate-400">Voice AI, Heka</li>
        </ol>
      </nav>

      <PageHeader
        label="Voice AI"
        title="Heka, The AI Voice Receptionist That Never Misses a Lead"
        subtitle="Heka answers every inbound call, qualifies prospects with natural conversation, and books meetings directly into your calendar, around the clock, in any US accent."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#06b6d408", borderColor: "#06b6d420" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Voice AI Receptionist:</strong>{" "}
              A voice AI receptionist is an AI-powered phone agent that handles inbound calls with natural, human-like conversation. Unlike IVR phone trees, voice AI understands intent, asks follow-up questions, handles objections, and takes action, qualifying leads, answering complex FAQs, and booking calendar appointments without a human operator.
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
        <div key="Natural US-Accent Voice" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🎙️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Natural US-Accent Voice`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Heka is powered by Sarvam AI's advanced voice synthesis, delivering warm, natural American English conversation that callers can't distinguish from a human receptionist.`}</p>
        </div>
        <div key="Custom Qualification Scripts" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`📋`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Custom Qualification Scripts`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`We program Heka with your specific qualification criteria, budget, timeline, location, service type, so only sales-ready leads reach your team.`}</p>
        </div>
        <div key="Direct Calendar Booking" className="p-5 rounded-2xl border" style={{ background: "#10b98110", borderColor: "#10b98125" }}>
          <div className="text-2xl mb-3">{String.raw`📅`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Direct Calendar Booking`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Heka integrates with Calendly, Google Calendar, and HubSpot Meetings to book qualified appointments directly into your sales team's calendars during the call.`}</p>
        </div>
        <div key="CRM Auto-Update" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`CRM Auto-Update`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Every call is transcribed, summarised, and pushed to your CRM (HubSpot, Salesforce, Pipedrive) automatically, with lead score, qualification status, and next action.`}</p>
        </div>
        <div key="Overflow & After-Hours Coverage" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📞`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Overflow & After-Hours Coverage`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Heka handles calls during peak hours, lunch breaks, evenings, weekends, and holidays, ensuring zero missed leads regardless of your team's schedule.`}</p>
        </div>
        <div key="Call Analytics Dashboard" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Call Analytics Dashboard`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Real-time dashboard showing call volume, qualification rates, most common objections, booking rates, and ROI per call, so you can continuously optimise.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="Home Services & Contractors" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`Home Services & Contractors`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Missing inbound calls during job sites, evenings, and weekends, losing high-value leads to competitors who answer first`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka answers every call 24/7, qualifies the project type and budget, and books an on-site estimate directly into the contractor's calendar`}</p>
        </div>
        <div key="Healthcare & Dental Practices" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Healthcare & Dental Practices`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Front desk overwhelmed with appointment scheduling, FAQs, and insurance questions during peak hours`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka handles appointment booking, insurance verification questions, and FAQs, freeing front desk staff for in-person patient care`}</p>
        </div>
        <div key="Real Estate Agencies" className="p-6 rounded-2xl border" style={{ background: "#10b98108", borderColor: "#10b98120" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#10b981" }}>{String.raw`Real Estate Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Agents unable to answer every lead call while showing properties, resulting in leads going cold`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka qualifies buyer/renter criteria, answers property questions, and schedules viewing appointments, keeping agents focused on closings`}</p>
        </div>
        <div key="B2B SaaS & Professional Services" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`B2B SaaS & Professional Services`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Demo requests going to a contact form and languishing for hours before a human responds`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka intercepts inbound demo calls, qualifies company size and use case, and books a discovery call with the right sales rep instantly`}</p>
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
            style={{ background: "#06b6d405", borderColor: "#06b6d418" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Call answer rate (% of inbound calls answered vs. missed)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Lead qualification rate (% of calls that meet qualification criteria)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Appointment booking conversion rate`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Average call duration (efficiency metric)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`CRM data completeness score per call`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Cost-per-qualified-appointment vs. human receptionist baseline`}</li>
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
            <span>{String.raw`The first business to answer a lead call wins it, 78% of customers choose the vendor who responds first (Harvard Business Review)`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Voice AI converts at a higher rate than web chat because phone calls carry higher buyer intent and urgency`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`A well-calibrated qualification script prevents your sales team from wasting time on prospects who will never convert`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`CRM auto-population from calls eliminates the single biggest source of CRM data decay, humans forgetting to log calls`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`After-hours coverage is where voice AI delivers its fastest ROI, capturing leads that would otherwise go to competitors`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Continuous script optimisation based on real call data is what separates a good Heka deployment from a great one`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Never Miss Another Inbound Lead"
        subtitle="Book a free Heka demo. We'll show you exactly how it sounds, how it qualifies, and how it integrates with your existing CRM and calendar in under 20 minutes."
        formType="contact"
      />
    </>
  );
}
