-- MediLens database schema (Supabase / Postgres — free tier is enough)
-- Run this once in the Supabase SQL editor: Dashboard > SQL > New query.

-- 1) Scan history: every scan the user performs -----------------------------
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  drug_name text,
  manufacturer text,
  batch_number text,
  expiry_date text,
  verdict text not null check (verdict in ('green', 'amber', 'red')),
  reasons text[] not null default '{}',
  confidence numeric,
  ocr_confidence numeric
);

-- 2) Crowdsourced hotspot reports: anonymised scan verdicts for the map ------
create table if not exists hotspot_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  drug_name text,
  verdict text not null check (verdict in ('green', 'amber', 'red')),
  -- Coordinates are ROUNDED to ~1km before insert (see API route) so no
  -- exact user location is ever stored. Privacy by design.
  lat numeric not null,
  lng numeric not null,
  city text
);

-- 3) Row Level Security -------------------------------------------------------
-- Demo-friendly policies: anyone can read, anyone can insert.
-- For production you would restrict this to authenticated users.
alter table scans enable row level security;
alter table hotspot_reports enable row level security;

create policy "public read scans" on scans
  for select using (true);
create policy "public insert scans" on scans
  for insert with check (true);

create policy "public read hotspots" on hotspot_reports
  for select using (true);
create policy "public insert hotspots" on hotspot_reports
  for insert with check (true);

-- 4) Helpful indexes ----------------------------------------------------------
create index if not exists scans_created_at_idx on scans (created_at desc);
create index if not exists hotspots_created_at_idx on hotspot_reports (created_at desc);
