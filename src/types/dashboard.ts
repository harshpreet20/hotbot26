// ── Role-based access control ─────────────────────────────────────────────────
export type Role = "super_admin" | "admin" | "manager" | "sales" | "crm_operator" | "finance" | "editor" | "contributor" | "agent";

/**
 * Role capability summary:
 *  super_admin  – God mode: manage all users including admins, impersonate, view all logs
 *  admin        – Full access: users, blog, CRM data, settings (cannot manage super_admins)
 *  manager      – CRM data (leads, contacts, callbacks, newsletter, overview) + read-only user list
 *  sales        – Create & manage leads, view CRM pipeline, access sales channels
 *  crm_operator – View & update CRM data (leads, contacts, callbacks); cannot create leads or manage users
 *  finance      – Full invoice management, read-only CRM data (leads, overview)
 *  editor       – Blog management: create, edit, publish/unpublish, delete posts
 *  contributor  – Blog drafts only: create & edit own drafts, cannot publish
 *  agent        – View chat logs and callbacks
 */
export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  super_admin:  ["users:all", "blog:publish", "blog:edit", "data:read", "data:export", "crm:full", "invoices:full", "monitoring:full", "impersonate"],
  admin:        ["users:manage", "blog:publish", "blog:edit", "data:read", "data:export", "crm:full", "invoices:full", "monitoring:read"],
  manager:      ["data:read", "data:export", "users:report", "crm:full", "invoices:read"],
  sales:        ["data:read", "crm:full", "leads:create", "invoices:read"],
  crm_operator: ["data:read", "crm:update"],
  finance:      ["data:read", "invoices:full", "crm:read"],
  editor:       ["blog:publish", "blog:edit"],
  contributor:  ["blog:draft"],
  agent:        ["chats:read", "callbacks:read", "crm:read"],
};

// ── Module-level granular permissions ─────────────────────────────────────────
export type Module = "blog" | "crm" | "invoice" | "tickets" | "users" | "monitoring" | "team_chat";
export type PermissionAction = "read" | "write" | "publish" | "admin";
export type Permission = `${Module}:${PermissionAction}`;

/** Per-user module permission overrides stored in the DB */
export interface UserModulePermissions {
  id: string;
  userId: string;
  grants: Permission[];   // additional permissions beyond role defaults
  revokes: Permission[];  // permissions removed from role defaults
  updatedAt: string;
  updatedBy: string;      // username of who changed it
}

/** Audit log entry */
export interface AuditLog {
  id: string;
  actorId: string;
  actorUsername: string;
  actorRole: Role;
  action: string;          // e.g. "user.create", "role.change", "impersonate.start"
  resourceType: string;    // e.g. "user", "post", "invoice"
  resourceId?: string;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
  isImpersonating?: boolean;
  impersonatorId?: string;
}

/** Public user info (safe to send to clients) */
export interface User {
  id: string;
  username: string;
  role: Role;
  createdAt: string;
}

/** Internal user record (includes password hash - never send to client) */
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
  isImpersonating?: boolean;
  originalUserId?: string;
  originalUsername?: string;
  originalRole?: Role;
}

// ── Inbound data types persisted to data/*.json ──────────────────────────────

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" | "converted";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  formType?: string | null;
  source?: string | null;
  ip?: string | null;
  createdAt: string;
  // CRM fields
  status: LeadStatus;
  assignedTo?: string | null;
  notes?: string | null;
  tags?: string[];
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
  // Journey tracking
  sessionId?: string | null;
  journeyStage?: string | null;
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
  whatsapp?: string;
  whatsappOptIn?: boolean;
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
  needsHuman?: boolean;
  agentUsername?: string;
  agentTookOverAt?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

/** A user registration request pending admin approval */
export interface PendingUser {
  id: string;
  name: string;
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
export type LinkedEntityType = "lead" | "invoice" | "ticket" | "client" | "blog" | "callback" | "newsletter";

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  // Entity links (at most one populated at a time)
  leadId?: string;
  invoiceId?: string;
  ticketId?: string;
  clientId?: string;
  blogId?: string;
  callbackId?: string;
  newsletterId?: string;
  // Denormalized display info (set on create/update, avoids extra fetches)
  linkedEntityType?: LinkedEntityType;
  linkedEntityLabel?: string;   // human-readable name/title of the linked entity
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
export type TicketStatus   = "draft" | "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketCategory = "bug" | "feature" | "support" | "billing" | "general";

export interface TicketComment {
  id: string;
  ticketId: string;
  text: string;
  authorName: string;   // public commenter name or username for staff
  authorEmail?: string;
  isStaff: boolean;     // true = internal team reply visible to requester
  isInternal?: boolean; // true = private staff note, NOT visible to requester
  createdAt: string;
  editedAt?: string;
}

export type TicketActivityType =
  | "created"
  | "status_changed"
  | "priority_changed"
  | "assigned"
  | "unassigned"
  | "comment_added"
  | "internal_note"
  | "label_added"
  | "label_removed"
  | "due_date_set";

export interface TicketActivity {
  id: string;
  ticketId: string;
  type: TicketActivityType;
  actorName: string;          // username
  createdAt: string;
  metadata?: Record<string, string>; // e.g. { from: "open", to: "resolved" }
}

export interface Ticket {
  id: string;
  ticketNumber?: string;  // e.g. "TKT-0042" (admin-created only)
  title?: string;         // admin-created tickets
  subject?: string;       // portal/contact-form tickets — use subject || title for display
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: TicketCategory;
  // Requester — admin tickets use requesterName/requesterEmail, portal uses clientName/clientEmail
  requesterName?: string;
  requesterEmail?: string;
  clientName?: string;    // portal ticket submitter display name
  clientEmail?: string;   // portal ticket submitter email
  // Source — "admin" | "portal" | "contact_form"
  source?: string;
  approvalStatus?: string;
  // Internal
  assignedTo?: string;      // username
  labels?: string[];
  dueDate?: string;         // ISO date
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  // Internal team tickets
  isInternal?: boolean;     // true = raised within team, not by a public client
  raisedAgainst?: string;   // username of teammate this issue is about
  raisedBy?: string;        // username of staff member who raised it
  clientId?: string;        // optional link to a specific client
  // Tracking
  ip?: string;
  comments?: TicketComment[];
  activity?: TicketActivity[];
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

// ── AI Knowledge Base ─────────────────────────────────────────────────────────

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  active: boolean;
  priority: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Clients ───────────────────────────────────────────────────────────────────

export type ClientStatus = "active" | "old" | "reactivation_needed";
export type OnboardingStage = "prospect" | "onboarded" | "active" | "vip";
export type SubscriptionStatus = "none" | "trial" | "active" | "paused" | "cancelled";

export interface Client {
  id: string;
  clientId: string;             // e.g. "HOT-1001"
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  leadId?: string;
  // Extended CRM fields
  onboardingStage?: OnboardingStage;
  accountManager?: string;
  portalEnabled?: boolean;
  portalInviteSentAt?: string;
  subscriptionStatus?: SubscriptionStatus;
  industry?: string;
  website?: string;
  address?: string;
  avatarUrl?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  clientType?: string;
  totalRevenue?: number;
  outstandingBalance?: number;
  lastActivityAt?: string;
}

// ── Client Portal Users ───────────────────────────────────────────────────────

export type ClientUserRole = "owner" | "admin" | "member";

export interface ClientUser {
  id: string;
  clientId: string;
  email: string;
  name: string;
  role: ClientUserRole;
  inviteToken?: string;
  inviteExpiresAt?: string;
  inviteAcceptedAt?: string;
  invitedBy?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  gateway: "razorpay" | "paypal" | "manual";
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paidAt?: string;
  payerEmail?: string;
  createdAt: string;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type ProjectStage = "discovery" | "design" | "development" | "qa" | "launch" | "support";
export type ProjectUpdateType = "update" | "milestone" | "deployment" | "approval_needed" | "blocker" | "sprint_summary" | "design" | "qa_pass" | "launch" | "file" | "note";

export interface Project {
  id: string;
  project_number: string;
  client_id: string;
  client_name?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  stage: ProjectStage;
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  start_date?: string;
  target_date?: string;
  completed_date?: string;
  assigned_to: string[];
  account_manager?: string;
  budget?: number;
  currency: string;
  tags: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  client_id?: string;
  type: ProjectUpdateType;
  title?: string;
  content: string;
  visibility: "internal" | "client";
  progress?: number;
  author_email: string;
  author_name?: string;
  author_type: "team" | "client";
  attachments: { name: string; url: string }[];
  pinned: boolean;
  reactions?: ProjectUpdateReaction[];
  comments?: ProjectUpdateComment[];
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdateReaction {
  id: string;
  update_id: string;
  author_email: string;
  author_name?: string;
  author_type: string;
  emoji: string;
  created_at: string;
}

export interface ProjectUpdateComment {
  id: string;
  update_id: string;
  content: string;
  author_email: string;
  author_name?: string;
  author_type: string;
  created_at: string;
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
  portalUsers: number;          // active client_users with invite accepted
  recentLeads: Lead[];
  recentContacts: Contact[];
  recentCallbacks: CallbackRequest[];
  recentInvoices: Invoice[];
}
