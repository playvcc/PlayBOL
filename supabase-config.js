// ============================================================
//  SUPABASE CONFIG — bo2league-v2/js/supabase-config.js
//  Replace the two values below with your own project details.
//  Get them from: https://app.supabase.com → Project Settings → API
// ============================================================

const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';

// ---- DO NOT EDIT BELOW THIS LINE ----
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ============================================================
//  SUPABASE SCHEMA — run these SQL commands in Supabase → SQL Editor
// ============================================================
/*

-- 1. PLAYERS table
create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  gamertag    text not null,
  platform    text check (platform in ('Xbox','PC')) default 'Xbox',
  tier        text check (tier in ('Recruit','Prospect','Contender','Challenger','Elite','Prestige')) default 'Recruit',
  team        text,
  kd          numeric(4,2) default 0,
  wins        int default 0,
  losses      int default 0,
  spm         int default 0,
  status      text check (status in ('Signed','Free Agent','Sub')) default 'Free Agent',
  discord     text,
  created_at  timestamptz default now()
);

-- 2. TEAMS table
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tier        text,
  wins        int default 0,
  losses      int default 0,
  map_diff    int default 0,
  points      int default 0,
  logo_url    text,
  created_at  timestamptz default now()
);

-- 3. MATCHES table
create table if not exists matches (
  id          uuid primary key default gen_random_uuid(),
  team_a      text not null,
  team_b      text not null,
  score_a     int default 0,
  score_b     int default 0,
  tier        text,
  game_mode   text,
  map_name    text,
  match_date  timestamptz,
  status      text check (status in ('upcoming','live','completed','forfeit')) default 'upcoming',
  stream_url  text,
  created_at  timestamptz default now()
);

-- 4. ANNOUNCEMENTS table
create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  pinned      boolean default false,
  created_at  timestamptz default now()
);

-- 5. ROW LEVEL SECURITY — Public can READ everything
alter table players       enable row level security;
alter table teams         enable row level security;
alter table matches       enable row level security;
alter table announcements enable row level security;

create policy "Public read players"       on players       for select using (true);
create policy "Public read teams"         on teams         for select using (true);
create policy "Public read matches"       on matches       for select using (true);
create policy "Public read announcements" on announcements for select using (true);

-- 6. ADMIN-ONLY WRITE — Only authenticated users (you) can insert/update/delete
--    In Supabase Auth, create ONE user (your account). Everyone else is anon.
create policy "Admin write players"       on players       for all using (auth.role() = 'authenticated');
create policy "Admin write teams"         on teams         for all using (auth.role() = 'authenticated');
create policy "Admin write matches"       on matches       for all using (auth.role() = 'authenticated');
create policy "Admin write announcements" on announcements for all using (auth.role() = 'authenticated');

*/
