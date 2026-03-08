// ── Role-based access control ─────────────────────────────────────────────────
export type Role = "admin" | "manager" | "editor" | "contributor" | "agent";

/**
 * Role capability summary:
 *  admin       – Full access: users, blog, CRM data, settings
 *  manager     – CRM data (leads, contacts, callbacks, newsletter, overview) + read-only user list
 *  editor      – Blog management: create, edit, publish/unpublish, delete posts
 *  contributor – Blog drafts only: create & edit own drafts, cannot publish
 *  agent       – View chat logs and callbacks
 */
export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  admin:       ["users:manage", "blog:publish", "blog:edit", "data:read", "data:export"],
  manager:     ["data:read", "data:export", "users:report"],
  editor:      ["blog:publish", "blog:edit"],
  contributor: ["blog:draft"],
  agent:       ["chats:read", "callbacks:read"],
};

/** Public user info (safe to send to clients) */
export interface User {
  id: string;
  username: string;
  role: Role;
  createdAt: string;
}

/** Internal user record (includes password hash — never send to client) */
export interface UserRecord extends User {
  passwordHash: string;
}

/** The complete admin store written to data/admin.json */
export interface AdminStore {
  publishSecret: string;
  users: UserRecord[];
}

/** Session info returned from session lookups */
export interface SessionInfo {
  userId: string;
  username: string;
  role: Role;
}

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
