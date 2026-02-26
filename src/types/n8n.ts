// src/types/n8n.ts

export interface N8nChatPayload {
  message: string;
  history: Array<{ role: string; content: string }>;
}

export interface N8nChatResponse {
  message?: string;
  response?: string;
  text?: string;
  output?: string;
}

// Unified lead capture (all forms → Google Sheets via single N8N webhook)
export interface N8nLeadsPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message?: string;
  formType: string;   // "get-started" | "strategy-call" | "consultation" | "contact"
  source: string;     // page the form was submitted from
}

export interface N8nLeadsResponse {
  success: boolean;
  leadId?: string;
  id?: string;
  message?: string;
}

// Callback request → N8N → Sarvam AI outbound call
export interface N8nCallbackPayload {
  name: string;
  phone: string;
  requestedAt: string;
  source: string;
}

export interface N8nCallbackResponse {
  success: boolean;
  message?: string;
}

export interface N8nAnalyticsPayload {
  event: string;
  properties?: Record<string, unknown>;
  userAgent?: string;
  referer?: string;
}
