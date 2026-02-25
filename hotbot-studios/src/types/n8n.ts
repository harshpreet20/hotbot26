// src/types/n8n.ts

export interface N8nChatPayload {
  message: string;
  history: Array<{ role: string; content: string }>;
  mode: "chat";
}

export interface N8nChatResponse {
  message?: string;
  response?: string;
  text?: string;
  output?: string;
}

export interface N8nVoicePayload {
  audio: string;
  audioFormat: string;
  history: Array<{ role: string; content: string }>;
  mode: "voice";
}

export interface N8nVoiceResponse {
  message?: string;
  response?: string;
  audio?: string;
  audioFormat?: string;
}

export interface N8nFormPayload {
  lead: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service?: string;
    budget?: string;
    message?: string;
  };
  formType: string;
  page: string;
}

export interface N8nFormResponse {
  success: boolean;
  leadId?: string;
  id?: string;
  message?: string;
}

export interface N8nLeadsResponse {
  leads: import("./index").Lead[];
}

export interface N8nAnalyticsPayload {
  event: string;
  properties?: Record<string, unknown>;
  userAgent?: string;
  referer?: string;
}
