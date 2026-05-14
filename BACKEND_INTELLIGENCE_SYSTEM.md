# HotBot Studios — Backend Intelligence System Documentation

> **Scope**: Core logic, algorithms, scoring systems, and real-time analysis engine powering the blog platform's SEO, GEO, AEO, Local SEO, and Readability analysis.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [SEO Analysis Engine](#2-seo-analysis-engine)
3. [AEO — Answer Engine Optimization](#3-aeo--answer-engine-optimization)
4. [GEO — Generative Engine Optimization](#4-geo--generative-engine-optimization)
5. [Local SEO Analysis](#5-local-seo-analysis)
6. [Readability Analysis](#6-readability-analysis)
7. [Content Intelligence Engine (Composite Scoring)](#7-content-intelligence-engine-composite-scoring)
8. [Real-Time Analysis API](#8-real-time-analysis-api)
9. [Blog Persistence Layer](#9-blog-persistence-layer)
10. [Authentication & RBAC](#10-authentication--rbac)
11. [N8N Integrations & AI Chat](#11-n8n-integrations--ai-chat)
12. [Image Optimization Pipeline](#12-image-optimization-pipeline)
13. [Dashboard Overview API](#13-dashboard-overview-api)
14. [Full Thresholds & Values Reference](#14-full-thresholds--values-reference)

---

## 1. Architecture Overview

**Stack**: Next.js 14.2.5 · TypeScript · Vercel · GitHub-backed persistence

### Core Design Principles

| Principle | Implementation |
|-----------|---------------|
| Zero external API calls | All analysis is deterministic, rule-based JavaScript |
| Real-time performance | < 1 second for full 5-dimension analysis |
| Serverless compatible | GitHub-backed posts, `/tmp` hot cache, Vercel-ready |
| Fully testable | Same input always produces same score |

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                  Blog Admin Dashboard                    │
│  (React, real-time analysis feedback, RBAC gating)      │
└──────────────────────────┬──────────────────────────────┘
                           │ POST /api/content/intelligence
┌──────────────────────────▼──────────────────────────────┐
│              Content Intelligence Engine                 │
│         src/lib/content-intelligence.ts                  │
│                                                          │
│  ┌──────────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌─────────┐ │
│  │  SEO     │ │ AEO  │ │ GEO  │ │ Local │ │Readabil.│ │
│  │  30%     │ │ 20%  │ │ 25%  │ │  5%   │ │  20%    │ │
│  └──────────┘ └──────┘ └──────┘ └───────┘ └─────────┘ │
│                src/lib/seo-analyzer.ts                   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Blog Persistence Layer                      │
│  Tier 1: /tmp/hotbot-data/posts.json (hot)              │
│  Tier 2: GitHub API (cold start)                        │
│  Tier 3: public/data/posts.json (build-time seed)       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. SEO Analysis Engine

**File**: `src/lib/seo-analyzer.ts` — `analyzeSeo()`

### Scoring Model

Every check produces one of three status values:

```
"good"        → 2 points   (fully meets criteria)
"improvement" → 1 point    (partially meets criteria)
"error"       → 0 points   (fails criteria)

Score = (total_points / (num_checks × 2)) × 100
Grade = score >= 70 → "good" | score >= 40 → "ok" | < 40 → "poor"
```

### The 14 SEO Checks

| Check ID | What It Tests | Good | Improvement | Error |
|----------|---------------|------|-------------|-------|
| `seo-kw-title` | Focus keyword in post title | Present | — | Missing |
| `seo-kw-slug` | Focus keyword in URL slug | Included | — | Missing |
| `seo-kw-meta` | Focus keyword in meta description | Included | — | Missing |
| `seo-kw-intro` | Focus keyword in first 300 chars of content | Present | — | Missing |
| `seo-density` | Keyword frequency in body text | 0.5% – 2.5% | < 0.5% or > 2.5% | 0% |
| `seo-meta-title` | Meta/SEO title character length | 50–60 chars | < 50 or > 60 | Empty |
| `seo-meta-desc` | Meta description character length | 120–160 chars | < 120 or > 160 | Empty |
| `seo-length` | Content word count | ≥ 800 words | 300–799 words | < 300 words |
| `seo-headings` | H2 or H3 subheadings present | Present | — | Missing |
| `seo-links` | Internal or external hyperlinks | Present | — | Missing |
| `seo-img-alt` | Featured image alt text filled | Present | Missing | — |
| `seo-ctr` | CTR power words in title | Yes | — | No |
| `seo-kw-density-ok` | Density within optimal band | Pass | — | Over/under |
| `seo-structure` | Has both headings and links | Both present | One present | Neither |

### CTR Power Words Array

These words in the title signal high click-through potential:

```javascript
["guide", "best", "top", "how", "why", "what", "complete", "ultimate",
 "proven", "free", "new", "2025", "2026"]
```

### Keyword Density Calculation

```
keyword_occurrences = count of focus keyword in stripped plain text
total_words         = total word count of plain text
density %           = (keyword_occurrences / total_words) × 100

Optimal range: 0.5% – 2.5%
```

---

## 3. AEO — Answer Engine Optimization

**Function**: `analyzeAeo()` in `src/lib/seo-analyzer.ts`

**Target surfaces**: ChatGPT, Siri, Alexa, Google AI Overviews, Featured Snippets

### The 8 AEO Checks

| Check ID | What It Tests | Detection Method |
|----------|---------------|-----------------|
| `aeo-q-headings` | Question-style H2/H3 headings | Regex: `/<h[23].*?(what\|why\|how\|when\|where\|who\|which\|can\|does\|is\|are\|do).*?\?/i` |
| `aeo-faq` | FAQ section present | String match: "FAQ", "frequently asked questions", "common questions" |
| `aeo-direct` | Direct answer in opening paragraph | 2+ sentences of 20–25 words within first 500 chars |
| `aeo-lists` | Structured ordered/unordered lists | 3+ `<li>` tags present |
| `aeo-steps` | Step-by-step instructional format | Matches "step 1", "step-by-step", or pattern `\d\. [A-Z]` |
| `aeo-tone` | Conversational second-person voice | Count of "you"/"your" ÷ total words ≥ 0.5% |
| `aeo-snippet` | Featured snippet candidate paragraph | 40–60 word paragraph present (ideal AI extraction target) |
| `aeo-conversion` | Covers "who/what/where/when/why/how" | At least 2 of the 6 question words present in body |

### Why These Checks Matter

Answer engines extract the most concise, direct, structured answer. The checks above map to what these engines actually retrieve:

- **Question headings** → Used as the question label in AI answers
- **Direct opening** → First extracted passage for "what is X" queries
- **Lists** → Rendered verbatim in voice/AI responses
- **40–60 word paragraphs** → Google's featured snippet sweet spot
- **Conversational tone** → Signals content written for humans, not bots

---

## 4. GEO — Generative Engine Optimization

**Function**: `analyzeGeo()` in `src/lib/seo-analyzer.ts`

**Target engines**: ChatGPT, Perplexity, Gemini, Claude

Based on research from Aggarwal et al. (2023) — *"GEO: Generative Engine Optimization"* — which found that structured, attributed, comprehensive content gets cited by AI engines up to **3× more frequently**.

### The 8 GEO Checks

| Check ID | What It Tests | Detection Pattern | Signal |
|----------|---------------|-------------------|--------|
| `geo-stats` | Statistics and quantitative data | `/\d+[\.,]?\d*\s*(%\|percent\|million\|billion\|trillion\|x\s*faster\|times\|\$)/i` | Citable, verifiable claims |
| `geo-citations` | Source attributions | "according to", "study shows", "research finds", `[[\d+]]` | Establishes trust/authority |
| `geo-depth` | Content comprehensiveness | Word count | ≥ 1500 good, 800–1499 improvement, < 800 error |
| `geo-comparison` | Comparative content | "vs.", "versus", "compared to", "better than", "alternative" | Triggers citation in comparison queries |
| `geo-authority` | Authoritative positioning | "is the best/most/top/leading/only/first", "#1", "must-have" | Quoted when AI answers ranking queries |
| `geo-expert` | First-hand experience (E-E-A-T) | "we have/use/built/created/helped", "our clients/customers" | Experience signals = higher citation rate |
| `geo-table` | Comparison tables | `/<table/i` | AI engines extract structured tables directly |
| `geo-recency` | Year references (freshness) | Current year or current year − 1 present in content | AI engines prefer recent, dated content |

### GEO vs SEO Depth Threshold

Note that GEO requires **1500+ words** (vs SEO's 800+) because generative engines prioritize comprehensive resources over thin content.

---

## 5. Local SEO Analysis

**Function**: `analyzeLocalSeo()` in `src/lib/seo-analyzer.ts`

**Target**: Google Maps, Local Pack, "near me" searches, business directory listings

### The 8 Local SEO Checks

| Check ID | What It Tests | Detection | Signal |
|----------|---------------|-----------|--------|
| `local-geo-target` | Geographic mention in title, meta, or content | US city/state from location database below | Geo-targeted content |
| `local-nearme` | Local search intent keywords | "near me", "local", "nearby", "serving", "service area" | Near-me query relevance |
| `local-nap` | Name-Address-Phone signals | Phone regex: `/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/`; Address: street types (St, Ave, Blvd, etc.) | NAP consistency |
| `local-service-area` | Service area declaration | "we serve", "serving", "operating in", "work across" | Service area radius signals |
| `local-schema` | Business context (schema eligibility) | Business type keyword + location combined | LocalBusiness schema candidate |
| `local-reviews` | Social proof mentions | "review", "testimonial", "rated", "4-star", "5-star", "client said" | Review signals for local pack |
| `local-best` | "Best [X] in [Location]" pattern | Regex: `best\s+\w+\s+(in|near|for)\s+\w+` | Strong local intent match |
| `local-content-local` | Content relevance to local audience | ≥ 2 local signals in body text | Topical local authority |

### US Location Database

The engine recognizes all major US cities and states for geo-targeting detection:

```javascript
// Sample from the full database (~70 entries):
["united states", "usa", "u.s.", "new york", "los angeles", "chicago",
 "houston", "phoenix", "philadelphia", "san antonio", "san diego",
 "dallas", "san jose", "austin", "jacksonville", "fort worth",
 "columbus", "charlotte", "indianapolis", "san francisco", "seattle",
 "denver", "nashville", "atlanta", "miami", "boston", "las vegas",
 "portland", "memphis", "louisville", "baltimore", "raleigh",
 // + all 50 US state names
]
```

---

## 6. Readability Analysis

**Function**: `analyzeReadability()` in `src/lib/seo-analyzer.ts`

Uses **Flesch-Kincaid Reading Ease** combined with Yoast-style structural heuristics.

### Flesch-Kincaid Reading Ease Formula

```
FRE = 206.835 − (1.015 × avg_words_per_sentence) − (84.6 × avg_syllables_per_word)
```

| FRE Score | Difficulty | Audience |
|-----------|------------|---------|
| ≥ 80 | Easy | Children / general public |
| 60–79 | Standard | Most adult readers |
| 40–59 | Fairly Difficult | University-educated |
| < 40 | Very Difficult | College graduate+ |

### The 8 Readability Checks

| Check ID | What It Tests | Good | Improvement | Error |
|----------|---------------|------|-------------|-------|
| `read-fre` | Flesch-Kincaid Reading Ease score | ≥ 60 | 40–59 | < 40 |
| `read-sentence-len` | Average words per sentence | ≤ 20 words | 20–25 words | > 25 words |
| `read-passive` | Passive voice percentage | ≤ 10% | 10–20% | > 20% |
| `read-transitions` | Transition word density | ≥ 30% of sentences | 15–29% | < 15% |
| `read-paragraphs` | Paragraph word length | All ≤ 120 words | 1 paragraph exceeds | 2+ exceed |
| `read-subheadings` | Section length between headings | No section > 300 words | 1 section exceeds | 2+ exceed |
| `read-variety` | Sentence start variation | No 2 consecutive same start | 2 consecutive same | 3+ consecutive same |
| `read-complexity` | Average syllables per word | ≤ 1.6 | 1.6–2.0 | > 2.0 |

### Syllable Counting Algorithm

```javascript
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;               // short words = 1 syllable
  word = word.replace(/es$|ed$/, '');           // remove common endings
  word = word.replace(/e$/, '');                // remove silent e
  const matches = word.match(/[aeiouy]{1,2}/g); // count vowel groups
  return Math.max(1, matches ? matches.length : 1);
}
```

### Transition Words (26 recognized)

```javascript
["first", "second", "third", "finally", "additionally", "furthermore",
 "moreover", "however", "therefore", "consequently", "in addition",
 "in contrast", "on the other hand", "as a result", "for example",
 "for instance", "in conclusion", "in summary", "meanwhile",
 "nevertheless", "nonetheless", "otherwise", "similarly",
 "subsequently", "thus", "yet", "also"]
```

**Transition density** = sentences containing ≥ 1 transition word ÷ total sentences × 100

### Passive Voice Detection

```javascript
// Matches: "was/were/is/are/been + past participle"
const passivePattern = /\b(was|were|is|are|been|be)\s+\w+ed\b/gi;
passive_rate = (passive_sentence_count / total_sentences) × 100
```

---

## 7. Content Intelligence Engine (Composite Scoring)

**File**: `src/lib/content-intelligence.ts`

This is the **brain** of the system. It combines all 5 analysis dimensions into a single composite score and generates actionable recommendations.

### Composite Score Formula

```
Total Score = (SEO × 0.30) + (GEO × 0.25) + (AEO × 0.20)
            + (Readability × 0.20) + (LocalSEO × 0.05)
```

### Weight Rationale

| Dimension | Weight | Reason |
|-----------|--------|--------|
| SEO | 30% | Traditional search ranking — highest volume channel |
| GEO | 25% | AI engine citations growing rapidly; strategic future weighting |
| AEO | 20% | Answer engines + featured snippets drive zero-click visibility |
| Readability | 20% | User experience, engagement, dwell time, bounce rate |
| Local SEO | 5% | Niche-specific; not all posts require local targeting |

### Quality Assessment Templates

| Score Range | Tone | Template Style |
|-------------|------|----------------|
| ≥ 75 | Positive | "well-optimised", celebrates strengths |
| 50–74 | Constructive | "solid foundation with clear opportunities" |
| 30–49 | Urgent | "meaningful improvements needed" |
| < 30 | Critical | "significant structural work required" |

### Output Result Structure

```typescript
interface ContentIntelligenceResult {
  total_score: number;                          // 0–100 composite
  quality_assessment: string;                   // Generated narrative text
  strengths: string[];                          // Top 5 passing checks (human labels)
  weaknesses: string[];                         // Top 5 failing checks (errors first, then improvements)
  content_improvement_suggestions: string[];    // Actionable writing tips
  context_expansion_suggestions: string[];      // GEO + AEO gap recommendations
  authority_boost_recommendations: string[];    // E-E-A-T signal suggestions
  structure_upgrade_suggestions: string[];      // Readability & formatting fixes
}
```

### Strength / Weakness Prioritization

**Strengths**: Top 5 checks with status `"good"` across all dimensions, in this priority order:
```
seo-kw-title, seo-kw-intro, seo-length, seo-headings, seo-ctr, seo-links,
aeo-q-headings, aeo-faq, aeo-lists, aeo-direct, aeo-snippet,
geo-stats, geo-citations, geo-depth, geo-expert, geo-table, geo-comparison,
geo-authority, geo-recency, read-fre, read-passive, read-transitions, read-variety
```

**Weaknesses**: Top 5 checks with status `"error"` (collected first), then `"improvement"`.

---

## 8. Real-Time Analysis API

**Route**: `POST /api/content/intelligence`

### Authentication

Requires a valid session token. Accepted by any authenticated role:
- admin, manager, editor, contributor, agent

### Request Schema

```typescript
interface AnalyzerInput {
  title: string;              // max 300 chars
  slug: string;               // max 200 chars
  content: string;            // max 60,000 chars — raw HTML
  excerpt: string;            // max 600 chars
  metaTitle: string;          // max 120 chars
  metaDescription: string;    // max 320 chars
  focusKeyword: string;       // max 120 chars
  featuredImageAlt: string;   // max 250 chars
}
```

### Processing Pipeline

```
1. Auth check      → 401 if no valid session token
2. Input parsing   → Parse JSON body
3. Sanitization    → Truncate each field to declared max length
4. analyzeAll()    → Run SEO + AEO + GEO + LocalSEO + Readability
5. computeLocal()  → Compute composite score + suggestions
6. JSON response   → Return full ContentIntelligenceResult
```

### Performance

- **Zero external API calls** — fully local computation
- **Typical response time**: < 100ms for most posts
- **60,000 char limit** ensures worst-case < 500ms

---

## 9. Blog Persistence Layer

**File**: `src/lib/postsStore.ts`

### Multi-Tier Read Strategy (Vercel-compatible)

```
Read Request
     │
     ▼
Tier 1: /tmp/hotbot-data/posts.json  ──▶ HIT → return immediately
     │ MISS
     ▼
Tier 2: GitHub API (fetch latest committed posts.json)
     │ MISS / error
     ▼
Tier 3: public/data/posts.json (build-time seed, always exists)
```

### Write Flow

```
1. Write to /tmp/hotbot-data/posts.json  (instant, same Lambda instance reads it)
2. Fire-and-forget: commit to GitHub     (background, triggers Vercel redeploy,
                                          bakes updated data into next build bundle)
```

### BlogPost Schema

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;           // HTML
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;       // ISO 8601
  updatedAt: string;         // ISO 8601
  status: "published" | "draft";
  readTime: number;          // minutes
  featuredImage: string;
  featuredImageAlt: string;
  adTopic: BlogAdTopic;      // seo | ppc | email | content | ai-automation | ...
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  seoScore: number;          // 0–100 composite score saved at publish time
}
```

---

## 10. Authentication & RBAC

**File**: `src/lib/sessions.ts`

### Session Token

| Property | Value |
|----------|-------|
| Format | 80-character hexadecimal string |
| Generation | 40 random bytes via `crypto.randomBytes(40)` |
| TTL | 30 days |
| Storage | `data/sessions.json` (auto-pruned on every read) |

### Auth Resolution Order (Priority)

```
1. Authorization header:  "Bearer <token>"
2. Cookie:               "backdrop_auth" (HttpOnly, Secure, 30-day maxage)
3. Query parameter:      "?secret=<token>"  (legacy, N8N webhook compatibility)
```

### Rate Limiting (Login)

- **Limit**: 10 attempts per 60 seconds per IP
- **Exceeded**: `429 Too Many Requests`

### Role Capabilities Matrix

| Role | Blog Create | Blog Publish | Blog Delete | CRM Data | User Mgmt | Chat Logs |
|------|-------------|--------------|-------------|----------|-----------|-----------|
| `admin` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `manager` | — | — | — | Read-only | Read-only | — |
| `editor` | ✓ | ✓ | ✓ | — | — | — |
| `contributor` | ✓ (drafts) | — | — | — | — | — |
| `agent` | — | — | — | — | — | Read-only |

### Password Hashing

- Algorithm: bcrypt, cost factor 12
- Admin credentials stored as env vars: `BLOG_ADMIN_USERNAME`, `BLOG_ADMIN_PASSWORD_HASH`

---

## 11. N8N Integrations & AI Chat

### Public Webhook Routes

| Route | Purpose | Key Validation |
|-------|---------|---------------|
| `POST /api/n8n/form` | Lead capture (strategy call / get started) | reCAPTCHA v3 |
| `POST /api/n8n/contact` | Contact form submissions | reCAPTCHA v3 |
| `POST /api/n8n/newsletter` | Newsletter signup (deduplicates by email) | Email format |
| `POST /api/n8n/callback` | Phone callback requests | Phone format |
| `POST /api/n8n/chat` | AI chatbot (Claude Haiku) | Rate limit per session |

### AI Chat Configuration (Anthropic Claude)

```typescript
model:       "claude-haiku-4-5-20251001"
max_tokens:  300
system:      HotBot Studios services prompt — warm, action-oriented tone
history:     Last 10 messages maintained per session
storage:     Saved to /tmp/hotbot-data/chats.json with full timestamp
```

### Data Persistence (Vercel `/tmp`)

All form submissions written to:
```
/tmp/hotbot-data/leads.json
/tmp/hotbot-data/contacts.json
/tmp/hotbot-data/newsletter.json
/tmp/hotbot-data/callbacks.json
/tmp/hotbot-data/chats.json
```

> Note: `/tmp` is ephemeral per Lambda instance. For durable CRM data, these are also forwarded to N8N workflows which handle permanent storage.

---

## 12. Image Optimization Pipeline

**Route**: `POST /api/blog/upload-image`

### Processing Steps (Sharp)

```
1. Validate MIME type  → Accept: image/jpeg, image/png, image/webp, image/gif
2. Size check          → Reject if > 10 MB
3. Auto-rotate         → Apply EXIF orientation correction
4. Resize              → If width > 1200px, scale down (preserve aspect ratio)
5. Convert to WebP     → quality: 82, effort: 4
6. Write to disk       → public/images/blog/<timestamp>-<sanitized-name>.webp
7. Return metrics      → URL, dimensions, original size, optimized size, compression %
```

### Filename Sanitization

```javascript
filename = `${Date.now()}-${originalName.replace(/[^a-z0-9.-]/gi, '_')}.webp`
```

---

## 13. Dashboard Overview API

**Route**: `GET /api/dashboard/overview`
**Auth**: `admin` or `manager` role required

### Response Shape

```typescript
{
  leads: number;
  contacts: number;
  newsletter: number;
  callbacks: number;
  chats: number;
  posts: number;
  recentLeads: Lead[];             // last 5
  recentContacts: Contact[];       // last 5
  recentCallbacks: CallbackRequest[]; // last 5
}
```

---

## 14. Full Thresholds & Values Reference

### SEO Thresholds

| Metric | Good | Improvement | Error |
|--------|------|-------------|-------|
| Keyword density | 0.5%–2.5% | < 0.5% or > 2.5% | 0% |
| Meta title length | 50–60 chars | < 50 or > 60 | Empty |
| Meta description | 120–160 chars | < 120 or > 160 | Empty |
| Content length | ≥ 800 words | 300–799 words | < 300 words |

### GEO Thresholds

| Metric | Good | Improvement | Error |
|--------|------|-------------|-------|
| Content depth | ≥ 1500 words | 800–1499 words | < 800 words |

### Readability Thresholds

| Metric | Good | Improvement | Error |
|--------|------|-------------|-------|
| Flesch-Kincaid FRE | ≥ 60 | 40–59 | < 40 |
| Avg sentence length | ≤ 20 words | 20–25 words | > 25 words |
| Passive voice rate | ≤ 10% | 10%–20% | > 20% |
| Transition word % | ≥ 30% | 15%–29% | < 15% |
| Paragraph length | ≤ 120 words | 1 exceeds 120 | 2+ exceed |
| Section length | ≤ 300 words | 1 section > 300 | 2+ sections |
| Avg syllables/word | ≤ 1.6 | 1.6–2.0 | > 2.0 |

### AEO Thresholds

| Metric | Good | Error |
|--------|------|-------|
| Featured snippet para | 40–60 words | Outside range |
| Conversational tone | "you/your" ≥ 0.5% | < 0.5% |
| Structured lists | ≥ 3 `<li>` items | < 3 |

### Composite Score Grades

| Score | Grade |
|-------|-------|
| ≥ 70 | Good |
| 40–69 | OK |
| < 40 | Poor |

### Composite Weight Summary

```
SEO          30%
GEO          25%
AEO          20%
Readability  20%
Local SEO     5%
─────────────────
Total       100%
```

---

*Documentation generated from codebase analysis — HotBot Studios Blog Platform*
*Source files: `src/lib/seo-analyzer.ts`, `src/lib/content-intelligence.ts`, `src/lib/postsStore.ts`, `src/lib/sessions.ts`, `src/app/api/`*
