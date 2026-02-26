// src/lib/n8n.ts
// Every operational task in the app goes through this file.
// Components never hit n8n directly — always via API routes → this client.
//
// Architecture:
//   Frontend (Next.js) → /api/n8n/* routes → triggerN8n() → n8n webhook → Google Sheets + notifications

const N8N_BASE = process.env.N8N_BASE_URL!;

export type N8nPipeline =
  | "chat"       // AI text chat (N8N LLM workflow)
  | "leads"      // Unified lead capture (all forms) → Google Sheets
  | "analytics"  // Event tracking (fire-and-forget)
  | "newsletter" // Newsletter subscriptions
  | "callback";  // Request a call → triggers Sarvam voice agent outbound call

const ENDPOINTS: Record<N8nPipeline, string> = {
  chat:       process.env.N8N_WEBHOOK_CHAT!,
  leads:      process.env.N8N_WEBHOOK_LEADS!,       // single webhook for ALL lead capture
  analytics:  process.env.N8N_WEBHOOK_ANALYTICS!,
  newsletter: process.env.N8N_WEBHOOK_NEWSLETTER!,
  callback:   process.env.N8N_WEBHOOK_CALLBACK!,    // triggers Sarvam outbound call
};

export async function triggerN8n<T = unknown>(
  pipeline: N8nPipeline,
  payload: Record<string, unknown>,
  options?: { timeout?: number }
): Promise<T> {
  const url = `${N8N_BASE}${ENDPOINTS[pipeline]}`;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeout || 30000
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        _meta: {
          timestamp: new Date().toISOString(),
          source: "hotbot-website",
          pipeline,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`n8n ${pipeline} failed: ${res.status}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
