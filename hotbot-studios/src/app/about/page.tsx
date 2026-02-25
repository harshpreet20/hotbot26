import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CTASection } from "@/components/sections/CTASection";
import { StatsSection } from "@/components/sections/StatsSection";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

export const metadata: Metadata = {
  title: "About HotBot Studios | UK Digital Agency",
  description:
    "Learn about HotBot Studios — the full-service digital agency combining AI, marketing, content, software, PR, and design for UK businesses.",
};

const VALUES = [
  { icon: "🎯", title: "Results First", desc: "Every decision we make is tied to measurable outcomes. No vanity metrics, no excuses." },
  { icon: "🤖", title: "Tech-Forward", desc: "We integrate AI and automation into everything we do to deliver faster, smarter results." },
  { icon: "🤝", title: "True Partnership", desc: "We don't take briefs — we build partnerships. Your success is genuinely our success." },
  { icon: "🔬", title: "Data-Driven", desc: "Gut feelings don't scale. Every strategy is grounded in data, tested, and refined." },
  { icon: "⚡", title: "Speed Without Compromise", desc: "We move fast, but never at the expense of quality. Agile, not reckless." },
  { icon: "🌍", title: "Globally Minded", desc: "UK-headquartered with a global team and international client experience." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="About Us"
        title="The Agency Built for the AI Era"
        subtitle="HotBot Studios was founded to solve a simple problem: most agencies do one thing. We build the entire growth stack — marketing, AI, content, software, PR, and design — under one roof."
      />

      {/* Mission */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-12">
        <Reveal>
          <div className="p-8 rounded-3xl text-center" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-2xl font-semibold text-white leading-relaxed mb-4">
              &ldquo;We exist to give every UK business access to enterprise-grade marketing technology and creative talent — regardless of size.&rdquo;
            </p>
            <p className="text-slate-400">— HotBot Studios Founding Team</p>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Values */}
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

      {/* Why us */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-12">
        <Reveal>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why HotBot Studios?</h2>
        </Reveal>
        <div className="space-y-4">
          {[
            { q: "Full-stack service", a: "7 services under one roof means no agency fragmentation. One strategy, one team, one invoice." },
            { q: "AI-native approach", a: "We build AI into every service — from AI-powered ad bidding to automated content workflows." },
            { q: "UK-focused expertise", a: "We understand UK consumers, regulations (GDPR), and media landscape better than any overseas agency." },
            { q: "Transparent reporting", a: "You get weekly updates and a live dashboard showing exactly how your investment is performing." },
          ].map((item, i) => (
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

      <CTASection title="Ready to Work Together?" subtitle="Let's talk about your goals and how HotBot Studios can help you achieve them." />
    </>
  );
}
