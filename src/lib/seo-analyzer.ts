/**
 * HotBot Studios - Rule-based SEO / AEO / GEO / Local SEO analyzer
 * Zero API calls. Pure JS logic based on Google Search Essentials,
 * Google's AI Overviews guidelines, GEO research (Aggarwal et al. 2023),
 * and answer engine optimization best practices.
 */

import type { SeoCheck, SeoCheckStatus, SeoAnalysis } from "@/types/blog";

// ─── helpers ────────────────────────────────────────────────────────────────

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function check(
  id: string,
  label: string,
  status: SeoCheckStatus,
  message: string,
): SeoCheck {
  return { id, label, status, message };
}

function scoreChecks(checks: SeoCheck[]): { score: number; grade: "good" | "ok" | "poor" } {
  if (!checks.length) return { score: 0, grade: "poor" };
  const pts = checks.reduce((a, c) => a + (c.status === "good" ? 2 : c.status === "improvement" ? 1 : 0), 0);
  const score = Math.round((pts / (checks.length * 2)) * 100);
  return { score, grade: score >= 70 ? "good" : score >= 40 ? "ok" : "poor" };
}

// ─── SEO (Traditional / Google) ─────────────────────────────────────────────

export function analyzeSeo(p: AnalyzerInput): SeoCheck[] {
  const kw = p.focusKeyword.toLowerCase().trim();
  const plain = stripHtml(p.content).toLowerCase();
  const words = wordCount(stripHtml(p.content));
  const checks: SeoCheck[] = [];

  // Focus keyword in title
  if (kw) {
    const inTitle = p.title.toLowerCase().includes(kw);
    checks.push(check("seo-kw-title", "Keyword in title",
      inTitle ? "good" : "error",
      inTitle ? "Focus keyword appears in the post title." : "Add your focus keyword to the post title."));

    const inSlug = p.slug.includes(kw.replace(/\s+/g, "-"));
    checks.push(check("seo-kw-slug", "Keyword in URL slug",
      inSlug ? "good" : "improvement",
      inSlug ? "Focus keyword found in the URL." : "Include your focus keyword in the slug."));

    const inMeta = p.metaDescription.toLowerCase().includes(kw);
    checks.push(check("seo-kw-meta", "Keyword in meta description",
      inMeta ? "good" : "improvement",
      inMeta ? "Focus keyword in meta description." : "Include focus keyword in meta description."));

    const introPlain = plain.split(/\s+/).slice(0, 100).join(" ");
    const inIntro = introPlain.includes(kw);
    checks.push(check("seo-kw-intro", "Keyword in introduction",
      inIntro ? "good" : "improvement",
      inIntro ? "Keyword appears within the first 100 words - strong on-page relevance signal." : "Use focus keyword within the first 100 words to establish topical relevance immediately."));

    const count = (plain.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    const density = words > 0 ? (count / words) * 100 : 0;
    checks.push(check("seo-density", "Keyword density",
      density >= 0.8 && density <= 2.0 ? "good" : density === 0 ? "error" : "improvement",
      density === 0 ? "Keyword not found in content - add it naturally throughout."
        : density < 0.8 ? `${density.toFixed(1)}% density - too sparse. Aim for 0.8–2.0% for natural prominence.`
        : density > 2.0 ? `${density.toFixed(1)}% - risks over-optimisation. Reduce to the 0.8–2.0% range.`
        : `${density.toFixed(1)}% keyword density - well-balanced and natural.`));
  }

  // Meta title
  const mtLen = p.metaTitle.length;
  checks.push(check("seo-meta-title", "Meta title length",
    mtLen === 0 ? "error" : mtLen >= 55 && mtLen <= 60 ? "good" : mtLen >= 45 && mtLen <= 65 ? "improvement" : "error",
    mtLen === 0 ? "Meta title is empty - required for search visibility."
      : mtLen < 55 ? `${mtLen} chars - too short. Aim for 55–60 for maximum SERP real estate.`
      : mtLen > 60 ? `${mtLen} chars - will truncate in search results. Keep under 60.`
      : `${mtLen} chars - in the 55–60 sweet spot.`));

  // Meta description
  const mdLen = p.metaDescription.length;
  checks.push(check("seo-meta-desc", "Meta description length",
    mdLen === 0 ? "error" : mdLen >= 130 && mdLen <= 155 ? "good" : mdLen >= 110 && mdLen <= 165 ? "improvement" : "error",
    mdLen === 0 ? "Meta description is empty - directly hurts organic CTR."
      : mdLen < 130 ? `${mdLen} chars - too short. Aim for 130–155 to fill the snippet.`
      : mdLen > 155 ? `${mdLen} chars - likely to truncate. Trim to under 155.`
      : `${mdLen} chars - within the 130–155 optimal range.`));

  // Content length
  checks.push(check("seo-length", "Content length",
    words >= 800 ? "good" : words >= 300 ? "improvement" : "error",
    words >= 800 ? `${words} words - strong for ranking.`
      : words >= 300 ? `${words} words - minimum met, 800+ is better.`
      : `${words} words - too short. Write at least 300 words.`));

  // H2/H3 subheadings
  const h2Count = (p.content.match(/<h2/gi) || []).length;
  const h3Count = (p.content.match(/<h3/gi) || []).length;
  checks.push(check("seo-headings", "H2/H3 subheadings",
    h2Count >= 2 ? "good" : h2Count === 1 ? "improvement" : "error",
    h2Count >= 2 ? `${h2Count} H2${h3Count > 0 ? ` + ${h3Count} H3` : ""} subheadings - well-structured document hierarchy.`
      : h2Count === 1 ? "Only 1 H2 found. Add at least 2 H2 subheadings to build clear document hierarchy."
      : "No H2 subheadings found. Add H2s to structure content and help crawlers identify key sections."));

  // Keyword in subheadings
  if (kw) {
    const h2Text = (p.content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).map(stripHtml).join(" ").toLowerCase();
    const inH2 = h2Text.includes(kw);
    checks.push(check("seo-kw-h2", "Keyword in H2 subheading",
      inH2 ? "good" : "improvement",
      inH2 ? "Focus keyword found in an H2 subheading - reinforces topical authority to crawlers."
           : "Include focus keyword in at least one H2 subheading for stronger on-page signals."));
  }

  // Links
  const hasLinks = /<a\s[^>]*href/i.test(p.content);
  checks.push(check("seo-links", "Links in content",
    hasLinks ? "good" : "improvement",
    hasLinks ? "Content contains links - good for authority." : "Add internal or external links."));

  // Image alt
  const hasAlt = !!p.featuredImageAlt.trim();
  checks.push(check("seo-img-alt", "Featured image alt text",
    hasAlt ? "good" : "improvement",
    hasAlt ? "Featured image has descriptive alt text." : "Add alt text to your featured image."));

  // Title power words (CTR signals)
  const thisYear = new Date().getFullYear();
  const powerWords = ["guide", "best", "top", "how", "why", "what", "complete", "ultimate", "proven", "free", "new", String(thisYear), String(thisYear + 1)];
  const matchedPower = powerWords.filter((w) => p.title.toLowerCase().includes(w));
  const hasPower = matchedPower.length > 0;
  checks.push(check("seo-ctr", "CTR-boosting title words",
    hasPower ? "good" : "improvement",
    hasPower ? `Title uses "${matchedPower[0]}" - power words improve click-through rate in SERPs.`
             : `Add a power word like: ${powerWords.slice(0, 5).join(", ")} to increase CTR.`));

  return checks;
}

// ─── AEO (Answer Engine Optimization) ───────────────────────────────────────
// Optimises for AI assistants: ChatGPT, Siri, Alexa, Google AI Overviews
// Sources: Google's featured snippet guidelines, HowTo/FAQ schema signals

export function analyzeAeo(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content);
  const lower = plain.toLowerCase();
  const words = wordCount(plain);
  const checks: SeoCheck[] = [];

  // Question-based headings
  const questionHeadings = /<h[23][^>]*>[^<]*(what|why|how|when|where|who|which|can|does|is|are|do)[^<]*[?]?<\/h[23]>/i.test(p.content)
    || /<h[23][^>]*>[^<]*\?<\/h[23]>/i.test(p.content);
  checks.push(check("aeo-q-headings", "Question-based headings",
    questionHeadings ? "good" : "improvement",
    questionHeadings ? "Headings contain questions - AI assistants prioritise these for featured snippets."
                     : "Add question headings (e.g. <h2>What is X?</h2>) to target featured snippets and AI answers."));

  // FAQ section
  const hasFaq = /FAQ|frequently asked questions|common questions/i.test(p.content);
  checks.push(check("aeo-faq", "FAQ section",
    hasFaq ? "good" : "improvement",
    hasFaq ? "FAQ section detected - strongly signals answer engine eligibility."
           : "Add a FAQ section to increase chances of being pulled into AI answers and People Also Ask."));

  // Concise definition (direct answer)
  const firstPara = plain.slice(0, 600);
  const shortSentences = firstPara.split(/[.!?]/).filter((s) => {
    const wc = s.trim().split(/\s+/).filter(Boolean).length;
    return wc >= 10 && wc <= 30;
  });
  const hasDirectAnswer = shortSentences.length >= 2;
  checks.push(check("aeo-direct", "Direct answer in opening",
    hasDirectAnswer ? "good" : "improvement",
    hasDirectAnswer ? "Opening contains concise, self-contained sentences - ideal for AI answer extraction."
                    : "Open with 2+ short sentences (10–30 words each) that directly answer the topic."));

  // Numbered/structured lists
  const hasOrderedList = /<ol/i.test(p.content);
  const listItemCount = (p.content.match(/<li/gi) || []).length;
  const goodLists = listItemCount >= 4;
  checks.push(check("aeo-lists", "Structured lists",
    goodLists ? "good" : listItemCount >= 2 ? "improvement" : "improvement",
    goodLists ? `${listItemCount} list items found - AI assistants extract structured lists reliably for answers.`
              : listItemCount >= 2 ? `Only ${listItemCount} list items found. Expand to 4+ items across ordered or unordered lists.`
              : "Add bullet or numbered lists (4+ items) to make content scannable and AI-extractable."));

  // How-to steps
  const hasSteps = /step \d|step-by-step|\d\.\s+[A-Z]/i.test(p.content);
  checks.push(check("aeo-steps", "Step-by-step content",
    hasSteps ? "good" : "improvement",
    hasSteps ? "Step-by-step structure detected - eligible for HowTo rich results."
             : "Include numbered steps for processes (e.g. 'Step 1: ...') to target HowTo rich results."));

  // Conversational tone
  const youCount = (lower.match(/\byou\b|\byour\b/g) || []).length;
  const goodTone = words > 0 && (youCount / words) * 100 >= 0.5;
  checks.push(check("aeo-tone", "Conversational / second-person tone",
    goodTone ? "good" : "improvement",
    goodTone ? "Good use of 'you/your' - conversational content performs better in voice and AI answers."
             : "Use more 'you/your' language. Voice assistants and AI prefer conversational content."));

  // Concise paragraph - featured snippet target (40–55 words)
  const paragraphs = p.content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const snippetCandidate = paragraphs.some((pg) => {
    const t = stripHtml(pg).trim();
    const wc = wordCount(t);
    return wc >= 40 && wc <= 55;
  });
  checks.push(check("aeo-snippet", "Featured snippet paragraph",
    snippetCandidate ? "good" : "improvement",
    snippetCandidate ? "40–55 word paragraph found - tight target for Google featured snippet extraction."
                     : "Write a standalone 40–55 word paragraph that directly answers the main query."));

  return checks;
}

// ─── GEO (Generative Engine Optimization) ───────────────────────────────────
// Optimises for ChatGPT, Perplexity, Gemini, Claude
// Based on: Aggarwal et al. (2023) "GEO: Generative Engine Optimization",
// Perplexity's content signals, ChatGPT Browse quality signals

export function analyzeGeo(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content);
  const lower = plain.toLowerCase();
  const words = wordCount(plain);
  const checks: SeoCheck[] = [];

  // Statistics and specific numbers
  const statsPattern = /\d+[\.,]?\d*\s*(%|percent|million|billion|trillion|thousand|\bk\b|x\s*(faster|more|better)|\btimes\s+(faster|more|better|larger)\b|\$[\d,]+|£[\d,]+|€[\d,]+)|\d+\s+out\s+of\s+\d+|increased?\s+by\s+\d+|reduced?\s+by\s+\d+|grew\s+by\s+\d+|\d+x\s+(improvement|increase|growth|faster|better)/i;
  const hasStats = statsPattern.test(p.content);
  checks.push(check("geo-stats", "Statistics & specific numbers",
    hasStats ? "good" : "improvement",
    hasStats ? "Quantitative data detected - data-rich content is significantly more likely to be cited by generative AI."
             : "Add specific statistics (e.g. '47% of marketers report…' or '$2.3M saved') to become a citable source for AI engines."));

  // Citations / attributions
  const hasCitation = /according to|study (shows|found|indicates|suggests)|research (shows|finds|indicates|suggests|by)|report (by|from)|source:|cited by|published by|based on (data|research|a study|findings)|\[[\d]+\]|\(\d{4}\)/i.test(lower);
  checks.push(check("geo-citations", "Citations & attributions",
    hasCitation ? "good" : "improvement",
    hasCitation ? "Attribution pattern found - attributed claims are trusted and cited more by GenAI engines."
                : "Reference third-party sources ('According to [Source]…' or 'A 2024 study found…') to signal credibility."));

  // Content depth / comprehensiveness
  checks.push(check("geo-depth", "Content comprehensiveness",
    words >= 1800 ? "good" : words >= 1000 ? "improvement" : "error",
    words >= 1800 ? `${words} words - in-depth coverage. Strong AI citation potential.`
      : words >= 1000 ? `${words} words - adequate depth, but 1,800+ words significantly increase AI citation rates.`
      : `${words} words - too thin. GenAI engines rarely cite content under 1,000 words.`));

  // Comparison / vs content
  const hasComparison = /\bvs\.?\b|versus|compared to|comparison|better than|alternative/i.test(lower);
  checks.push(check("geo-comparison", "Comparison content",
    hasComparison ? "good" : "improvement",
    hasComparison ? "Comparison content found - commonly cited in AI-generated answers."
                  : "Add comparisons ('X vs Y', 'better than') - GenAI frequently cites comparison content."));

  // Definitive / authoritative statements
  const hasDefinitive = /\bis the (best|most|top|leading|only|first|largest|fastest)\b|\bthe #1\b|\bmust(-| )have\b/i.test(lower);
  checks.push(check("geo-authority", "Authoritative statements",
    hasDefinitive ? "good" : "improvement",
    hasDefinitive ? "Contains definitive statements - AI engines quote confident, authoritative claims."
                  : "Include authoritative statements ('X is the most effective...') to be quoted by AI engines."));

  // Expert angle (first-person expertise signals)
  const hasExpert = /\bwe (have|use|built|created|helped|work|recommend|offer)\b|\bour (clients|customers|experience|approach|method)\b/i.test(lower);
  checks.push(check("geo-expert", "Expert / first-hand experience",
    hasExpert ? "good" : "improvement",
    hasExpert ? "First-hand expertise signals detected - E-E-A-T factor for AI trust."
              : "Mention your own experience/clients ('We helped 50+ businesses...') to signal E-E-A-T."));

  // Tables
  const hasTable = /<table/i.test(p.content);
  checks.push(check("geo-table", "Comparison tables",
    hasTable ? "good" : "improvement",
    hasTable ? "Table found - AI engines extract structured tabular data well."
             : "Add a comparison or data table - AI engines frequently cite and re-use tabular content."));

  // Recency signals
  const currentYear = new Date().getFullYear();
  const hasRecent = new RegExp(`${currentYear}|${currentYear - 1}`).test(p.content);
  checks.push(check("geo-recency", "Recency signals",
    hasRecent ? "good" : "improvement",
    hasRecent ? `Year ${currentYear}/${currentYear - 1} found - AI engines prefer fresh, dated content.`
              : `Add '${currentYear}' references. Generative AI engines prefer recently updated content.`));

  return checks;
}

// ─── Local SEO ───────────────────────────────────────────────────────────────
// Optimises for Google Maps, local packs, 'near me' searches, SGE local

export function analyzeLocal(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content).toLowerCase();
  const fullText = (p.content + " " + p.title + " " + p.metaDescription).toLowerCase();
  const checks: SeoCheck[] = [];

  // Location mentions - US states / major cities
  const usLocations = [
    "united states", "usa", "u.s.", " us ", "new york", "los angeles", "chicago", "houston", "phoenix",
    "philadelphia", "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville", "fort worth",
    "columbus", "charlotte", "indianapolis", "san francisco", "seattle", "denver", "nashville", "oklahoma city",
    "atlanta", "miami", "minneapolis", "boston", "las vegas", "portland", "memphis", "louisville", "baltimore",
    "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas city", "omaha", "raleigh",
    "colorado", "california", "texas", "florida", "new york", "illinois", "ohio", "georgia", "michigan",
    "virginia", "washington", "arizona", "massachusetts", "tennessee", "indiana", "maryland", "missouri",
  ];
  const hasLocation = usLocations.some((loc) => fullText.includes(loc));
  checks.push(check("local-geo-target", "Geographic target location",
    hasLocation ? "good" : "improvement",
    hasLocation ? "US location mentioned - helps search engines understand geographic relevance."
                : "Mention your target US city, state, or region in the title, content, or meta description."));

  // 'Near me' or local service area keywords
  const hasNearMe = /near me|in (my area|your area|the area)|local|nearby|serving|service area|[a-z]+ area/i.test(fullText);
  checks.push(check("local-nearme", "'Near me' / local intent keywords",
    hasNearMe ? "good" : "improvement",
    hasNearMe ? "Local intent keywords found - signals relevance for 'near me' searches."
              : "Include 'local', 'near me', or 'serving [city]' to capture local intent searches."));

  // NAP signals (Name, Address, Phone)
  const hasPhone = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\+1[\s.-]\d{3}/.test(p.content);
  const hasAddress = /\d+\s+[a-z]+\s+(street|st|avenue|ave|road|rd|blvd|boulevard|drive|dr|lane|ln)/i.test(plain);
  const napScore = [hasPhone, hasAddress].filter(Boolean).length;
  checks.push(check("local-nap", "NAP signals (Name, Address, Phone)",
    napScore >= 1 ? "good" : "improvement",
    napScore >= 1 ? "Business contact/address found - supports local NAP consistency."
                 : "Include phone number and/or address in contact-focused pages to support local SEO."));

  // Service area description
  const hasServiceArea = /we (serve|cover|operate in|work (in|across|with clients in))|serving (clients|businesses|companies) (in|across|throughout)/i.test(plain);
  checks.push(check("local-service-area", "Service area description",
    hasServiceArea ? "good" : "improvement",
    hasServiceArea ? "Service area description found - important local ranking signal."
                   : "Describe your service area explicitly ('We serve businesses in [city/region]')."));

  // Local business schema signals
  const hasLocalKeywords = /agency|studio|company|services|solutions/i.test(fullText) && hasLocation;
  checks.push(check("local-schema", "Local business context",
    hasLocalKeywords ? "good" : "improvement",
    hasLocalKeywords ? "Business + location context - aligns with local business schema signals."
                     : "Combine your business type ('agency', 'studio') with location for stronger local relevance."));

  // Reviews / testimonial mentions
  const hasReviews = /review|testimonial|rated|5[\s-]star|4[\s-]star|client said|customer said/i.test(plain);
  checks.push(check("local-reviews", "Reviews / social proof mention",
    hasReviews ? "good" : "improvement",
    hasReviews ? "Social proof/reviews mentioned - local pack ranking uses review signals."
               : "Mention reviews, ratings, or testimonials to signal local credibility."));

  // 'Best [service] in [location]' pattern
  const hasBestIn = /best\s+\w+(\s+\w+)?\s+(in|near|for)\s+[a-z]+/i.test(fullText);
  checks.push(check("local-best", "'Best [service] in [location]' pattern",
    hasBestIn ? "good" : "improvement",
    hasBestIn ? "'Best X in [location]' pattern found - high-value local intent signal."
              : "Use 'best [service] in [city]' pattern in title or H1 - top local intent search format."));

  return checks;
}

// ─── Readability Analysis ─────────────────────────────────────────────────────
// Based on Flesch-Kincaid Reading Ease, Yoast SEO readability checks,
// Grammarly style signals, and RankMath content analysis best practices.

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? Math.max(1, m.length) : 1;
}

function getSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length > 3);
}

export function analyzeReadability(p: AnalyzerInput): SeoCheck[] {
  const plain = stripHtml(p.content);
  const allWords = plain.trim().split(/\s+/).filter(Boolean);
  const wc = allWords.length;
  const sentences = getSentences(plain);
  const sentCount = Math.max(sentences.length, 1);
  const checks: SeoCheck[] = [];

  if (wc < 50) {
    checks.push(check("read-length", "Minimum content for readability", "error",
      "Write at least 50 words to enable readability analysis."));
    return checks;
  }

  // 1. Flesch-Kincaid Reading Ease
  const syllables = allWords.reduce((s, w) => s + countSyllables(w), 0);
  const avgSentLen = wc / sentCount;
  const avgSyllPerWord = syllables / wc;
  const fre = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgSentLen - 84.6 * avgSyllPerWord)));
  checks.push(check("read-fre", "Flesch-Kincaid Reading Ease",
    fre >= 60 ? "good" : fre >= 40 ? "improvement" : "error",
    fre >= 80 ? `Score ${fre}/100 - Easy to read. Great for web audiences.`
      : fre >= 60 ? `Score ${fre}/100 - Standard readability. Suitable for most readers.`
      : fre >= 40 ? `Score ${fre}/100 - Fairly difficult. Shorten sentences and simplify vocabulary.`
      : `Score ${fre}/100 - Very difficult. Use shorter sentences and everyday words.`));

  // 2. Average sentence length
  checks.push(check("read-sentence-len", "Average sentence length",
    avgSentLen <= 20 ? "good" : avgSentLen <= 25 ? "improvement" : "error",
    avgSentLen <= 20 ? `${avgSentLen.toFixed(1)} words/sentence - ideal (≤20).`
      : avgSentLen <= 25 ? `${avgSentLen.toFixed(1)} words/sentence - slightly long. Aim for ≤20 words per sentence.`
      : `${avgSentLen.toFixed(1)} words/sentence - too long. Split long sentences in two.`));

  // 3. Passive voice (sentence-level detection to reduce false positives)
  const passiveSentences = sentences.filter((s) =>
    /\b(is|are|was|were|been|being)\s+(being\s+)?\w+ed\b|\b(is|are|was|were)\s+\w+en\b/i.test(s)
  ).length;
  const passivePct = (passiveSentences / sentCount) * 100;
  checks.push(check("read-passive", "Passive voice usage",
    passivePct <= 10 ? "good" : passivePct <= 18 ? "improvement" : "error",
    passivePct <= 10 ? "Passive voice well-controlled - active voice keeps copy direct and persuasive."
      : passivePct <= 18 ? `${passivePct.toFixed(0)}% passive sentences - trim further. Active voice reads faster.`
      : `${passivePct.toFixed(0)}% passive voice - too high. Rewrite as active ('We built X' not 'X was built').`));

  // 4. Transition words (Yoast-style)
  const transitions = [
    "first", "second", "third", "finally", "additionally", "furthermore", "moreover",
    "however", "therefore", "consequently", "in addition", "in contrast", "on the other hand",
    "as a result", "for example", "for instance", "in conclusion", "in summary",
    "meanwhile", "nevertheless", "nonetheless", "otherwise", "similarly", "subsequently",
    "thus", "yet", "also", "besides", "hence", "indeed", "instead", "likewise",
    "next", "then", "above all", "after all", "as well", "in fact", "in other words",
    "to illustrate", "to summarize", "to conclude", "by contrast", "on the contrary",
    "as a consequence", "at the same time", "despite this", "even so", "in particular",
    "more importantly", "on balance", "put differently", "specifically", "that said",
    "to begin with", "what is more", "with that in mind",
  ];
  const withTransitions = sentences.filter((s) => {
    const sl = s.toLowerCase();
    return transitions.some((t) => sl.includes(t));
  }).length;
  const transitionPct = (withTransitions / sentCount) * 100;
  checks.push(check("read-transitions", "Transition words",
    transitionPct >= 25 ? "good" : transitionPct >= 12 ? "improvement" : "error",
    transitionPct >= 25 ? `${transitionPct.toFixed(0)}% of sentences use transitions - strong logical flow and scannability.`
      : transitionPct >= 12 ? `${transitionPct.toFixed(0)}% transition usage - add connectors like 'Furthermore', 'However', 'As a result'.`
      : `${transitionPct.toFixed(0)}% - critically low. Transition words are essential to guide readers.`));

  // 5. Paragraph length - split content into <p> blocks
  const paraBlocks = p.content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const longParas = paraBlocks.filter((pg) => wordCount(stripHtml(pg)) > 120).length;
  checks.push(check("read-paragraphs", "Paragraph length",
    longParas === 0 ? "good" : longParas === 1 ? "improvement" : "error",
    longParas === 0 ? "All paragraphs are a good length (≤120 words). Easy to scan on mobile."
      : longParas === 1 ? "1 paragraph exceeds 120 words. Break it into smaller chunks."
      : `${longParas} paragraphs exceed 120 words. Long text blocks reduce mobile readability.`));

  // 6. Subheading distribution - no section should exceed 300 words
  const contentSections = p.content.split(/<h[2-3][^>]*>[\s\S]*?<\/h[2-3]>/i);
  const longSections = contentSections.filter((s) => wordCount(stripHtml(s)) > 300).length;
  checks.push(check("read-subheadings", "Subheading distribution",
    longSections === 0 ? "good" : longSections === 1 ? "improvement" : "error",
    longSections === 0 ? "Good subheading rhythm - readers can scan sections easily."
      : longSections === 1 ? "One section runs over 300 words without a subheading. Add an H2 to break it up."
      : `${longSections} sections exceed 300 words without a subheading. Add H2/H3 every ~300 words.`));

  // 7. Consecutive sentences starting with the same word
  const starts = sentences.map((s) => s.trim().split(/\s+/)[0]?.toLowerCase() ?? "");
  let maxConsec = 0;
  let cur = 0;
  for (let i = 1; i < starts.length; i++) {
    if (starts[i] === starts[i - 1] && starts[i].length > 2) { cur++; maxConsec = Math.max(maxConsec, cur); }
    else cur = 0;
  }
  checks.push(check("read-variety", "Sentence variety",
    maxConsec === 0 ? "good" : maxConsec === 1 ? "improvement" : "error",
    maxConsec === 0 ? "Good sentence variety - openings are well-varied."
      : maxConsec === 1 ? "A couple of sentences start identically. Vary your sentence openings."
      : `${maxConsec + 1} consecutive sentences start with the same word. Vary sentence structure.`));

  // 8. Word complexity (avg syllables/word - proxy for vocabulary difficulty)
  checks.push(check("read-complexity", "Vocabulary complexity",
    avgSyllPerWord <= 1.6 ? "good" : avgSyllPerWord <= 2.0 ? "improvement" : "error",
    avgSyllPerWord <= 1.6 ? `Avg ${avgSyllPerWord.toFixed(2)} syllables/word - accessible vocabulary.`
      : avgSyllPerWord <= 2.0 ? `Avg ${avgSyllPerWord.toFixed(2)} syllables/word - moderately complex. Use simpler words where possible.`
      : `Avg ${avgSyllPerWord.toFixed(2)} syllables/word - complex. Swap jargon for everyday language.`));

  return checks;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface AnalyzerInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  featuredImageAlt: string;
}

export type AnalysisTab = "seo" | "aeo" | "geo" | "local" | "readability";

export interface FullAnalysis {
  overall: { score: number; grade: "good" | "ok" | "poor" };
  seo: SeoAnalysis;
  aeo: SeoAnalysis;
  geo: SeoAnalysis;
  local: SeoAnalysis;
  readability: SeoAnalysis;
}

export function analyzeAll(input: AnalyzerInput): FullAnalysis {
  const seoChecks = analyzeSeo(input);
  const aeoChecks = analyzeAeo(input);
  const geoChecks = analyzeGeo(input);
  const localChecks = analyzeLocal(input);
  const readabilityChecks = analyzeReadability(input);

  const allChecks = [...seoChecks, ...aeoChecks, ...geoChecks, ...localChecks, ...readabilityChecks];
  const { score: overallScore, grade: overallGrade } = scoreChecks(allChecks);

  function toAnalysis(checks: SeoCheck[]): SeoAnalysis {
    const { score, grade } = scoreChecks(checks);
    return { score, grade, checks };
  }

  return {
    overall: { score: overallScore, grade: overallGrade },
    seo: toAnalysis(seoChecks),
    aeo: toAnalysis(aeoChecks),
    geo: toAnalysis(geoChecks),
    local: toAnalysis(localChecks),
    readability: toAnalysis(readabilityChecks),
  };
}
