import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { StatsSection } from "@/components/sections/StatsSection";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About HotBot Studios - Full-Service AI & Digital Marketing Agency USA",
  description:
    "HotBot Studios is America's full-stack growth agency - combining AI automation, digital marketing, content production, software development, PR, and UI/UX design for US businesses. 42+ clients. Results-first. Learn our story.",
  keywords: [
    "about HotBot Studios",
    "AI digital marketing agency USA",
    "full service growth agency USA",
    "AI automation company USA",
    "marketing agency New York",
    "digital agency team USA",
    "US growth agency",
    "results-driven digital agency",
    "AI marketing agency team",
  ],
  openGraph: {
    title: "About HotBot Studios - Full-Service AI & Digital Marketing Agency USA",
    description: "America's full-stack growth agency - AI automation, marketing, content, software, PR & design for 42+ US businesses.",
    url: "https://hotbotstudios.com/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About HotBot Studios - AI & Digital Marketing Agency USA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About HotBot Studios | AI & Digital Marketing Agency USA",
    description: "America's full-stack growth agency - AI, marketing, content, software & PR for 42+ US businesses.",
  },
  alternates: { canonical: "https://hotbotstudios.com/about" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://hotbotstudios.com/about" },
  ],
};

const VALUES = [
  { icon: "🎯", title: "Results First", desc: "Every decision is tied to measurable outcomes. No vanity metrics, no activity theater. Revenue, ROAS, time saved, leads converted - these are the only numbers that matter." },
  { icon: "🤖", title: "AI-Native by Default", desc: "AI isn't an add-on at HotBot Studios - it's built into every service. AI-powered bidding, automated content workflows, intelligent lead scoring, and predictive analytics are standard." },
  { icon: "🤝", title: "True Partnership", desc: "We don't take briefs and disappear. We embed in your business, ask the uncomfortable questions, and build strategies with full context of your market, team, and goals." },
  { icon: "🔬", title: "Data-Driven Decisions", desc: "Gut feelings don't scale. Every strategy is grounded in first-party data, competitive intelligence (SEMrush, Ahrefs), and continuous experimentation with measurable outcomes." },
  { icon: "⚡", title: "Speed Without Compromise", desc: "MVPs in 4 weeks. Campaigns live in days. Content in 48 hours. We move fast - but never at the expense of quality. Agile execution, not reckless delivery." },
  { icon: "🌍", title: "Globally Minded, US Focused", desc: "US-headquartered with a global team. We understand US consumers, the American media landscape, CCPA compliance, and the channels that drive growth for US businesses." },
];

const WHY_US = [
  { q: "One team, seven integrated capabilities", a: "Agency fragmentation kills momentum. When your SEO, AI, content, and dev teams are in separate companies, nothing moves fast and nothing compounds. One integrated team means strategies reinforce each other - your AI feeds your marketing, your content fuels your PR, your data shapes everything." },
  { q: "AI runs through everything we do", a: "We don't offer AI automation as a separate service you opt into. AI-powered ad bidding, automated content workflows, intelligent lead scoring, voice AI (Heka), and predictive analytics are built into every service category. The result: faster execution, less waste, better outcomes." },
  { q: "Built specifically for the US market", a: "We understand US consumers, the American media landscape (Forbes, TechCrunch, WSJ), CCPA compliance, and the channels that actually drive growth for US businesses. No learning curve. Just results." },
  { q: "Radical transparency at every step", a: "You get a live GA4-connected dashboard, weekly updates, and monthly strategy reviews - showing exactly what we've done, what moved the needle, and what's next. If something isn't working, we tell you first." },
];

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <PageHeader
        label="About HotBot Studios"
        title="The Agency That Builds Your Entire Growth Stack"
        subtitle="Most agencies specialize in one slice of your growth. You end up managing five vendors, five invoices, and five strategies that don't talk to each other. HotBot Studios fixes that - one AI-native team builds your entire growth engine for your US business."
      />

      {/* ── Mission ──────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-12">
        <Reveal>
          <div className="p-8 rounded-3xl text-center" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed mb-4">
              &ldquo;Every US business deserves the same advantages Fortune 500 companies take for granted: world-class AI automation, cutting-edge digital marketing, premium content, and a growth strategy built on data - not guesswork.&rdquo;
            </p>
            <p className="text-slate-400">- HotBot Studios Founding Team</p>
          </div>
        </Reveal>
      </section>

      <StatsSection />

      {/* ── Services Hub (Internal Links) ────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Our Seven Integrated Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "AI Automation", href: "/ai-automation", icon: "🤖", desc: "Custom AI agents & n8n workflows" },
              { label: "Digital Marketing", href: "/digital-marketing", icon: "📣", desc: "SEO, PPC & social media" },
              { label: "Content Studio", href: "/content-studio", icon: "🎬", desc: "Video, copy & social content" },
              { label: "Software Dev", href: "/software-development", icon: "💻", desc: "Web apps, mobile & SaaS" },
              { label: "Public Relations", href: "/public-relations", icon: "📰", desc: "Forbes, TechCrunch & major media" },
              { label: "UI/UX Design", href: "/ui-ux-design", icon: "🎨", desc: "Figma design systems & prototypes" },
              { label: "Consulting", href: "/marketing-consulting", icon: "🗺️", desc: "Growth strategy & fractional CMO" },
              { label: "Contact Us", href: "/contact", icon: "🚀", desc: "Start your project today" },
            ].map((svc, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <Link href={svc.href}
                  className="block p-4 rounded-2xl transition-all duration-200 hover:-translate-y-1 h-full"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-2">{svc.icon}</div>
                  <div className="text-white text-sm font-semibold mb-1">{svc.label}</div>
                  <div className="text-slate-500 text-xs">{svc.desc}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto py-12">
        <Reveal>
          <h2 className="text-3xl font-bold text-white text-center mb-10">Our Values</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6" hover>
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-white mb-2">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Why HotBot Studios ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-12">
        <Reveal>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why HotBot Studios?</h2>
        </Reveal>
        <div className="space-y-4">
          {WHY_US.map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.q}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection
        title="Ready to Work With HotBot Studios?"
        subtitle="Let's talk about your US growth goals and how our integrated AI, marketing, and software team can help you achieve them faster than you thought possible."
      />
    </>
  );
}
