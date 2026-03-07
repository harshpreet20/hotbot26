// N8N integration removed — all pipelines now write directly to local JSON stores
// and the Backdrop master dashboard. See src/lib/store.ts for the data layer.
//
// All /api/n8n/* routes operate standalone:
//   /api/n8n/chat      → Anthropic claude-haiku + data/chats.json
//   /api/n8n/callback  → data/callbacks.json
//   /api/n8n/form      → data/leads.json
//   /api/n8n/newsletter→ data/newsletter.json
//   /api/n8n/contact   → data/contacts.json
//   /api/n8n/analytics → 200 (GA4 handles client-side tracking)

export {};
