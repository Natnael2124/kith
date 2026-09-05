-- ==============================================================================
-- KITH: Cooperative Life-Gamification Database Schema
-- Execute this entire script in your Supabase SQL Editor (Database -> SQL Editor)
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  archetype text check (archetype in ('Wayfarer', 'Warden', 'Sage', 'Artisan')) default 'Wayfarer',
  level int default 1,
  total_xp int default 0,
  streak_days int default 0,
  is_resting boolean default false,
  caravan_id uuid,
  created_at timestamp with time zone default now()
);

-- 2. Caravans Table
create table if not exists public.caravans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  motto text,
  invite_code text unique not null,
  campfire_level int default 100, -- Range: 0 to 100
  expedition_distance int default 0,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Add foreign key constraint to profiles for caravan_id (if not already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_caravan'
  ) then
    alter table public.profiles 
      add constraint fk_caravan foreign key (caravan_id) references public.caravans(id) on delete set null;
  end if;
end $$;

-- 3. Daily Quests Table
create table if not exists public.quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null check (category in ('Intellect', 'Vitality', 'Clarity', 'Craft')),
  xp_value int default 25,
  campfire_value int default 15,
  is_completed boolean default false,
  target_date date default current_date,
  completed_at timestamp with time zone
);

-- 4. Caravan Expedition Feed / Logs
create table if not exists public.caravan_logs (
  id uuid default gen_random_uuid() primary key,
  caravan_id uuid references public.caravans(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  entry_type text check (entry_type in ('quest_done', 'kindle_buff', 'chronicle_story', 'rest_toggle')),
  message text not null,
  created_at timestamp with time zone default now()
);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.caravans enable row level security;
alter table public.quests enable row level security;
alter table public.caravan_logs enable row level security;

-- Profiles policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- Caravans policies
drop policy if exists "Caravans are viewable by members" on public.caravans;
create policy "Caravans are viewable by members" on public.caravans for select using (true);

drop policy if exists "Authenticated users can create caravans" on public.caravans;
create policy "Authenticated users can create caravans" on public.caravans for insert with check (auth.role() = 'authenticated');

drop policy if exists "Members can update their caravan" on public.caravans;
create policy "Members can update their caravan" on public.caravans for update using (true);

-- Quests policies
drop policy if exists "Users can manage own quests" on public.quests;
create policy "Users can manage own quests" on public.quests for all using (auth.uid() = user_id);

drop policy if exists "Quests viewable by caravan members" on public.quests;
create policy "Quests viewable by caravan members" on public.quests for select using (true);

-- Caravan logs policies
drop policy if exists "Caravan logs viewable by all members" on public.caravan_logs;
create policy "Caravan logs viewable by all members" on public.caravan_logs for select using (true);

drop policy if exists "Authenticated users can post caravan logs" on public.caravan_logs;
create policy "Authenticated users can post caravan logs" on public.caravan_logs for insert with check (auth.role() = 'authenticated');

-- ==============================================================================
-- Auth Trigger: Auto-create public.profiles record when a user signs up
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, archetype)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id),
    coalesce(new.raw_user_meta_data->>'archetype', 'Wayfarer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- Realtime Replication
-- ==============================================================================
-- Enable realtime for tables so live updates work out-of-the-box
alter publication supabase_realtime add table public.caravans;
alter publication supabase_realtime add table public.quests;
alter publication supabase_realtime add table public.caravan_logs;
alter publication supabase_realtime add table public.profiles;
