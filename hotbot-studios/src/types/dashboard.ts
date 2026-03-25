// ── Role-based access control ─────────────────────────────────────────────────
export type Role = "admin" | "manager" | "sales" | "crm_operator" | "editor" | "contributor" | "agent";

/**
 * Role capability summary:
 *  admin        – Full access: users, blog, CRM data, settings
 *  manager      – CRM data (leads, contacts, callbacks, newsletter, overview) + read-only user list
 *  sales        – Create & manage leads, view CRM pipeline, access sales channels
 *  crm_operator – View & update CRM data (leads, contacts, callbacks); cannot create leads or manage users
 *  editor       – Blog management: create, edit, publish/unpublish, delete posts
 *  contributor  – Blog drafts only: create & edit own drafts, cannot publish
 *  agent        – View chat logs and callbacks
 */
export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  admin:        ["users:manage", "blog:publish", "blog:edit", "data:read", "data:export", "crm:full", "invoices:full"],
  manager:      ["data:read", "data:export", "users:report", "crm:full", "invoices:read"],
  sales:        ["data:read", "crm:full", "leads:create", "invoices:read"],
  crm_operator: ["data:read", "crm:update"],
  editor:       ["blog:publish", "blog:edit"],
  contributor:  ["blog:draft"],
  agent:        ["chats:read", "callbacks:read", "crm:read"],
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

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

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
  // CRM fields
  status: LeadStatus;
  assignedTo?: string;         // username of assigned agent/manager
  notes?: string;              // quick internal notes
  tags?: string[];
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
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

/** A user registration request pending admin approval */
export interface PendingUser {
  id: string;
  username: string;
  email: string;
  requestedRole: Role;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// ── CRM Activity Updates ──────────────────────────────────────────────────────

export type UpdateType = "note" | "call" | "email" | "meeting" | "status_change" | "assignment" | "task_linked" | "invoice_linked";

export interface CRMUpdate {
  id: string;
  leadId: string;
  type: UpdateType;
  content: string;
  createdAt: string;
  createdBy: string;   // username
  metadata?: Record<string, string>;  // e.g. { prevStatus, newStatus } for status_change
}

// ── CRM Tasks ─────────────────────────────────────────────────────────────────

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus   = "open" | "in_progress" | "done" | "cancelled";

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;          // username
  createdBy: string;            // username
  createdAt: string;
  dueDate?: string;             // ISO date
  completedAt?: string;
  // Relationships
  leadId?: string;              // linked lead
  invoiceId?: string;           // linked invoice
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;               // quantity * unitPrice
}

export interface Invoice {
  id: string;
  invoiceNumber: string;        // e.g. "INV-0001"
  status: InvoiceStatus;
  // Client info
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  clientAddress?: string;
  // Line items
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;              // percentage, e.g. 18 for 18%
  taxAmount: number;
  discount: number;             // flat amount
  total: number;
  currency: string;             // e.g. "INR", "USD"
  // Dates
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  // Meta
  notes?: string;
  terms?: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  // Relationships
  leadId?: string;              // linked lead/prospect
}

// ── Ticketing System ──────────────────────────────────────────────────────────

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus   = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketCategory = "bug" | "feature" | "support" | "billing" | "general";

export interface TicketComment {
  id: string;
  ticketId: string;
  text: string;
  authorName: string;   // public commenter name or username for staff
  authorEmail?: string;
  isStaff: boolean;     // true = internal team reply visible to requester
  createdAt: string;
  editedAt?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;   // e.g. "TKT-0042"
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  // Requester (public user)
  requesterName: string;
  requesterEmail: string;
  // Internal
  assignedTo?: string;    // username
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  // Tracking
  ip?: string;
  comments?: TicketComment[];
}

// ── Team Chat ─────────────────────────────────────────────────────────────────

export interface TeamMessage {
  id: string;
  channelId: string;       // e.g. "general", "sales", "dev"
  text: string;
  createdBy: string;       // username
  createdAt: string;
  editedAt?: string;
  replyTo?: string;        // id of parent message for threads
}

export interface TeamChannel {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
}

// ── Dashboard Overview ────────────────────────────────────────────────────────

export interface DashboardOverview {
  leads: number;
  contacts: number;
  newsletter: number;
  callbacks: number;
  chats: number;
  posts: number;
  invoices: number;
  invoiceRevenue: number;       // total paid invoice amount
  openTasks: number;
  recentLeads: Lead[];
  recentContacts: Contact[];
  recentCallbacks: CallbackRequest[];
  recentInvoices: Invoice[];
}
