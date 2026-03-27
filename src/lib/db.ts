import { neon } from "@neondatabase/serverless";

function getSQL() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL or POSTGRES_URL environment variable");
  }
  return neon(url);
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  role: string;
  display_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserByUsername(username: string): Promise<DbUser | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM users WHERE username = ${username} AND is_active = true LIMIT 1`;
  return (rows[0] as DbUser) || null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return (rows[0] as DbUser) || null;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM users WHERE email = ${email} AND is_active = true LIMIT 1`;
  return (rows[0] as DbUser) || null;
}

export async function getUsers(page = 1, limit = 50): Promise<{ users: DbUser[]; total: number }> {
  const sql = getSQL();
  const offset = (page - 1) * limit;
  const [users, countResult] = await Promise.all([
    sql`SELECT id, username, email, role, display_name, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT COUNT(*)::int as count FROM users`,
  ]);
  return { users: users as DbUser[], total: (countResult[0]?.count as number) || 0 };
}

export async function createUser(data: {
  username: string;
  email?: string | null;
  password_hash: string;
  role?: string;
  display_name?: string;
}): Promise<DbUser> {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO users (id, username, email, password_hash, role, display_name)
    VALUES (gen_random_uuid(), ${data.username}, ${data.email || null}, ${data.password_hash}, ${data.role || "admin"}, ${data.display_name || data.username})
    RETURNING id, username, email, role, display_name, is_active, created_at
  `;
  return rows[0] as DbUser;
}

export async function updateUser(id: string, updates: Record<string, unknown>): Promise<DbUser | null> {
  const sql = getSQL();
  const setClauses: string[] = [];
  const values: unknown[] = [];

  const allowedFields = ["email", "role", "display_name", "is_active", "password_hash", "last_login_at", "updated_at"];
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClauses.push(key);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return getUserById(id);

  // Build dynamic update — since neon() tagged templates don't support dynamic columns easily,
  // we handle common update patterns explicitly
  const now = new Date().toISOString();
  const rows = await sql`
    UPDATE users SET
      email = COALESCE(${updates.email !== undefined ? updates.email : null}, email),
      role = COALESCE(${updates.role !== undefined ? String(updates.role) : null}, role),
      display_name = COALESCE(${updates.display_name !== undefined ? updates.display_name : null}, display_name),
      is_active = COALESCE(${updates.is_active !== undefined ? updates.is_active : null}, is_active),
      password_hash = COALESCE(${updates.password_hash !== undefined ? updates.password_hash : null}, password_hash),
      last_login_at = COALESCE(${updates.last_login_at !== undefined ? updates.last_login_at : null}, last_login_at),
      updated_at = ${now}
    WHERE id = ${id}
    RETURNING id, username, email, role, display_name, is_active, last_login_at, created_at, updated_at
  `;
  return (rows[0] as DbUser) || null;
}

// ── Activity Logs ────────────────────────────────────────────────────────────

export interface DbActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  username?: string;
  display_name?: string;
}

export async function addActivityLog(data: {
  userId: string | null;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  const sql = getSQL();
  await sql`
    INSERT INTO activity_logs (id, user_id, action, details, ip_address)
    VALUES (gen_random_uuid(), ${data.userId}, ${data.action}, ${JSON.stringify(data.details || {})}::jsonb, ${data.ipAddress || null})
  `;
}

export async function getActivityLogs(params: {
  page?: number;
  limit?: number;
  action?: string | null;
  userId?: string | null;
  from?: string | null;
  to?: string | null;
}): Promise<{ logs: DbActivityLog[]; total: number }> {
  const sql = getSQL();
  const page = params.page || 1;
  const limit = Math.min(params.limit || 50, 100);
  const offset = (page - 1) * limit;

  // Build filtered query
  let logs: DbActivityLog[];
  let total: number;

  if (params.userId && params.action) {
    const [rows, countResult] = await Promise.all([
      sql`SELECT a.*, u.username, u.display_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id WHERE a.user_id = ${params.userId} AND a.action = ${params.action} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int as count FROM activity_logs WHERE user_id = ${params.userId} AND action = ${params.action}`,
    ]);
    logs = rows as DbActivityLog[];
    total = (countResult[0]?.count as number) || 0;
  } else if (params.userId) {
    const [rows, countResult] = await Promise.all([
      sql`SELECT a.*, u.username, u.display_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id WHERE a.user_id = ${params.userId} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int as count FROM activity_logs WHERE user_id = ${params.userId}`,
    ]);
    logs = rows as DbActivityLog[];
    total = (countResult[0]?.count as number) || 0;
  } else if (params.action) {
    const [rows, countResult] = await Promise.all([
      sql`SELECT a.*, u.username, u.display_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id WHERE a.action = ${params.action} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int as count FROM activity_logs WHERE action = ${params.action}`,
    ]);
    logs = rows as DbActivityLog[];
    total = (countResult[0]?.count as number) || 0;
  } else {
    const [rows, countResult] = await Promise.all([
      sql`SELECT a.*, u.username, u.display_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int as count FROM activity_logs`,
    ]);
    logs = rows as DbActivityLog[];
    total = (countResult[0]?.count as number) || 0;
  }

  return { logs, total };
}

export async function getStats() {
  const sql = getSQL();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [totalUsers, activeUsers, loginsToday, recentActivity] = await Promise.all([
    sql`SELECT COUNT(*)::int as count FROM users`,
    sql`SELECT COUNT(*)::int as count FROM users WHERE is_active = true`,
    sql`SELECT COUNT(*)::int as count FROM activity_logs WHERE action = 'login' AND created_at >= ${todayStr}`,
    sql`SELECT a.*, u.username, u.display_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 10`,
  ]);

  return {
    totalUsers: (totalUsers[0]?.count as number) || 0,
    activeUsers: (activeUsers[0]?.count as number) || 0,
    loginsToday: (loginsToday[0]?.count as number) || 0,
    recentActivity: recentActivity as DbActivityLog[],
  };
}

// ── Password Reset Tokens ────────────────────────────────────────────────────

export interface DbResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export async function addResetToken(userId: string, token: string, expiresAt: string): Promise<void> {
  const sql = getSQL();
  await sql`
    INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
    VALUES (gen_random_uuid(), ${userId}, ${token}, ${expiresAt})
  `;
}

export async function getResetToken(token: string): Promise<DbResetToken | null> {
  const sql = getSQL();
  const now = new Date().toISOString();
  const rows = await sql`
    SELECT * FROM password_reset_tokens
    WHERE token = ${token} AND used = false AND expires_at > ${now}
    LIMIT 1
  `;
  return (rows[0] as DbResetToken) || null;
}

export async function markTokenUsed(id: string): Promise<void> {
  const sql = getSQL();
  await sql`UPDATE password_reset_tokens SET used = true WHERE id = ${id}`;
}
