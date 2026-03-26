/**
 * Seed the default admin user.
 * Run: npx tsx scripts/seed-admin.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "hotbotstudios";
  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@hotbotstudios.com";

  // Check if admin exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    console.log(`Admin user "${username}" already exists. Skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { error } = await supabase.from("users").insert({
    username,
    email,
    password_hash: passwordHash,
    role: "super_admin",
    display_name: "HotBot Admin",
  });

  if (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }

  console.log(`Admin user "${username}" created successfully.`);
}

seed();
