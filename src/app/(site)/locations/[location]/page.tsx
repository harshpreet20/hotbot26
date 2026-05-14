import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SEO_SERVICES,
  SEO_LOCATIONS,
  getLocationBySlug,
  buildLocationTitle,
  buildLocationDescription,
} from "@/lib/seo-pages-data";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/shared/Reveal";

export async function generateStaticParams() {
  return SEO_LOCATIONS.map((loc) => ({ location: loc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: locationSlug } = await params;
  const location = getLocationBySlug(locationSlug);
  if (!location) return {};

  const title = buildLocationTitle(location);
  const description = buildLocationDescription(location);
  const canonical = `https://hotbotstudios.com/locations/${locationSlug}`;

  return {
    title,
    description,
    keywords: [
      `digital marketing agency ${location.city}`,
      `marketing agency ${location.city} ${location.state}`,
      `SEO agency ${location.city}`,
      `AI automation ${location.city}`,
      `software development company ${location.city}`,
      `web design agency ${location.city} ${location.state}`,
      `content marketing ${location.city}`,
      `HotBot Studios ${location.city}`,
    ],
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: locationSlug } = await params;
  const location = getLocationBySlug(locationSlug);
  if (!location) notFound();

  const title = buildLocationTitle(location);
  const description = buildLocationDescription(location);
  const canonical = `https://hotbotstudios.com/locations/${locationSlug}`;

  // Nearby cities (same region)
  const nearbyCities = SEO_LOCATIONS.filter(
    (l) => l.region === location.region && l.slug !== location.slug
  ).slice(0, 8);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `HotBot Studios - Digital Agency in ${location.city}, ${location.state}`,
    description,
    url: canonical,
    image: "https://hotbotstudios.com/og-image.png",
    telephone: "+1-800-HOTBOT",
    priceRange: "$$",
    areaServed: {
      "@type": "City",
      name: location.city,
      containedIn: { "@type": "State", name: location.stateFullName },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: location.city,
      addressRegion: location.state,
      addressCountry: "US",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Digital Services in ${location.city}`,
      itemListElement: SEO_SERVICES.map((s, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: { "@type": "Service", name: s.name },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
      { "@type": "ListItem", position: 2, name: "Locations", item: "https://hotbotstudios.com/locations" },
      { "@type": "ListItem", position: 3, name: `${location.city}, ${location.state}`, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumb
        items={[
          { label: "Locations", href: "/locations" },
          { label: `${location.city}, ${location.state}` },
        ]}
      />

      {/* Hero */}
      <section className="pt-20 pb-14 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#93c5fd",
            }}
          >
            📍 {location.city}, {location.stateFullName}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5 text-white">
            Digital Marketing &amp; Tech Agency{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              in {location.city}
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Full-service digital agency serving {location.city}, {location.stateFullName}. SEO,
            AI automation, software development, content marketing, and more-all under one roof.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            Free {location.city} Strategy Call →
          </Link>
        </Reveal>
      </section>

      {/* City stats */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "City Population", value: location.population },
            { label: "Region", value: location.region },
            { label: "Services Available", value: `${SEO_SERVICES.length}` },
            { label: "Industries Served", value: `${location.industries.length}` },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            All Services Available in {location.city}
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-10">
            Every HotBot Studios service is available to businesses in {location.city},{" "}
            {location.stateFullName}. Click any service to see a dedicated page for your market.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {SEO_SERVICES.map((svc, i) => (
            <Reveal key={svc.slug} delay={i * 0.04}>
              <Link
                href={`/services/${svc.slug}/${locationSlug}`}
                className="group rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-3xl">{svc.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-300 transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {svc.description}
                  </p>
                </div>
                <span
                  className="mt-auto text-xs font-semibold"
                  style={{ color: svc.color }}
                >
                  View in {location.city} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Top industries */}
      <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800/50">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-3">
            Top Industries in {location.city}
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-xl">
            We bring deep domain expertise to {location.city}&apos;s leading sectors.
          </p>
        </Reveal>
        <div className="flex flex-wrap gap-3">
          {location.industries.map((industry) => (
            <Reveal key={industry}>
              <span className="px-4 py-2 rounded-full text-sm capitalize bg-slate-800/60 border border-slate-700 text-slate-300">
                {industry}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Nearby cities */}
      {nearbyCities.length > 0 && (
        <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800/50">
          <Reveal>
            <h2 className="text-xl font-bold text-white mb-6">
              Other {location.region} Cities We Serve
            </h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {nearbyCities.map((loc) => (
              <Reveal key={loc.slug}>
                <Link
                  href={`/locations/${loc.slug}`}
                  className="px-4 py-2 rounded-full text-sm text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-all duration-200"
                >
                  {loc.city}, {loc.state}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CTASection
        title={`Ready to Grow Your ${location.city} Business?`}
        subtitle={`Let's build a custom growth strategy for your ${location.city}, ${location.stateFullName} business. Free 30-minute strategy call.`}
      />
    </>
  );
}
