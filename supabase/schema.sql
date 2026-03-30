-- HotBot Studios — Supabase Database Schema
-- Run this in the Supabase SQL Editor for project wsucqpunleplgyrrroae
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────

create type user_role as enum ('super_admin', 'admin', 'editor', 'finance');
create type customer_status as enum ('lead', 'prospect', 'active', 'inactive', 'churned');
create type blog_status as enum ('draft', 'published', 'archived');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type interaction_type as enum ('email', 'call', 'meeting', 'note', 'form', 'chat');

-- ── Profiles (extends Supabase Auth) ─────────────────────────────────────────

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  email       text,
  full_name   text,
  avatar_url  text,
  role        user_role default 'editor' not null
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Admin Users (custom bcrypt auth) ─────────────────────────────────────────

create table admin_users (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  username      text unique not null,
  password_hash text not null,
  role          user_role default 'editor' not null,
  email         text,
  is_active     boolean default true not null
);

alter table admin_users enable row level security;

-- Service role only (no RLS policies — accessed via service key from server)

-- ── Sessions ──────────────────────────────────────────────────────────────────

create table sessions (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  user_id     uuid not null references admin_users(id) on delete cascade,
  token       text unique not null,
  expires_at  timestamptz not null
);

alter table sessions enable row level security;

create index sessions_token_idx on sessions(token);
create index sessions_expires_at_idx on sessions(expires_at);

-- ── Blog Posts ────────────────────────────────────────────────────────────────

create table blog_posts (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  title           text not null,
  slug            text unique not null,
  content         text,
  excerpt         text,
  cover_image     text,
  tags            text[] default '{}' not null,
  status          blog_status default 'draft' not null,
  author_id       uuid references admin_users(id) on delete set null,
  published_at    timestamptz,
  seo_title       text,
  seo_description text
);

alter table blog_posts enable row level security;

create policy "Anyone can read published posts"
  on blog_posts for select using (status = 'published');

create index blog_posts_slug_idx on blog_posts(slug);
create index blog_posts_status_idx on blog_posts(status);
create index blog_posts_published_at_idx on blog_posts(published_at desc);

-- ── Customers (CRM) ───────────────────────────────────────────────────────────

create table customers (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  name        text not null,
  email       text unique not null,
  phone       text,
  company     text,
  status      customer_status default 'lead' not null,
  source      text,
  tags        text[] default '{}' not null,
  notes       text,
  assigned_to uuid references admin_users(id) on delete set null
);

alter table customers enable row level security;

create index customers_email_idx on customers(email);
create index customers_status_idx on customers(status);

-- ── Customer Interactions ─────────────────────────────────────────────────────

create table customer_interactions (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  customer_id uuid not null references customers(id) on delete cascade,
  type        interaction_type not null,
  summary     text,
  details     jsonb,
  created_by  uuid references admin_users(id) on delete set null
);

alter table customer_interactions enable row level security;

create index customer_interactions_customer_idx on customer_interactions(customer_id);
create index customer_interactions_created_at_idx on customer_interactions(created_at desc);

-- ── Invoices ──────────────────────────────────────────────────────────────────

create table invoices (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null,
  invoice_number text unique not null,
  customer_id    uuid not null references customers(id) on delete restrict,
  status         invoice_status default 'draft' not null,
  due_date       date,
  paid_at        timestamptz,
  subtotal       numeric(12,2) default 0 not null,
  tax_rate       numeric(5,4) default 0.18 not null,  -- 18% GST
  tax_amount     numeric(12,2) default 0 not null,
  total          numeric(12,2) default 0 not null,
  notes          text,
  created_by     uuid references admin_users(id) on delete set null
);

alter table invoices enable row level security;

create index invoices_customer_idx on invoices(customer_id);
create index invoices_status_idx on invoices(status);
create index invoices_created_at_idx on invoices(created_at desc);

-- ── Invoice Items ─────────────────────────────────────────────────────────────

create table invoice_items (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now() not null,
  invoice_id  uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) default 1 not null,
  unit_price  numeric(12,2) not null,
  amount      numeric(12,2) not null,  -- quantity * unit_price
  sort_order  integer default 0 not null
);

alter table invoice_items enable row level security;

create index invoice_items_invoice_idx on invoice_items(invoice_id);

-- ── Auto-updated_at triggers ──────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute procedure set_updated_at();

create trigger admin_users_updated_at before update on admin_users
  for each row execute procedure set_updated_at();

create trigger blog_posts_updated_at before update on blog_posts
  for each row execute procedure set_updated_at();

create trigger customers_updated_at before update on customers
  for each row execute procedure set_updated_at();

create trigger invoices_updated_at before update on invoices
  for each row execute procedure set_updated_at();

-- ── Seed default admin user ───────────────────────────────────────────────────
-- Password: Hotbotstudios (bcrypt hash — 10 rounds)
-- IMPORTANT: Change this password immediately after first login!
-- Generate a new hash with: node -e "const b=require('bcryptjs'); b.hash('YourPassword',10).then(console.log)"

insert into admin_users (username, password_hash, role, is_active)
values (
  'admin',
  '$2a$10$placeholder_run_seedAdminUser_from_api_instead',
  'super_admin',
  true
)
on conflict (username) do nothing;

-- NOTE: The actual bcrypt hash is generated at runtime by the seedAdminUser()
-- function in src/lib/auth.ts. Call POST /api/auth/seed (if you add that route)
-- or run the seed function on first app startup.
