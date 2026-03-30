/**
 * Programmatic SEO — Master data layer
 *
 * Every combination of (service, location) generates a unique, indexable page.
 * Location hub pages (/locations/[slug]) list every service available in that city.
 *
 * URL pattern:  /services/[serviceSlug]/[locationSlug]
 * Location hub: /locations/[locationSlug]
 */

export interface SeoService {
  slug: string;
  name: string;
  shortName: string;
  parentSlug?: string;      // links back to main service page e.g. /digital-marketing
  parentLabel?: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
  faqs: Array<{ q: string; a: string }>;
}

export interface SeoLocation {
  slug: string;              // e.g. "new-york-ny"
  city: string;              // e.g. "New York"
  state: string;             // e.g. "NY"
  stateFullName: string;     // e.g. "New York"
  region: string;            // e.g. "Northeast"
  population: string;        // e.g. "8.3M"
  industries: string[];      // dominant local industries for contextual copy
}

// ─── Services ────────────────────────────────────────────────────────────────

export const SEO_SERVICES: SeoService[] = [
  {
    slug: "seo-services",
    name: "SEO Services",
    shortName: "SEO",
    parentSlug: "/digital-marketing/seo-services",
    parentLabel: "SEO Services",
    description: "Technical SEO, content strategy, and authority link building that drives qualified organic traffic and measurable pipeline growth.",
    icon: "🔍",
    color: "#8b5cf6",
    benefits: [
      "Full technical SEO audit & remediation",
      "Keyword research targeting high-intent buyer queries",
      "On-page content optimization",
      "Authority link acquisition",
      "Monthly rank tracking & reporting",
    ],
    faqs: [
      { q: "How long does SEO take to show results?", a: "Most clients see meaningful ranking improvements within 3–6 months. Technical fixes and on-page work can move rankings within weeks; authority building compounds over 6–12 months." },
      { q: "Do you work with local businesses?", a: "Yes. We optimize Google Business Profile, local citations, and localized landing pages to capture near-me searches in your city." },
      { q: "What industries do you specialize in?", a: "B2B SaaS, professional services, healthcare, fintech, e-commerce, and local service businesses. We adapt our strategy to your specific competitive landscape." },
      { q: "How do you measure SEO success?", a: "We track organic sessions, keyword position distribution, share-of-voice vs competitors, and—most importantly—organic-attributed leads and revenue." },
    ],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    shortName: "AI Automation",
    parentSlug: "/ai-automation",
    parentLabel: "AI Automation",
    description: "Custom AI agents, n8n workflow automation, and LLM integrations that cut manual work and unlock 24/7 operations.",
    icon: "🤖",
    color: "#3b82f6",
    benefits: [
      "Custom AI agent development",
      "n8n & Zapier workflow automation",
      "CRM & ERP AI integration",
      "24/7 AI voice receptionist (Heka)",
      "AI-powered reporting & analytics",
    ],
    faqs: [
      { q: "What processes can be automated with AI?", a: "Lead qualification, appointment booking, invoice processing, customer support triage, content generation, data enrichment, and hundreds of other repetitive workflows." },
      { q: "Do I need to change my existing software stack?", a: "No. We integrate with your existing CRM, ERP, helpdesk, and communication tools. Our automations layer on top of what you already use." },
      { q: "How quickly can an automation go live?", a: "Simple single-trigger automations can be live in days. Complex multi-system workflows typically take 2–4 weeks for design, build, and testing." },
      { q: "What's the ROI of AI automation?", a: "Clients typically recoup investment within 3–6 months. A single AI receptionist handling 200+ calls/month replaces $4,000+/month in human labor costs." },
    ],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    shortName: "Digital Marketing",
    parentSlug: "/digital-marketing",
    parentLabel: "Digital Marketing",
    description: "Full-funnel digital marketing—paid search, social ads, email, and analytics—designed to fill your pipeline with qualified buyers.",
    icon: "📈",
    color: "#22c55e",
    benefits: [
      "Google Ads & Meta Ads management",
      "LinkedIn B2B advertising",
      "Email marketing & automation",
      "Marketing analytics & attribution",
      "Conversion rate optimization",
    ],
    faqs: [
      { q: "What ad budget do I need to get started?", a: "We work with budgets from $3,000/month (local service businesses) to $100K+/month (enterprise). We right-size spend to your growth targets." },
      { q: "How do you track ROI on paid campaigns?", a: "Full-funnel attribution tracking from first click to closed deal. We connect ad platforms to your CRM so you know exactly which campaigns generate revenue." },
      { q: "Do you manage both Google and social ads?", a: "Yes. We manage Google Search, Display, YouTube, Meta (Facebook/Instagram), LinkedIn, and TikTok ads—coordinated under one strategy." },
      { q: "How soon will I see results from paid ads?", a: "Google Search campaigns typically generate leads within 1–2 weeks of launch. Full optimization takes 60–90 days as we accumulate conversion data." },
    ],
  },
  {
    slug: "software-development",
    name: "Software Development",
    shortName: "Software Dev",
    parentSlug: "/software-development",
    parentLabel: "Software Development",
    description: "Custom web apps, SaaS platforms, mobile apps, and API integrations built with React, Next.js, Node.js, and AWS.",
    icon: "💻",
    color: "#06b6d4",
    benefits: [
      "Custom web & mobile app development",
      "SaaS platform architecture & build",
      "API design and integration",
      "Cloud infrastructure on AWS / GCP",
      "4-week MVP delivery guarantee",
    ],
    faqs: [
      { q: "What tech stack do you use?", a: "React, Next.js, TypeScript, Node.js, PostgreSQL, and AWS. We match the stack to your requirements—we're not dogmatic about tools." },
      { q: "How fast can you deliver an MVP?", a: "We deliver functional MVPs in 4 weeks. Full-featured v1 launches typically take 8–12 weeks depending on scope." },
      { q: "Do you offer ongoing support after launch?", a: "Yes. All projects include a 30-day bug-fix warranty plus optional monthly retainer for feature development, performance monitoring, and infrastructure management." },
      { q: "Can you take over an existing codebase?", a: "Absolutely. We conduct a technical audit, then onboard into your existing repo and CI/CD pipeline. No forced rewrites unless the existing code is critically flawed." },
    ],
  },
  {
    slug: "content-marketing",
    name: "Content Marketing",
    shortName: "Content",
    parentSlug: "/content-studio",
    parentLabel: "Content Studio",
    description: "Strategic content marketing—blog, video, podcast, and social—that builds topical authority and attracts qualified organic traffic.",
    icon: "✍️",
    color: "#f59e0b",
    benefits: [
      "Long-form SEO content & thought leadership",
      "Video production & YouTube strategy",
      "Podcast production & distribution",
      "Social media content calendars",
      "Content performance analytics",
    ],
    faqs: [
      { q: "How many pieces of content do you produce per month?", a: "Typically 4–12 blog posts, 2–4 video scripts, and a social media calendar. Volume scales with your retainer budget." },
      { q: "Do you use AI to generate content?", a: "We use AI as a research and drafting aid, but every piece is reviewed, fact-checked, and written by experienced humans. Google rewards E-E-A-T, and so do we." },
      { q: "How do you ensure content ranks?", a: "Every piece starts with keyword research, SERP analysis, and a topical map. We optimize for search intent, not just keywords." },
      { q: "Can you repurpose existing content?", a: "Yes. We audit your existing library, update outdated posts, consolidate thin content, and repurpose top performers across channels." },
    ],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    shortName: "UI/UX Design",
    parentSlug: "/ui-ux-design",
    parentLabel: "UI/UX Design",
    description: "Research-driven UI/UX design that converts visitors into customers—wireframes, prototypes, and pixel-perfect UI built for performance.",
    icon: "🎨",
    color: "#ec4899",
    benefits: [
      "UX research & user journey mapping",
      "Wireframing & interactive prototypes",
      "Conversion-optimized UI design",
      "Mobile-first responsive design",
      "Accessibility (WCAG 2.1) compliance",
    ],
    faqs: [
      { q: "What's included in a UI/UX engagement?", a: "Discovery & user research, wireframes, high-fidelity mockups, interactive prototype, and a developer handoff package with Figma files and a design system." },
      { q: "Do you design for mobile?", a: "Always. We design mobile-first and test every breakpoint from 320px to 1920px." },
      { q: "Can you work with our existing brand?", a: "Yes. We extend your existing brand into a full design system or refresh it if needed—your call." },
      { q: "How do you measure design success?", a: "We instrument designs with heatmaps, session recordings, and A/B tests. Design decisions are backed by data, not opinions." },
    ],
  },
  {
    slug: "public-relations",
    name: "Public Relations",
    shortName: "PR",
    parentSlug: "/public-relations",
    parentLabel: "Public Relations",
    description: "Media relations, press releases, and thought leadership that builds brand authority and earns coverage in top-tier publications.",
    icon: "📰",
    color: "#f97316",
    benefits: [
      "Targeted media outreach & placement",
      "Press release writing & distribution",
      "Thought leadership & byline articles",
      "Crisis communications planning",
      "Digital PR for SEO link acquisition",
    ],
    faqs: [
      { q: "Which publications do you target?", a: "TechCrunch, Forbes, Business Insider, industry verticals, and local city business journals—matched to where your buyers actually read." },
      { q: "How long does it take to get press coverage?", a: "First placements typically arrive within 4–6 weeks. Tier-1 publications require a sustained 3–6 month relationship-building campaign." },
      { q: "Do you guarantee coverage?", a: "We guarantee outreach volume and pitch quality. No ethical PR firm can guarantee placements—editors make independent decisions. We average 3–5 placements per month per client." },
      { q: "How does PR help SEO?", a: "High-authority publications link back to your site. A single Forbes or TechCrunch link can move domain authority by 5–10 points and trigger cascading ranking improvements." },
    ],
  },
  {
    slug: "marketing-consulting",
    name: "Marketing Consulting",
    shortName: "Consulting",
    parentSlug: "/marketing-consulting",
    parentLabel: "Marketing Consulting",
    description: "Fractional CMO and growth strategy consulting—audit your marketing, build a scalable plan, and execute with a senior team.",
    icon: "🧠",
    color: "#64748b",
    benefits: [
      "Full marketing audit & competitive analysis",
      "Go-to-market strategy development",
      "Marketing technology stack advisory",
      "Team building & process design",
      "KPI frameworks & board-ready reporting",
    ],
    faqs: [
      { q: "What does a marketing audit include?", a: "Channel-by-channel performance review, competitive landscape analysis, messaging and positioning assessment, tech stack audit, and a prioritized 90-day growth roadmap." },
      { q: "Do you act as a fractional CMO?", a: "Yes. For companies that need senior marketing leadership without a full-time hire, we embed as your fractional CMO—attending leadership meetings, owning the marketing roadmap, and managing execution." },
      { q: "How is this different from a marketing agency?", a: "Consulting is strategy-first. We diagnose before prescribing. If execution is needed, we either do it ourselves or advise your in-house team." },
      { q: "What company sizes do you work with?", a: "Series A through Series C SaaS companies and established SMBs ($2M–$50M ARR). Sweet spot is companies that have found product-market fit and need to scale revenue systematically." },
    ],
  },
];

// ─── Locations ───────────────────────────────────────────────────────────────

export const SEO_LOCATIONS: SeoLocation[] = [
  { slug: "new-york-ny",       city: "New York",        state: "NY", stateFullName: "New York",       region: "Northeast",   population: "8.3M",  industries: ["finance", "media", "tech", "fashion", "real estate"] },
  { slug: "los-angeles-ca",    city: "Los Angeles",     state: "CA", stateFullName: "California",     region: "West",        population: "3.9M",  industries: ["entertainment", "tech", "fashion", "healthcare", "real estate"] },
  { slug: "chicago-il",        city: "Chicago",         state: "IL", stateFullName: "Illinois",       region: "Midwest",     population: "2.7M",  industries: ["finance", "logistics", "manufacturing", "healthcare", "tech"] },
  { slug: "houston-tx",        city: "Houston",         state: "TX", stateFullName: "Texas",          region: "South",       population: "2.3M",  industries: ["energy", "healthcare", "manufacturing", "aerospace", "logistics"] },
  { slug: "phoenix-az",        city: "Phoenix",         state: "AZ", stateFullName: "Arizona",        region: "Southwest",   population: "1.6M",  industries: ["real estate", "healthcare", "tech", "tourism", "manufacturing"] },
  { slug: "philadelphia-pa",   city: "Philadelphia",    state: "PA", stateFullName: "Pennsylvania",   region: "Northeast",   population: "1.6M",  industries: ["healthcare", "education", "finance", "pharma", "logistics"] },
  { slug: "san-antonio-tx",    city: "San Antonio",     state: "TX", stateFullName: "Texas",          region: "South",       population: "1.5M",  industries: ["military", "healthcare", "tourism", "financial services", "tech"] },
  { slug: "san-diego-ca",      city: "San Diego",       state: "CA", stateFullName: "California",     region: "West",        population: "1.4M",  industries: ["biotech", "defense", "tourism", "tech", "healthcare"] },
  { slug: "dallas-tx",         city: "Dallas",          state: "TX", stateFullName: "Texas",          region: "South",       population: "1.3M",  industries: ["finance", "tech", "healthcare", "logistics", "real estate"] },
  { slug: "san-jose-ca",       city: "San Jose",        state: "CA", stateFullName: "California",     region: "West",        population: "1.0M",  industries: ["tech", "semiconductor", "software", "venture capital", "engineering"] },
  { slug: "austin-tx",         city: "Austin",          state: "TX", stateFullName: "Texas",          region: "South",       population: "978K",  industries: ["tech", "music", "government", "education", "real estate"] },
  { slug: "jacksonville-fl",   city: "Jacksonville",    state: "FL", stateFullName: "Florida",        region: "South",       population: "949K",  industries: ["financial services", "healthcare", "logistics", "military", "real estate"] },
  { slug: "fort-worth-tx",     city: "Fort Worth",      state: "TX", stateFullName: "Texas",          region: "South",       population: "935K",  industries: ["aviation", "healthcare", "retail", "logistics", "finance"] },
  { slug: "columbus-oh",       city: "Columbus",        state: "OH", stateFullName: "Ohio",           region: "Midwest",     population: "905K",  industries: ["finance", "insurance", "retail", "education", "healthcare"] },
  { slug: "san-francisco-ca",  city: "San Francisco",   state: "CA", stateFullName: "California",     region: "West",        population: "873K",  industries: ["tech", "finance", "biotech", "tourism", "media"] },
  { slug: "charlotte-nc",      city: "Charlotte",       state: "NC", stateFullName: "North Carolina",  region: "Southeast",   population: "874K",  industries: ["banking", "energy", "healthcare", "tech", "real estate"] },
  { slug: "indianapolis-in",   city: "Indianapolis",    state: "IN", stateFullName: "Indiana",        region: "Midwest",     population: "887K",  industries: ["healthcare", "finance", "manufacturing", "logistics", "sports"] },
  { slug: "seattle-wa",        city: "Seattle",         state: "WA", stateFullName: "Washington",     region: "Northwest",   population: "749K",  industries: ["tech", "aerospace", "retail", "biotech", "shipping"] },
  { slug: "denver-co",         city: "Denver",          state: "CO", stateFullName: "Colorado",       region: "Mountain",    population: "715K",  industries: ["energy", "aerospace", "tech", "tourism", "healthcare"] },
  { slug: "nashville-tn",      city: "Nashville",       state: "TN", stateFullName: "Tennessee",      region: "Southeast",   population: "689K",  industries: ["healthcare", "music", "tourism", "finance", "tech"] },
  { slug: "oklahoma-city-ok",  city: "Oklahoma City",   state: "OK", stateFullName: "Oklahoma",       region: "South",       population: "681K",  industries: ["energy", "agriculture", "aerospace", "healthcare", "government"] },
  { slug: "el-paso-tx",        city: "El Paso",         state: "TX", stateFullName: "Texas",          region: "Southwest",   population: "678K",  industries: ["manufacturing", "military", "retail", "healthcare", "logistics"] },
  { slug: "washington-dc",     city: "Washington",      state: "DC", stateFullName: "District of Columbia", region: "Mid-Atlantic", population: "689K", industries: ["government", "consulting", "tech", "healthcare", "nonprofit"] },
  { slug: "las-vegas-nv",      city: "Las Vegas",       state: "NV", stateFullName: "Nevada",         region: "West",        population: "641K",  industries: ["hospitality", "entertainment", "tech", "real estate", "retail"] },
  { slug: "louisville-ky",     city: "Louisville",      state: "KY", stateFullName: "Kentucky",       region: "Southeast",   population: "633K",  industries: ["healthcare", "manufacturing", "logistics", "bourbon", "finance"] },
  { slug: "memphis-tn",        city: "Memphis",         state: "TN", stateFullName: "Tennessee",      region: "Southeast",   population: "633K",  industries: ["logistics", "healthcare", "manufacturing", "music", "agriculture"] },
  { slug: "portland-or",       city: "Portland",        state: "OR", stateFullName: "Oregon",         region: "Northwest",   population: "652K",  industries: ["tech", "manufacturing", "retail", "food & beverage", "outdoor industry"] },
  { slug: "baltimore-md",      city: "Baltimore",       state: "MD", stateFullName: "Maryland",       region: "Mid-Atlantic", population: "585K", industries: ["healthcare", "education", "government", "logistics", "finance"] },
  { slug: "milwaukee-wi",      city: "Milwaukee",       state: "WI", stateFullName: "Wisconsin",      region: "Midwest",     population: "577K",  industries: ["manufacturing", "healthcare", "finance", "food & beverage", "tech"] },
  { slug: "albuquerque-nm",    city: "Albuquerque",     state: "NM", stateFullName: "New Mexico",     region: "Southwest",   population: "564K",  industries: ["government", "healthcare", "tech", "education", "tourism"] },
  { slug: "tucson-az",         city: "Tucson",          state: "AZ", stateFullName: "Arizona",        region: "Southwest",   population: "542K",  industries: ["education", "military", "healthcare", "tourism", "tech"] },
  { slug: "fresno-ca",         city: "Fresno",          state: "CA", stateFullName: "California",     region: "West",        population: "542K",  industries: ["agriculture", "healthcare", "government", "retail", "education"] },
  { slug: "sacramento-ca",     city: "Sacramento",      state: "CA", stateFullName: "California",     region: "West",        population: "524K",  industries: ["government", "healthcare", "agriculture", "tech", "real estate"] },
  { slug: "mesa-az",           city: "Mesa",            state: "AZ", stateFullName: "Arizona",        region: "Southwest",   population: "504K",  industries: ["healthcare", "education", "tech", "manufacturing", "real estate"] },
  { slug: "kansas-city-mo",    city: "Kansas City",     state: "MO", stateFullName: "Missouri",       region: "Midwest",     population: "508K",  industries: ["finance", "logistics", "agriculture", "manufacturing", "healthcare"] },
  { slug: "atlanta-ga",        city: "Atlanta",         state: "GA", stateFullName: "Georgia",        region: "Southeast",   population: "498K",  industries: ["finance", "tech", "media", "logistics", "healthcare"] },
  { slug: "omaha-ne",          city: "Omaha",           state: "NE", stateFullName: "Nebraska",       region: "Midwest",     population: "486K",  industries: ["finance", "insurance", "agriculture", "logistics", "healthcare"] },
  { slug: "colorado-springs-co", city: "Colorado Springs", state: "CO", stateFullName: "Colorado",   region: "Mountain",    population: "478K",  industries: ["military", "aerospace", "tech", "tourism", "healthcare"] },
  { slug: "raleigh-nc",        city: "Raleigh",         state: "NC", stateFullName: "North Carolina",  region: "Southeast",   population: "467K",  industries: ["tech", "biotech", "education", "government", "healthcare"] },
  { slug: "long-beach-ca",     city: "Long Beach",      state: "CA", stateFullName: "California",     region: "West",        population: "466K",  industries: ["shipping", "healthcare", "aerospace", "manufacturing", "tech"] },
  { slug: "virginia-beach-va", city: "Virginia Beach",  state: "VA", stateFullName: "Virginia",       region: "Mid-Atlantic", population: "459K", industries: ["military", "tourism", "real estate", "healthcare", "tech"] },
  { slug: "minneapolis-mn",    city: "Minneapolis",     state: "MN", stateFullName: "Minnesota",      region: "Midwest",     population: "429K",  industries: ["finance", "healthcare", "tech", "retail", "food & beverage"] },
  { slug: "tampa-fl",          city: "Tampa",           state: "FL", stateFullName: "Florida",        region: "South",       population: "399K",  industries: ["finance", "healthcare", "tourism", "tech", "real estate"] },
  { slug: "new-orleans-la",    city: "New Orleans",     state: "LA", stateFullName: "Louisiana",      region: "South",       population: "383K",  industries: ["tourism", "oil & gas", "healthcare", "shipping", "entertainment"] },
  { slug: "cleveland-oh",      city: "Cleveland",       state: "OH", stateFullName: "Ohio",           region: "Midwest",     population: "372K",  industries: ["healthcare", "manufacturing", "finance", "education", "logistics"] },
  { slug: "honolulu-hi",       city: "Honolulu",        state: "HI", stateFullName: "Hawaii",         region: "Pacific",     population: "350K",  industries: ["tourism", "military", "agriculture", "government", "real estate"] },
  { slug: "miami-fl",          city: "Miami",           state: "FL", stateFullName: "Florida",        region: "South",       population: "442K",  industries: ["finance", "tourism", "real estate", "healthcare", "international trade"] },
  { slug: "boston-ma",         city: "Boston",          state: "MA", stateFullName: "Massachusetts",  region: "Northeast",   population: "675K",  industries: ["biotech", "education", "finance", "healthcare", "tech"] },
  { slug: "detroit-mi",        city: "Detroit",         state: "MI", stateFullName: "Michigan",       region: "Midwest",     population: "639K",  industries: ["automotive", "manufacturing", "healthcare", "tech", "finance"] },
  { slug: "pittsburgh-pa",     city: "Pittsburgh",      state: "PA", stateFullName: "Pennsylvania",   region: "Northeast",   population: "302K",  industries: ["healthcare", "education", "tech", "finance", "manufacturing"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getServiceBySlug(slug: string): SeoService | undefined {
  return SEO_SERVICES.find((s) => s.slug === slug);
}

export function getLocationBySlug(slug: string): SeoLocation | undefined {
  return SEO_LOCATIONS.find((l) => l.slug === slug);
}

export function buildServiceLocationTitle(service: SeoService, location: SeoLocation): string {
  return `${service.name} in ${location.city}, ${location.state} — HotBot Studios`;
}

export function buildServiceLocationDescription(service: SeoService, location: SeoLocation): string {
  return `HotBot Studios delivers expert ${service.name.toLowerCase()} for businesses in ${location.city}, ${location.stateFullName}. ${service.description} Serving ${location.city}'s ${location.industries.slice(0, 2).join(" and ")} sectors. Free consultation.`;
}

export function buildLocationTitle(location: SeoLocation): string {
  return `Digital Marketing & Tech Agency in ${location.city}, ${location.state} — HotBot Studios`;
}

export function buildLocationDescription(location: SeoLocation): string {
  return `HotBot Studios serves ${location.city}, ${location.stateFullName} businesses with SEO, AI automation, software development, digital marketing, and content strategy. Trusted by ${location.region} companies. Free strategy call.`;
}

/** All URL paths generated by the programmatic SEO system */
export function getAllProgrammaticPaths(): string[] {
  const paths: string[] = [];
  for (const loc of SEO_LOCATIONS) {
    paths.push(`/locations/${loc.slug}`);
    for (const svc of SEO_SERVICES) {
      paths.push(`/services/${svc.slug}/${loc.slug}`);
    }
  }
  return paths;
}
