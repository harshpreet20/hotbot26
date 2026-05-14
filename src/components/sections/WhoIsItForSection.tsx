import { Reveal } from "@/components/shared/Reveal";

const FITS = [
  {
    emoji: "🛒",
    title: "E-commerce & D2C Brands",
    desc: "Selling online but ad spend isn't converting? We build the full funnel - creatives, automation, retargeting, and CRO - to turn browsers into buyers.",
  },
  {
    emoji: "🚀",
    title: "Funded Startups Moving Fast",
    desc: "Seed to Series A and need to hit growth targets now. We deploy AI-powered marketing and automation infrastructure in weeks, not quarters.",
  },
  {
    emoji: "🏢",
    title: "B2B Companies Scaling Lead Gen",
    desc: "Tired of cold outreach that goes nowhere? We engineer content, PR, and automation pipelines that bring warm, qualified enterprise leads to your door.",
  },
  {
    emoji: "🏭",
    title: "Traditional Businesses Going Digital",
    desc: "Brick-and-mortar or offline-first? We modernize your presence, build digital revenue streams, and automate operations so you scale without adding headcount.",
  },
  {
    emoji: "🌐",
    title: "US Market Entrants",
    desc: "Entering the US market from abroad? We know the US media landscape, buyer psychology, and channels that work - so you skip the guesswork.",
  },
  {
    emoji: "💡",
    title: "Established Brands Hitting a Ceiling",
    desc: "Revenue plateaued despite good products? We audit every growth lever, find the bottleneck, and rebuild what's holding you back.",
  },
];

const NOT_FOR = [
  "Businesses looking for the cheapest option",
  "Anyone not ready to invest in sustainable growth",
  "Teams that want execution without strategy",
];

export function WhoIsItForSection() {
  return (
    <section className="relative z-10 py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Is This For You?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
            We Work Best With Brands Ready to Scale
          </h2>
          <p className="text-slate-500 text-center max-w-xl mx-auto mb-14">
            We&apos;re not for everyone - and that&apos;s intentional. Here&apos;s who gets the most from HotBot Studios.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {FITS.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className="rounded-2xl p-6 h-full"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div
            className="rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
            style={{
              background: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.12)",
            }}
          >
            <p className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-4">This is NOT for you if…</p>
            <ul className="space-y-2">
              {NOT_FOR.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
