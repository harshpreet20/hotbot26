import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function POST() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const sql = neon(url);

  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        display_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)`;

    // Seed default admin if not exists
    const existing = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash("hotbotstudios", 12);
      await sql`
        INSERT INTO users (id, username, email, password_hash, role, display_name)
        VALUES (gen_random_uuid(), 'admin', 'admin@hotbotstudios.com', ${passwordHash}, 'super_admin', 'HotBot Admin')
      `;
    }

    return NextResponse.json({ message: "Database setup complete. Default admin: admin / hotbotstudios" });
  } catch (error) {
    console.error("DB setup error:", error);
    return NextResponse.json({ error: "Setup failed: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
