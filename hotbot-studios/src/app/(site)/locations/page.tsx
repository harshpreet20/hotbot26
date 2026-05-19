import type { Metadata } from "next";
import Link from "next/link";
import { SEO_LOCATIONS } from "@/lib/seo-pages-data";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "Locations We Serve — US Digital Marketing & Tech Agency | HotBot Studios",
  description:
    "HotBot Studios serves businesses across 50+ US cities. SEO, AI automation, software development, and digital marketing for every major American market. Find your city.",
  keywords: [
    "digital marketing agency USA",
    "SEO agency United States",
    "AI automation agency USA",
    "marketing agency locations",
    "HotBot Studios locations",
  ],
  openGraph: {
    title: "Locations We Serve — US Digital Marketing & Tech Agency | HotBot Studios",
    description: "HotBot Studios serves businesses across 50+ US cities. Find your city.",
    url: "https://hotbotstudios.com/locations",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "HotBot Studios US Locations" }],
  },
  alternates: { canonical: "https://hotbotstudios.com/locations" },
};

// Group locations by region
const byRegion = SEO_LOCATIONS.reduce<Record<string, typeof SEO_LOCATIONS>>((acc, loc) => {
  if (!acc[loc.region]) acc[loc.region] = [];
  acc[loc.region].push(loc);
  return acc;
}, {});

const REGION_ORDER = ["Northeast", "Mid-Atlantic", "Southeast", "South", "Midwest", "Mountain", "Southwest", "West", "Northwest", "Pacific"];

export default function LocationsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Locations" }]} />

      <section className="pt-20 pb-14 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}
          >
            📍 Nationwide Coverage
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5 text-white">
            US Cities We{" "}
            <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Serve
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            HotBot Studios works with businesses in {SEO_LOCATIONS.length}+ US metro areas. Select your city for
            market-specific SEO, AI automation, software development, and digital marketing services.
          </p>
        </Reveal>
      </section>

      {REGION_ORDER.filter((r) => byRegion[r]).map((region) => (
        <section key={region} className="py-10 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/50">
          <Reveal>
            <h2 className="text-lg font-bold text-white mb-6">{region}</h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {byRegion[region].map((loc) => (
              <Reveal key={loc.slug}>
                <Link
                  href={`/locations/${loc.slug}`}
                  className="px-4 py-2.5 rounded-xl text-sm text-slate-300 border border-slate-700/60 hover:border-blue-500/50 hover:text-white hover:bg-blue-500/5 transition-all duration-200"
                >
                  {loc.city}, {loc.state}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <CTASection
        title="Your City Not Listed?"
        subtitle="We work with businesses across the entire US. Contact us and we'll build a tailored strategy for your specific market."
      />
    </>
  );
}
