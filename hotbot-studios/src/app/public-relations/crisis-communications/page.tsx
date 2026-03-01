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
  title: "Crisis Communications Agency USA — 24/7 Rapid Response PR | HotBot Studios",
  description:
    "HotBot Studios provides 24/7 crisis communications for US businesses: rapid response PR, media holding statements, spokesperson preparation, and proactive narrative control. 48-hour response guarantee. Call us now.",
  keywords: [
    "crisis communications agency USA",
    "crisis PR agency USA",
    "brand reputation management USA",
    "crisis management PR USA",
    "media crisis response USA",
    "PR crisis agency USA",
    "reputation repair agency USA",
    "crisis communications consultant USA",
    "corporate crisis management USA",
    "social media crisis management",
    "brand crisis PR USA",
    "executive crisis communications",
    "negative press response agency",
    "crisis PR rapid response USA",
  ],
  openGraph: {
    title: "Crisis Communications Agency USA — 24/7 Rapid Response PR | HotBot Studios",
    description: "24/7 crisis PR for US businesses: rapid response, media statements, spokesperson prep & narrative control. 48-hour response guarantee.",
    url: "https://hotbotstudios.com/public-relations/crisis-communications",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Crisis Communications Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crisis Communications Agency USA | HotBot Studios",
    description: "24/7 crisis PR: rapid response, media statements & narrative control. 48-hour response guarantee.",
  },
  alternates: { canonical: "https://hotbotstudios.com/public-relations/crisis-communications" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Crisis Communications Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Crisis Communications & Reputation Management",
  areaServed: { "@type": "Country", name: "United States" },
  description: "24/7 crisis communications and reputation management for US businesses. Rapid response PR, media holding statements, spokesperson preparation, narrative control, and post-crisis reputation rebuilding. 48-hour response guarantee.",
  url: "https://hotbotstudios.com/public-relations/crisis-communications",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Crisis Communications", item: "https://hotbotstudios.com/public-relations/crisis-communications" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What should a company do in the first hour of a PR crisis?", acceptedAnswer: { "@type": "Answer", text: "In the first hour: (1) Assemble your crisis team immediately — CEO, legal, communications lead. (2) Establish the facts you know vs don't know — never communicate speculation. (3) Issue a brief holding statement acknowledging awareness of the situation, even if you have no further details yet. (4) Halt any scheduled marketing communications. (5) Monitor media and social mentions in real time. (6) Contact your PR agency for rapid response support. The first hour sets the tone for how the crisis is perceived — silence is typically interpreted as guilt or incompetence." } },
    { "@type": "Question", name: "How quickly can HotBot Studios respond to a PR crisis?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios guarantees a crisis response within 48 hours — with initial consultant engagement typically within 2–4 hours of contact. For existing retainer clients, we maintain dedicated crisis protocols and can have a crisis communications plan in place within hours of the first call. We are available 24/7 for crisis situations." } },
    { "@type": "Question", name: "Can you help repair our brand reputation after negative media coverage?", acceptedAnswer: { "@type": "Answer", text: "Yes — post-crisis reputation rebuilding is a structured process: first containing the crisis, then executing a positive narrative campaign to generate new, authoritative content that displaces negative coverage in search results. This combines earned media placements (new editorial coverage), thought leadership content, SEO-optimised articles, and strategic social media — typically showing measurable improvement in 3–6 months." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🚨", title: "Rapid Response Crisis PR", desc: "24/7 crisis response team activated within hours of contact. Initial holding statement drafted, media monitoring initiated, spokesperson briefed, and a comprehensive crisis communications plan in your hands within 48 hours.", href: "/public-relations/crisis-communications" },
  { icon: "📝", title: "Media Holding Statements", desc: "Carefully crafted holding statements that acknowledge the situation, project responsibility, and maintain control of the narrative — without over-committing to facts not yet established or creating legal liability.", href: "/public-relations/crisis-communications" },
  { icon: "🎙️", title: "Spokesperson Preparation", desc: "Intensive media training for executives navigating a crisis: key message discipline, bridging techniques, handling hostile questioning, body language under camera, and real-time coaching during live interviews.", href: "/public-relations/crisis-communications" },
  { icon: "📊", title: "Crisis Monitoring & Intelligence", desc: "Real-time media monitoring across news, social media, review platforms, and industry forums — tracking narrative evolution, sentiment shift, and identifying new threats before they escalate.", href: "/public-relations/crisis-communications" },
  { icon: "🔄", title: "Narrative Reframe & Recovery", desc: "Systematic post-crisis narrative campaign to establish your corrected story in the media, reframe the conversation around positive outcomes, and displace negative coverage with authoritative new content.", href: "/public-relations/crisis-communications" },
  { icon: "🛡️", title: "Proactive Crisis Preparedness", desc: "Crisis communications playbook development before a crisis strikes — identifying potential risk scenarios, pre-approving holding statements, training spokespersons, and defining the crisis team and escalation procedures.", href: "/public-relations/crisis-communications" },
];

const STATS = [
  { value: 48, suffix: "hr", label: "Crisis Response Guarantee", color: "#ec4899" },
  { value: 24, suffix: "/7", label: "Availability for Crisis Situations", color: "#3b82f6" },
  { value: 80, suffix: "%", label: "of Crises Avoidable with Preparedness Plan", color: "#22c55e" },
  { value: 6, suffix: "hrs", label: "Avg First Response — Existing Clients", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Crisis Assessment", desc: "Within hours of contact: assess the crisis scope, identify the primary threat (media inquiry, social media, legal action), establish facts vs unknowns, and define the immediate priority — contain or clarify.", icon: "🔍" },
  { n: 2, title: "Holding Statement & Message Map", desc: "Draft the immediate holding statement and a full message map — the approved answers to every question journalists, customers, and employees are likely to ask. Your team speaks from one script.", icon: "📝" },
  { n: 3, title: "Proactive Outreach & Narrative Control", desc: "Where appropriate, proactively brief key journalists, partners, and stakeholders on your version of events — before they call you. Controlling the timing and framing of information is critical to crisis management.", icon: "📣" },
  { n: 4, title: "Recovery & Reputation Rebuild", desc: "Post-crisis: execute a positive narrative campaign — new earned media, thought leadership content, and SEO strategy — to displace negative coverage and re-establish your brand's authority and trust.", icon: "🏗️" },
];

const FAQS = [
  { q: "What should a company do in the first hour of a PR crisis?", a: "Assemble your crisis team (CEO, legal, communications). Establish facts vs unknowns — never speculate. Issue a brief holding statement acknowledging awareness of the situation. Halt all scheduled marketing. Monitor media and social in real time. Contact your PR agency immediately. Silence in the first hour is typically interpreted as guilt or incompetence." },
  { q: "How quickly can HotBot Studios respond to a PR crisis?", a: "Initial consultant engagement typically within 2–4 hours of contact, with a full crisis communications plan within 48 hours. For retainer clients we maintain dedicated crisis protocols and can respond within hours. We are available 24/7 for crisis situations." },
  { q: "Can you help repair our brand reputation after negative coverage?", a: "Yes — post-crisis reputation rebuilding is a structured process: contain the crisis, then execute a positive narrative campaign generating new authoritative content that displaces negative coverage in search results. Typically shows measurable improvement in 3–6 months." },
  { q: "What types of PR crises do you handle?", a: "Negative media coverage, social media pile-ons, employee-related controversies, product recalls or safety issues, data breaches and security incidents, executive misconduct allegations, hostile competitor PR attacks, regulatory investigations, and customer service crises that go viral." },
  { q: "Should we say 'no comment' to journalists during a crisis?", a: "'No comment' is almost always the wrong response — it is interpreted by journalists and the public as confirmation of guilt or something to hide. Instead, a properly crafted holding statement ('We are aware of the situation and are investigating. We will provide further information as it becomes available.') acknowledges the situation without creating additional liability and buys time to develop a full response." },
  { q: "How do you develop a crisis communications plan before a crisis?", a: "A crisis preparedness playbook covers: (1) identification of your 5–10 highest-probability crisis scenarios, (2) pre-approved holding statements for each scenario, (3) defined crisis team and decision-making authority, (4) spokesperson training, (5) stakeholder communication protocols, and (6) media monitoring setup. This is delivered as a live document your team can access immediately when needed." },
];

const RELATED = [
  { title: "Media Relations", href: "/public-relations/media-relations", desc: "Build positive journalist relationships before a crisis strikes.", icon: "📰" },
  { title: "Digital PR & SEO", href: "/public-relations/digital-pr-seo", desc: "Displace negative search results with authoritative new content.", icon: "🌐" },
  { title: "Thought Leadership", href: "/public-relations/thought-leadership", desc: "Build the credibility reserve that protects you in a crisis.", icon: "🏆" },
];

export default function CrisisCommunicationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Crisis Communications Agency USA"
        title="In a Crisis, the First Hours Determine the Outcome"
        subtitle="A brand built over years can be damaged in 24 hours. HotBot Studios provides 24/7 rapid response crisis PR — holding statements, spokesperson prep, and narrative control — so your story is told accurately, by you, before the media tells it for you."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Crisis communications (definition):</strong> The strategic management of a business&apos;s communications during a situation that threatens brand reputation, customer trust, employee confidence, or regulatory standing. Effective crisis communications follows a structured model: rapid acknowledgement (within 1–4 hours), factual holding statements that control the narrative, proactive stakeholder outreach, media relations management, and a post-crisis recovery programme. The brands that recover fastest from crises are those that communicate quickly, honestly, and with a clear plan — not those that go silent and wait.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Crisis Response Timeline ─────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">The Crisis Communications Timeline — What Should Happen When</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { stat: "57%", label: "of crises escalate because the brand responds too slowly (PRWeek 2025)", color: "#ec4899" },
                  { stat: "80%", label: "of PR crises are avoidable with a documented crisis preparedness plan", color: "#22c55e" },
                  { stat: "4hrs", label: "maximum time before 'no comment' becomes a news story in itself", color: "#f59e0b" },
                  { stat: "6mo", label: "average time for brand reputation to recover with a proactive strategy", color: "#3b82f6" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.stat}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Response timeline */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Ideal Crisis Response Timeline</p>
              <div className="space-y-3">
                {[
                  { time: "0–1 hour", action: "Crisis team assembled. Facts established. HotBot Studios engaged. Media monitoring live.", color: "#ec4899", priority: "Critical" },
                  { time: "1–4 hours", action: "Holding statement issued. Internal communication to employees and partners. Social media acknowledged.", color: "#f59e0b", priority: "Critical" },
                  { time: "4–24 hours", action: "Full crisis plan activated. Key journalists briefed proactively. Spokesperson prepared for media requests.", color: "#8b5cf6", priority: "High" },
                  { time: "24–72 hours", action: "Corrected narrative in circulation. Press release issued. Positive story angles in development.", color: "#3b82f6", priority: "High" },
                  { time: "Week 2–12", action: "Reputation recovery campaign: earned media, thought leadership, SEO content displacing negative results.", color: "#22c55e", priority: "Ongoing" },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${row.color}08`, border: `1px solid ${row.color}18` }}>
                    <div className="text-xs font-bold w-24 shrink-0 mt-0.5" style={{ color: row.color }}>{row.time}</div>
                    <div className="flex-1 text-slate-300 text-xs">{row.action}</div>
                    <div className="text-[10px] shrink-0 px-2 py-0.5 rounded-full font-semibold" style={{ background: `${row.color}20`, color: row.color }}>{row.priority}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">Brands that respond within 4 hours are 3× more likely to control the dominant narrative. Source: Edelman Crisis Report 2025</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Crisis Communications Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Crisis Response Capabilities" />
      <ProcessSteps steps={PROCESS} title="Our Crisis Communications Process" />

      {/* ── Crisis Types ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Crisis Types We Handle</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "📰", type: "Negative Media Coverage", desc: "Inaccurate, hostile, or damaging editorial coverage in national or trade press", color: "#ec4899" },
            { icon: "📱", type: "Social Media Crises", desc: "Viral negative posts, Twitter/X pile-ons, review bombing, or influencer attacks", color: "#8b5cf6" },
            { icon: "🔐", type: "Data Breach & Security", desc: "Customer data exposure incidents requiring regulatory notification and public disclosure", color: "#3b82f6" },
            { icon: "👔", type: "Executive Misconduct", desc: "Leadership-related controversies requiring sensitive, legally-coordinated PR response", color: "#f59e0b" },
            { icon: "⚖️", type: "Regulatory Investigation", desc: "FTC, SEC, or other regulatory actions that attract media attention", color: "#06b6d4" },
            { icon: "😡", type: "Customer Service Viral", desc: "Customer complaints or service failures that go viral and attract national press coverage", color: "#22c55e" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <GlassCard className="p-5 h-full text-center" hover>
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: item.color }}>{item.type}</div>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
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
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Crisis Communications for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "57% of PR crises escalate because the brand responds too slowly — the first 4 hours are the most critical window.",
                "HotBot Studios guarantees crisis response within 48 hours, with initial engagement typically within 2–4 hours.",
                "'No comment' is almost always wrong — a crafted holding statement acknowledges the situation without creating liability.",
                "80% of PR crises are avoidable with a documented crisis preparedness playbook developed proactively.",
                "Post-crisis reputation recovery takes 3–6 months of systematic earned media, thought leadership, and SEO content.",
                "We handle negative media, social media crises, data breaches, executive controversies, and regulatory actions.",
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
        title="Facing a PR Crisis Right Now?"
        subtitle="Every hour matters. Contact HotBot Studios immediately and our crisis communications team will have a response plan in your hands within 48 hours — often much faster. Available 24/7."
        formType="strategy-call"
      />
    </>
  );
}
