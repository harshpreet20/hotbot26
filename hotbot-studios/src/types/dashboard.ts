// ── Inbound data types persisted to data/*.json ──────────────────────────────

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  formType: string;
  source: string;
  ip: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
}

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: "pending" | "called";
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  ts: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  ip: string;
  startedAt: string;
  lastMessageAt: string;
}

export interface DashboardOverview {
  leads: number;
  contacts: number;
  newsletter: number;
  callbacks: number;
  chats: number;
  posts: number;
  recentLeads: Lead[];
  recentContacts: Contact[];
  recentCallbacks: CallbackRequest[];
}
