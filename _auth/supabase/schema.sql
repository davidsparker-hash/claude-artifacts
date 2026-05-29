-- =====================================================================
--  Anona — Supabase schema + Row Level Security
--  ---------------------------------------------------------------------
--  HOW TO USE: paste this whole file into the Supabase SQL Editor
--  (left sidebar → SQL Editor → New query) and click RUN. Safe to
--  re-run; it uses "if not exists" / "or replace" / "drop ... if exists".
--
--  Tables created (all with RLS ON = locked by default):
--    profiles      one row per user, holds is_admin
--    invite_codes  single-use signup codes
--    login_events  one row per successful login (the admin log)
--
--  Security model:
--    - Browsers use the public "anon" key and are bound by the policies
--      below.
--    - The Netlify invite-redemption function uses the SERVICE ROLE key,
--      which BYPASSES RLS entirely — that is why invite_codes needs no
--      client policy: only the server can touch it.
-- =====================================================================


-- ---------------------------------------------------------------------
--  profiles : one row per user, linked to Supabase Auth, holds is_admin
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user may read ONLY their own profile row.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- NOTE: there is deliberately NO client insert/update policy.
--   • profile rows are created automatically by the trigger below
--   • is_admin can only ever be set by YOU in the SQL Editor
--     (so a user can never make themselves an admin)


-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
--  invite_codes : single-use codes, redeemed server-side only
-- ---------------------------------------------------------------------
create table if not exists public.invite_codes (
  code        text primary key,
  claimed     boolean not null default false,
  claimed_by  uuid references auth.users(id),
  claimed_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

-- NO policies on purpose. With RLS on and no policy, the anon/authenticated
-- keys get ZERO access. Only the Netlify function (service role) can read a
-- code, check it, and mark it claimed — so users can't bypass it in the browser.


-- ---------------------------------------------------------------------
--  login_events : one row per successful login (the admin log)
-- ---------------------------------------------------------------------
create table if not exists public.login_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

alter table public.login_events enable row level security;

-- A signed-in user may insert a login event ONLY for themselves.
drop policy if exists "insert own login event" on public.login_events;
create policy "insert own login event"
  on public.login_events for insert
  with check ( auth.uid() = user_id );

-- Only admins may READ the log (this is what gates the admin page —
-- even if someone faked the client-side check, RLS returns no rows).
drop policy if exists "admins read all login events" on public.login_events;
create policy "admins read all login events"
  on public.login_events for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
