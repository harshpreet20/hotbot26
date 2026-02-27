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
  title: "Heka Voice AI — 24/7 AI Voice Receptionist for US Businesses | HotBot Studios",
  description: "Heka answers every inbound call, qualifies leads against your criteria, and books appointments automatically. Powered by Sarvam AI. Integrates with HubSpot, Salesforce, and Calendly. Deploy in 7 days.",
  keywords: [
    "AI voice receptionist for small business USA",
    "24/7 AI phone answering service",
    "automated lead qualification by phone",
    "AI receptionist software USA",
    "voice AI appointment booking",
    "Sarvam AI voice assistant for business",
    "AI phone system for real estate",
    "automated inbound call handling USA"
  ],
  openGraph: {
    title: "Heka Voice AI — 24/7 AI Voice Receptionist for US Businesses | HotBot Studios",
    description: "Heka answers every inbound call, qualifies leads against your criteria, and books appointments automatically. Powered by Sarvam AI. Integrates with HubSpot, Salesforce, and Calendly. Deploy in 7 days.",
    url: "https://hotbotstudios.com/products/heka-voice-ai",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Heka Voice AI: The 24/7 AI Receptionist That Qualifies Every Inbound Lead" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heka Voice AI — 24/7 AI Voice Receptionist for US Businesses | HotBot Studios",
    description: "Heka answers every inbound call, qualifies leads against your criteria, and books appointments automatically. Powered by Sarvam AI. Integrates with HubSpot, Salesforce, and Calendly. Deploy in 7 days.",
  },
  alternates: { canonical: "https://hotbotstudios.com/products/heka-voice-ai" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Heka Voice AI: The 24/7 AI Receptionist That Qualifies Every Inbound Lead",
  "description": "Heka answers every inbound call, qualifies leads against your criteria, and books appointments automatically. Powered by Sarvam AI. Integrates with HubSpot, Salesforce, and Calendly. Deploy in 7 days.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OnlineOnly"
  },
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "url": "https://hotbotstudios.com/products/heka-voice-ai",
  "featureList": "Natural Voice Conversations, Custom Qualification Scripts, Real-Time Calendar Booking, CRM Auto-Logging, Multi-Language Support, Weekly Performance Reports"
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
      "name": "Heka Voice AI",
      "item": "https://hotbotstudios.com/products/heka-voice-ai"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does Heka qualify leads during a live call?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Heka follows a custom script built around your specific qualification criteria: budget, timeline, service area, urgency, and any other factor your sales team uses. It asks follow-up questions based on caller responses, listens for qualifying signals, and routes hot leads to your calendar immediately. Unqualified leads receive an automated follow-up SMS or email."
      }
    },
    {
      "@type": "Question",
      "name": "Which CRM and calendar tools does Heka integrate with?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Heka integrates natively with HubSpot, Salesforce, Pipedrive, and Zoho CRM for call logging and lead creation. For calendar booking, it connects to Calendly, Google Calendar, HubSpot Meetings, and Salesforce Scheduler. Custom integrations via webhook or API are available for additional tools in your stack."
      }
    },
    {
      "@type": "Question",
      "name": "Can I customize the script Heka uses on calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The qualification script, greeting, tone, escalation rules, and follow-up triggers are all built to your specifications during onboarding. Scripts can be updated at any time through your dashboard without technical involvement. Heka supports multiple call scripts for different call types: new inquiries, existing client follow-ups, and appointment reminders."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a caller asks something outside the script?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Heka is configured with escalation rules for out-of-scope questions. Depending on your preference, it will transfer the caller to a human team member, take a detailed message, or schedule a callback during business hours. Every unresolved call is flagged in your dashboard with the full transcript so no follow-up is missed."
      }
    }
  ]
};

const STATS = [
    { value: 100, suffix: "%", label: "Call Answer Rate", color: "#3b82f6" },
    { value: 40, suffix: "%", label: "Avg Qualification Improvement", color: "#8b5cf6" },
    { value: 7, suffix: " days", label: "Average Deploy Time", color: "#06b6d4" },
    { value: 500, suffix: "+", label: "Calls Handled Monthly Per Client", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Discovery and Script Blueprint", desc: "We map your current call flow, qualification criteria, common caller questions, and CRM setup. Deliver a complete call script blueprint within 48 hours of kickoff.", icon: "🔍" },
    { n: 2, title: "Voice and Script Configuration", desc: "Heka voice is configured to your brand tone. Qualification scripts are built and tested against 50 simulated call scenarios before any live testing begins.", icon: "⚙️" },
    { n: 3, title: "Integration and Live Testing", desc: "Connect Heka to your CRM, calendar system, and notification channels. Run live tests on your business number and refine scripts based on actual call performance data.", icon: "🧪" },
    { n: 4, title: "Launch and Weekly Optimization", desc: "Go live on your existing or a new dedicated business number. Receive weekly performance reports. Scripts update based on call data to improve qualification accuracy over time.", icon: "🚀" }
];

const FAQS = [
    { q: "How does Heka qualify leads during a live call?", a: "Heka follows a custom script built around your specific qualification criteria: budget, timeline, service area, urgency, and any other factor your sales team uses. It asks follow-up questions based on caller responses, listens for qualifying signals, and routes hot leads to your calendar immediately. Unqualified leads receive an automated follow-up SMS or email." },
    { q: "Which CRM and calendar tools does Heka integrate with?", a: "Heka integrates natively with HubSpot, Salesforce, Pipedrive, and Zoho CRM for call logging and lead creation. For calendar booking, it connects to Calendly, Google Calendar, HubSpot Meetings, and Salesforce Scheduler. Custom integrations via webhook or API are available for additional tools in your stack." },
    { q: "Can I customize the script Heka uses on calls?", a: "Yes. The qualification script, greeting, tone, escalation rules, and follow-up triggers are all built to your specifications during onboarding. Scripts can be updated at any time through your dashboard without technical involvement. Heka supports multiple call scripts for different call types: new inquiries, existing client follow-ups, and appointment reminders." },
    { q: "What happens when a caller asks something outside the script?", a: "Heka is configured with escalation rules for out-of-scope questions. Depending on your preference, it will transfer the caller to a human team member, take a detailed message, or schedule a callback during business hours. Every unresolved call is flagged in your dashboard with the full transcript so no follow-up is missed." }
];

const RELATED = [
    { title: "AI Chatbots", href: "/ai-automation/ai-chatbots", desc: "Text-based lead qualification for your website, WhatsApp Business, and Instagram DMs.", icon: "💬" },
    { title: "n8n Workflow Automation", href: "/ai-automation/n8n-workflow-automation", desc: "Connect Heka call data to your full business workflow and CRM automation stack.", icon: "⚙️" },
    { title: "AI Automation Services", href: "/ai-automation", desc: "Full AI automation stack for US businesses: agents, chatbots, workflows, and analytics.", icon: "🤖" }
];

export default function HekaVoiceAiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
          <li className="text-slate-400">Heka Voice AI</li>
        </ol>
      </nav>

      <PageHeader
        label="AI Voice Receptionist"
        title="Heka Voice AI: The 24/7 AI Receptionist That Qualifies Every Inbound Lead"
        subtitle="Every missed call is a missed deal. Heka answers every inbound call, qualifies prospects against your exact criteria, and books appointments directly into your calendar. No human intervention required. Built on Sarvam AI for natural voice conversations that hold up across real prospect calls. Connects to HubSpot, Salesforce, Pipedrive, and Calendly in under 7 days. Your team focuses on closing. Heka handles everything before the first meeting."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Heka Voice AI:</strong>{" "}
              Heka Voice AI is an AI-powered voice receptionist built on Sarvam AI that handles inbound business calls around the clock. It follows custom qualification scripts, collects prospect information, and books appointments directly into calendar systems without human involvement. Designed for US businesses that lose revenue to missed calls, inconsistent lead qualification, or after-hours gaps in phone coverage.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Core Capabilities</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div key="Natural Voice Conversations" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🎙️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Natural Voice Conversations`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Sarvam AI powers Heka with natural cadence, pauses, and contextual follow-up handling. Callers receive a consistent, professional experience on every call. Voice tone is configurable from formal to conversational to match your brand.`}</p>
        </div>
        <div key="Custom Qualification Scripts" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`✅`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Custom Qualification Scripts`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Heka follows your exact qualification criteria: budget, timeline, service area, urgency, or any custom field your sales team uses. Scripts are built to your specifications during onboarding and updated without technical support.`}</p>
        </div>
        <div key="Real-Time Calendar Booking" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📅`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Real-Time Calendar Booking`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Heka books appointments directly into Calendly, Google Calendar, HubSpot Meetings, and Salesforce Scheduler during the live call. Confirmations send automatically to both parties. No follow-up step required from your team.`}</p>
        </div>
        <div key="CRM Auto-Logging" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`CRM Auto-Logging`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Every call is logged in your CRM with full transcript, lead score, qualification outcome, and next action. Works with HubSpot, Salesforce, Pipedrive, and Zoho CRM. Zero manual data entry for your team after each call.`}</p>
        </div>
        <div key="Multi-Language Support" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🌐`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Multi-Language Support`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Handle inbound calls in English (US, UK, Australian accent), Spanish, and French. Built for businesses serving multilingual markets across California, Texas, Florida, and the New York metro area.`}</p>
        </div>
        <div key="Weekly Performance Reports" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Weekly Performance Reports`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Receive weekly call analytics covering answer rate, qualification rate, appointments booked, and lead quality distribution. Monthly dashboards show revenue pipeline contribution from Heka-qualified leads.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Industry Use Cases</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="Real Estate Agencies" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#3b82f6" }}>{String.raw`Real Estate Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Agents miss 30 to 40 percent of inbound buyer and seller calls while showing properties or in meetings.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka qualifies every inquiry against buyer budget, timeline, and property criteria. Books viewings directly into agent calendars. No lead falls through between showing appointments.`}</p>
        </div>
        <div key="Medical and Dental Practices" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#8b5cf6" }}>{String.raw`Medical and Dental Practices`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Front desk staff cannot handle peak appointment request volume without placing callers on hold.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka handles new patient intake, insurance questions, and appointment scheduling. Frees clinical staff for patient care while reducing caller wait time.`}</p>
        </div>
        <div key="Law Firms" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#06b6d4" }}>{String.raw`Law Firms`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Intake screening is inconsistent across staff and consumes billable attorney time on unqualified inquiries.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka conducts structured intake screening for every new matter inquiry. Captures case type, timeline, and budget. Routes qualified leads to the responsible attorney.`}</p>
        </div>
        <div key="Home Services (HVAC, Plumbing, Roofing)" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#22c55e" }}>{String.raw`Home Services (HVAC, Plumbing, Roofing)`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Technicians miss calls while on job sites, losing urgent service requests to competitors who answer first.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Heka captures every service call, qualifies urgency and location, and books technician visits into job management systems including after-hours requests.`}</p>
        </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="How We Deploy" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Track</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Call answer rate (target: 100%)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Lead qualification rate per 100 inbound calls`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Appointments booked per 100 calls`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Cost per qualified lead from phone`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Missed call recovery rate`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Average qualification call duration`}</li>
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
            <span>{String.raw`Heka answers every inbound call, eliminating missed leads from after-hours, peak volume, or team unavailability`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Custom qualification scripts are built to your exact sales criteria, not generic templates`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Real-time booking connects to Calendly, HubSpot Meetings, and Salesforce Scheduler during the live call`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Every call is logged in your CRM automatically with full transcript and lead score`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Deployment completes in under 7 days with no technical setup required from your team`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Supports English, Spanish, and French for US businesses serving multilingual markets`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="See Heka Qualify a Real Lead"
        subtitle="Book a 20-minute demo and watch Heka handle a real inbound call using your business criteria. No technical setup required before the demo."
        formType="get-started"
      />
    </>
  );
}
