// src/lib/n8n.ts
// Three production pipelines — all main-website traffic routes through one of these.
//
// Flow 1 — CHAT   → hotbotstudios-chat   AI text chat + human handoff
// Flow 2 — VOICE  → hotbotstudios-voice  Sarvam AI outbound call (callback request)
// Flow 3 — FORMS  → hotbotstudios-forms  All forms, newsletter, contact page, analytics events
//
// Blog admin webhooks (blog-auth, blog-create-publish, blog-sheets-backup) are
// called directly in /api/blog/* routes — not through this client.
//
// API Routes → triggerN8n() → N8N webhook:
//   /api/n8n/chat      → chat  pipeline
//   /api/n8n/callback  → voice pipeline
//   /api/n8n/form      → forms pipeline  (type: "lead")
//   /api/n8n/newsletter→ forms pipeline  (type: "newsletter")
//   /api/n8n/contact   → forms pipeline  (type: "contact")
//   /api/n8n/analytics → forms pipeline  (type: "analytics")

const N8N_BASE = process.env.N8N_BASE_URL;

export type N8nPipeline = "chat" | "voice" | "forms";

const ENDPOINTS: Record<N8nPipeline, string | undefined> = {
  chat:  process.env.N8N_WEBHOOK_CHAT,   // hotbotstudios-chat
  voice: process.env.N8N_WEBHOOK_VOICE,  // hotbotstudios-voice
  forms: process.env.N8N_WEBHOOK_FORMS,  // hotbotstudios-forms
};

export class N8nConfigError extends Error {
  constructor(pipeline: N8nPipeline) {
    super(`n8n misconfiguration: N8N_BASE_URL or endpoint for "${pipeline}" is not set`);
    this.name = "N8nConfigError";
  }
}

export async function triggerN8n<T = unknown>(
  pipeline: N8nPipeline,
  payload: Record<string, unknown>,
  options?: { timeout?: number },
): Promise<T> {
  const base     = N8N_BASE;
  const endpoint = ENDPOINTS[pipeline];

  if (!base || !endpoint) throw new N8nConfigError(pipeline);

  const url = base.replace(/\/$/, "") + "/" + endpoint.replace(/^\//, "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options?.timeout ?? 30_000);

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        _meta: {
          timestamp: new Date().toISOString(),
          source:    "hotbot-website",
          pipeline,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`n8n ${pipeline} webhook responded ${res.status}`);
    return await res.json() as T;
  } finally {
    clearTimeout(timer);
  }
}
