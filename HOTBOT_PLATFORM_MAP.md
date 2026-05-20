# HotBot Studios — Platform Architecture Reference Map

```
                        ┌─────────────────────────────┐
                        │      HOTBOT STUDIOS          │
                        │  AI-Native Digital Agency    │
                        │    hotbotstudios.com         │
                        └──────────────┬──────────────┘
                                       │
          ┌──────────────┬─────────────┼──────────────┬──────────────┐
          │              │             │              │              │
    ┌─────▼──────┐ ┌─────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐ ┌▼────────────┐
    │  PUBLIC    │ │  BACKDROP  │ │    API     │ │    AI       │ │  INFRA      │
    │  WEBSITE   │ │  ADMIN     │ │   LAYER    │ │  PRODUCTS   │ │  & TOOLING  │
    └─────┬──────┘ └─────┬──────┘ └───┬────────┘ └──┬──────────┘ └┬────────────┘
          │              │            │             │              │
          │              │            │             │              │
```

---

## 🌐 PUBLIC WEBSITE (100+ pages)

```
Public Website
├── Home — Hero, Stats, Testimonials, Lead Magnets, Client Logos
├── Service Hubs (7 Categories × 7 Sub-pages each = ~49 pages)
│   ├── AI Automation
│   │   ├── AI Chatbots
│   │   ├── Custom AI Agents
│   │   ├── LLM/GPT Integration
│   │   ├── n8n Workflow Automation
│   │   ├── Heka Voice AI (24/7 Receptionist)
│   │   ├── Enterprise AI Voice
│   │   └── AI Analytics
│   ├── Digital Marketing (SEO, PPC, Email, Social, CRO, Analytics)
│   ├── Content Studio (Copy, Photo, Video, Podcast, Print, Social)
│   │   └── Video Production (5 sub-types: Brand Films, Explainers, Short-form...)
│   ├── Software Development (Web, Mobile, SaaS, E-commerce, Enterprise, API)
│   ├── Public Relations (Press, Media, Digital PR, Thought Leadership, Crisis)
│   ├── UI/UX Design (Visual, Mobile, Research, Wireframes, Prototyping, A11y)
│   └── Marketing Consulting (Growth, GTM, Audit, Martech, Team, Transformation)
├── Blog — Multi-author, SEO/AEO/GEO-analyzed, published posts
├── Locations — Geo-targeted city × service landing pages
├── Products — AI product showcase
├── Public Portals
│   ├── /tickets/[id] — Public ticket tracking
│   └── /invoice/[id] — Public invoice view
└── Legal — Privacy, Terms, Refund
```

---

## 🎛️ BACKDROP ADMIN DASHBOARD (25+ dashboard pages)

```
Backdrop Admin (Role-gated)
├── Overview — KPI cards (leads, clients, revenue, tickets, tasks)
├── CRM Suite
│   ├── Leads — Pipeline (New → Contacted → Qualified → Proposal → Won/Lost/Converted)
│   │   └── Lead Detail — Convert to client, Email history, Activity timeline
│   ├── Clients — Client database with email history per client
│   ├── Contacts — Raw inbound messages + convert to lead
│   ├── Callbacks — Voice callback request log (triggers Sarvam AI)
│   └── Chats — Live chat conversation logs
├── Operations
│   ├── Invoices — Create, edit, send, PDF generation, email tracking
│   ├── Tickets — Support queue (Open → In-Progress → Resolved/Closed)
│   │   └── Comments — Public + internal notes
│   └── Tasks — Assign to team, priority, due dates, desktop notifications
├── Content
│   ├── Blog — TipTap rich editor, SEO panel, publish workflow
│   ├── Newsletter — Subscriber management, broadcast emails
│   └── Knowledge — Internal knowledge base articles
├── Analytics
│   ├── Analytics — Traffic, conversion funnel, UTM attribution
│   ├── Email Logs — Delivery, open, click tracking (5s live polling)
│   ├── AI Analyst — Automated insights & recommendations
│   └── Activity Log — Complete audit trail (who did what, when)
├── Team
│   ├── Team — Member directory with profiles
│   ├── Team Chat — Internal messaging
│   └── Users — User management (Admin only)
└── System — System health, logs
```

---

## ⚙️ API LAYER (55+ endpoints)

```
API Routes
├── Auth (/api/blog/auth/)
│   ├── Login, Register, Reset Password, Set Password
│   ├── Admin Bootstrap (init, superadmin)
│   └── Impersonation (super_admin only)
├── Users (/api/blog/users/)
│   ├── List, Create, Register, Pending Approvals
│   └── RBAC Permission Management
├── Blog (/api/blog/)
│   ├── Posts CRUD + Publish
│   ├── Image Upload
│   └── Audit Logs
├── Forms (/api/forms/)
│   ├── Lead — 3-step form → N8N → Google Sheets + Email
│   ├── Contact — Direct email + CRM entry
│   ├── Callback — N8N → Sarvam voice agent trigger
│   ├── Chat — N8N → RAG-powered LLM response
│   └── Newsletter — Subscribe / Unsubscribe
├── CRM (/api/dashboard/)
│   ├── Leads CRUD + Export (CSV/JSON) + Lead→Client Convert
│   ├── Contacts CRUD + Contact→Lead Convert
│   ├── Clients CRUD
│   ├── Callbacks CRUD
│   ├── Chats + Reply
│   ├── Tasks (with browser notification trigger)
│   ├── Invoices CRUD + Send (PDF via PDFKit)
│   └── Tickets CRUD + Comments
├── Analytics (/api/dashboard/analytics/)
│   ├── Session + Pageview + Journey events
│   └── Email Logs (open/click/bounce tracking)
├── Email Tracking (/api/track/)
│   ├── /pixel — 1×1 GIF open tracker (await-safe, Vercel-proof)
│   └── /click — Link redirect + click counter
├── Content Intelligence (/api/content/)
│   ├── SEO/AEO/GEO Analysis (50+ checks, zero API calls)
│   ├── AI Content Detection (heuristic scoring)
│   └── Plagiarism Detection (similarity scoring)
├── N8N Webhooks (/api/n8n/)
│   └── Chat, Lead, Contact, Callback, Newsletter, Analytics
└── Webhooks
    └── /api/webhooks/resend — Delivery event ingestion
```

---

## 🤖 AI PRODUCTS

```
AI Products
├── Heka — 24/7 AI Voice Receptionist
│   └── Powers: inbound calls, appointment booking, FAQs
├── Website Keyword Assistant
│   └── Real-time on-page SEO intelligence
├── Telegram SEO Assistant
│   └── Daily keyword tracking briefings via Telegram
├── LinkedIn Post Assistant
│   └── AI-generated B2B thought-leadership content
├── Instagram Content Assistant
│   └── Captions, hooks, hashtag strategies
├── Mental Wellness Assistant
│   └── Employee mental health support (whitelabel)
└── AI Competitor Analysis
    └── SEO gap analysis + opportunity scoring
```

---

## 📧 EMAIL SYSTEM (15 templates, full in-house tracking)

```
Email Engine (Resend + In-house Tracking)
├── Templates (15)
│   ├── Registration, Password Reset
│   ├── Lead Confirmation, Lead Rejection
│   ├── Client Welcome (on conversion)
│   ├── Newsletter Welcome
│   ├── Callback Confirmation
│   ├── Chat Transcript
│   ├── Ticket Created, Ticket Reply, Ticket Status Update
│   ├── User Approved, User Rejected
│   ├── Feature Broadcast
│   ├── Task Assigned
│   └── Invoice (with PDF attachment)
├── In-House Tracking
│   ├── Open Pixel (1×1 GIF, full history with timestamps)
│   ├── Link Wrapping (all href → /api/track/click?id=&url=)
│   └── Email Logs (Supabase: entity_type, entity_id, open_count, click_history)
└── Per-Entity History
    ├── Lead page — all emails sent to that lead
    ├── Client page — all emails sent to that client
    └── Invoice page — all emails sent for that invoice
```

---

## 🔐 SECURITY & ACCESS CONTROL

```
RBAC System
├── 9 Roles (hierarchical)
│   ├── super_admin — Full access + impersonation + delete
│   ├── admin — Full operational access
│   ├── manager — CRM + invoices + tickets + team
│   ├── sales — Leads + clients + callbacks
│   ├── crm_operator — Contacts + chats
│   ├── finance — Invoices + clients (read)
│   ├── editor — Blog publish
│   ├── contributor — Blog draft
│   └── agent — Limited read
├── Module Permissions
│   └── blog, crm, invoice, tickets, users, monitoring, team_chat
├── Security Features
│   ├── bcrypt password hashing
│   ├── 30-day sliding session tokens
│   ├── Per-IP rate limiting
│   ├── reCAPTCHA on public forms
│   ├── CSRF protection (HTTPS headers)
│   ├── Security headers (HSTS, CSP, X-Frame-Options)
│   └── Complete audit logging (actor, resource, IP, timestamp)
└── Supabase RLS
    └── Row-level security on all tables
```

---

## 🗄️ DATA LAYER

```
Persistence (Dual-mode)
├── Primary: Supabase (PostgreSQL)
│   ├── Leads, Clients, Contacts, Callbacks, Chats
│   ├── Invoices, Tickets, Tasks, Blog Posts
│   ├── Users, Sessions, Audit Logs, Activity
│   ├── Email Logs (open_history, click_history as JSONB)
│   ├── Analytics (sessions, pageviews, journey events)
│   └── Newsletter subscribers, Knowledge base
├── Fallback: Filesystem JSON (/tmp on Vercel)
│   └── Auto-sync via unified store.ts abstraction
└── Backup: GitHub API (blog posts cold-start restore)
```

---

## 🔗 INTEGRATIONS & MCP USAGE

```
External Services
├── Supabase MCP — Live DB schema migrations, table management, SQL execution
│   └── Used to add entity_type/entity_id columns, create email_logs table, RLS policies
├── Resend — Transactional email delivery + webhook events
├── OpenAI — GPT API (AI Analyst, content intelligence)
├── n8n — Workflow orchestration engine
│   ├── Chat → RAG LLM pipeline
│   ├── Lead → Google Sheets sync
│   └── Callback → Sarvam AI voice agent
├── Sarvam AI — Indian-language voice AI (Heka product)
├── Google Analytics 4 — Web analytics
├── Vercel — Serverless deployment + edge network
├── GitHub — Version control + blog post backup/restore
└── PDFKit — Server-side invoice PDF generation
```

---

## 📊 SCALE SUMMARY

| Dimension           | Count    |
|---------------------|----------|
| Total pages         | 100+     |
| API endpoints       | 55+      |
| React components    | 90+      |
| Library modules     | 30+      |
| Email templates     | 15       |
| SEO/AEO/GEO checks  | 50+      |
| Service categories  | 7        |
| AI products         | 7        |
| Admin roles (RBAC)  | 9        |
| Integrations        | 10+      |
| Languages supported | TypeScript (100%) |
| Deployment target   | Vercel (serverless) |
| Database            | Supabase (PostgreSQL + RLS) |

---

*HotBot Studios Platform — Built with Next.js 14, Supabase, Resend, n8n, OpenAI, and Sarvam AI*
*Architecture designed and iterated with Claude (Anthropic) + MCP servers for live DB management*
