-- Run once against the Neon database (e.g. via `psql "$DATABASE_URL" -f lib/schema.sql`).

create extension if not exists pgcrypto;

create table if not exists clients (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  address text not null default '',
  notes text not null default '',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists projects (
  id text primary key default gen_random_uuid()::text,
  client_id text not null,
  name text not null,
  description text not null default '',
  budget numeric not null default 0,
  status text not null default 'ongoing',
  start_date text not null default '',
  due_date text not null default '',
  members text[] not null default '{}',
  commissions jsonb not null default '[]',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists invoices (
  id text primary key default gen_random_uuid()::text,
  invoice_number text not null,
  client_id text not null,
  project_id text not null,
  issue_date text not null default '',
  due_date text not null default '',
  items jsonb not null default '[]',
  tax_percent numeric not null default 0,
  notes text not null default '',
  status text not null default 'unpaid',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists user_profiles (
  uid text primary key,
  display_name text not null default '',
  currency text not null default 'USD'
);
