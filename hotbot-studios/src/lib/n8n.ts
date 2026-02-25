// src/lib/n8n.ts
// Every operational task in the app goes through this file.
// Nothing hits n8n directly from components — always through API routes → this client.

const N8N_BASE = process.env.N8N_BASE_URL!;

export type N8nPipeline =
  | "chat"
  | "voice"
  | "form"
  | "leads"
  | "analytics"
  | "contact"
  | "newsletter";

const ENDPOINTS: Record<N8nPipeline, string> = {
  chat: process.env.N8N_WEBHOOK_CHAT!,
  voice: process.env.N8N_WEBHOOK_VOICE!,
  form: process.env.N8N_WEBHOOK_FORM!,
  leads: process.env.N8N_WEBHOOK_LEADS!,
  analytics: process.env.N8N_WEBHOOK_ANALYTICS!,
  contact: process.env.N8N_WEBHOOK_CONTACT!,
  newsletter: process.env.N8N_WEBHOOK_NEWSLETTER!,
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
