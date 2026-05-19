import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SEO_SERVICES,
  SEO_LOCATIONS,
  getServiceBySlug,
  getLocationBySlug,
  buildServiceLocationTitle,
  buildServiceLocationDescription,
} from "@/lib/seo-pages-data";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Reveal } from "@/components/shared/Reveal";

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return SEO_SERVICES.flatMap((svc) =>
    SEO_LOCATIONS.map((loc) => ({ service: svc.slug, location: loc.slug }))
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  const location = getLocationBySlug(locationSlug);
  if (!service || !location) return {};

  const title = buildServiceLocationTitle(service, location);
  const description = buildServiceLocationDescription(service, location);
  const canonical = `https://hotbotstudios.com/services/${serviceSlug}/${locationSlug}`;

  return {
    title,
    description,
    keywords: [
      `${service.name.toLowerCase()} ${location.city}`,
      `${service.name.toLowerCase()} ${location.city} ${location.state}`,
      `${service.shortName} agency ${location.city}`,
      `${service.shortName} company ${location.city} ${location.state}`,
      `best ${service.name.toLowerCase()} ${location.city}`,
      `${service.name.toLowerCase()} services ${location.stateFullName}`,
      `digital agency ${location.city}`,
      `marketing agency ${location.city} ${location.state}`,
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ServiceLocationPage({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}) {
  const { service: serviceSlug, location: locationSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  const location = getLocationBySlug(locationSlug);
  if (!service || !location) notFound();

  const title = buildServiceLocationTitle(service, location);
  const description = buildServiceLocationDescription(service, location);
  const canonical = `https://hotbotstudios.com/services/${serviceSlug}/${locationSlug}`;

  // Related locations (same region)
  const relatedLocations = SEO_LOCATIONS.filter(
    (l) => l.region === location.region && l.slug !== location.slug
  ).slice(0, 6);

  // Related services (other services available in this city)
  const relatedServices = SEO_SERVICES.filter((s) => s.slug !== service.slug).slice(0, 4);

  // Structured data
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `HotBot Studios - ${service.name} in ${location.city}`,
    description,
    url: canonical,
    image: "https://hotbotstudios.com/og-image.png",
    telephone: "+1-800-HOTBOT",
    priceRange: "$$",
    areaServed: [
      { "@type": "City", name: location.city, containedIn: { "@type": "State", name: location.stateFullName } },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: location.city,
      addressRegion: location.state,
      addressCountry: "US",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.name,
      itemListElement: service.benefits.map((b, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: { "@type": "Service", name: b },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://hotbotstudios.com/services" },
      { "@type": "ListItem", position: 3, name: service.name, item: `https://hotbotstudios.com/services/${serviceSlug}` },
      { "@type": "ListItem", position: 4, name: location.city, item: canonical },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumb
        items={[
          { label: "Services", href: "/services" },
          { label: service.name, href: service.parentSlug },
          { label: location.city },
        ]}
      />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              background: `${service.color}18`,
              border: `1px solid ${service.color}44`,
              color: service.color,
            }}
          >
            <span>{service.icon}</span>
            {service.name} · {location.city}, {location.state}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5 text-white">
            {service.name}{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${service.color}, #8b5cf6)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              in {location.city}
            </span>
            , {location.state}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {service.description} Serving businesses across {location.city}&apos;s{" "}
            {location.industries.slice(0, 3).join(", ")} sectors.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${service.color}, #8b5cf6)` }}
            >
              Get a Free {location.city} Strategy Call
            </Link>
            {service.parentSlug && (
              <Link
                href={service.parentSlug}
                className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 transition-all duration-200"
              >
                View {service.name} Details →
              </Link>
            )}
          </div>
        </Reveal>
      </section>

      {/* Why local matters */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Why {location.city} Businesses Choose HotBot Studios
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            We understand the {location.city} market-its competitive landscape, dominant industries
            ({location.industries.slice(0, 3).join(", ")}), and the buyer behavior unique to the{" "}
            {location.region} region.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "🏙️",
              title: `${location.city} Market Expertise`,
              body: `We&apos;ve worked with ${location.region} businesses and understand what resonates with ${location.city} buyers. No generic playbooks.`,
            },
            {
              icon: "📊",
              title: "Data-Driven Execution",
              body: "Every decision is backed by analytics. We set KPIs before day one and report results you can tie directly to revenue.",
            },
            {
              icon: "⚡",
              title: "Fast Time to Results",
              body: `${location.city} businesses can&apos;t afford slow. Our sprint-based delivery model gets your first wins on the board within weeks.`,
            },
            {
              icon: "🔗",
              title: "Full-Service Integration",
              body: `${service.name} works best alongside SEO, AI, and content. As a full-service agency, we connect every channel.`,
            },
            {
              icon: "🛡️",
              title: "Transparent Reporting",
              body: "Weekly status updates, monthly strategy calls, and a live dashboard you always have access to. No black boxes.",
            },
            {
              icon: "🤝",
              title: "Dedicated Account Team",
              body: `Your ${location.city} account has a dedicated strategist and an account manager-not a revolving door of juniors.`,
            },
          ].map((card, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="rounded-2xl p-6 h-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-white font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: card.body }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            What&apos;s Included in Our {service.name} Package
          </h2>
        </Reveal>
        <div className="space-y-4">
          {service.benefits.map((benefit, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div
                className="flex items-start gap-4 rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: `${service.color}22`, color: service.color }}
                >
                  {i + 1}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed pt-0.5">{benefit}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Industries we serve in this city */}
      <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Industries We Serve in {location.city}
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-10">
            {location.city}&apos;s economy is anchored by {location.industries.join(", ")}. We bring
            sector-specific expertise to every engagement.
          </p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-3">
          {location.industries.map((industry) => (
            <Reveal key={industry}>
              <span
                className="px-4 py-2 rounded-full text-sm font-medium capitalize"
                style={{
                  background: `${service.color}14`,
                  border: `1px solid ${service.color}30`,
                  color: service.color,
                }}
              >
                {industry}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={service.faqs} />

      {/* Related services in this city */}
      <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6">
            More Services in {location.city}
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedServices.map((svc) => (
            <Reveal key={svc.slug}>
              <Link
                href={`/services/${svc.slug}/${locationSlug}`}
                className="rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 block"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-2xl mb-2">{svc.icon}</div>
                <p className="text-slate-300 text-xs font-medium">{svc.shortName}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Related locations */}
      {relatedLocations.length > 0 && (
        <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800/50">
          <Reveal>
            <h2 className="text-xl font-bold text-white mb-6">
              {service.name} in Nearby {location.region} Cities
            </h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {relatedLocations.map((loc) => (
              <Reveal key={loc.slug}>
                <Link
                  href={`/services/${serviceSlug}/${loc.slug}`}
                  className="px-4 py-2 rounded-full text-sm text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-all duration-200"
                >
                  {loc.city}, {loc.state}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <CTASection />
    </>
  );
}
