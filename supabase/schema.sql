-- Giftlore: households share one set of people and notes.
-- Run once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  joined_at timestamptz not null default now()
);

create table if not exists public.household_state (
  household_id uuid primary key references public.households(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.household_state enable row level security;

-- The household the signed-in user belongs to (null if none yet).
create or replace function public.my_household() returns uuid
language sql stable security definer set search_path = public as $$
  select household_id from public.members where user_id = auth.uid()
$$;

-- Read your own membership; read and write your household's state; read your household row.
drop policy if exists "members: read own" on public.members;
create policy "members: read own" on public.members for select using (user_id = auth.uid());

drop policy if exists "households: read mine" on public.households;
create policy "households: read mine" on public.households for select using (id = public.my_household());

drop policy if exists "state: read mine" on public.household_state;
create policy "state: read mine" on public.household_state for select using (household_id = public.my_household());
drop policy if exists "state: write mine" on public.household_state;
create policy "state: write mine" on public.household_state for update using (household_id = public.my_household()) with check (household_id = public.my_household());

-- Creating and joining go through functions so the code lookup can't be used to enumerate households.
create or replace function public.ensure_household() returns text
language plpgsql security definer set search_path = public as $$
declare hid uuid; hcode text;
begin
  select household_id into hid from public.members where user_id = auth.uid();
  if hid is null then
    hcode := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    insert into public.households (code) values (hcode) returning id into hid;
    insert into public.members (user_id, household_id) values (auth.uid(), hid);
    insert into public.household_state (household_id, data) values (hid, '{}'::jsonb);
  end if;
  select code into hcode from public.households where id = hid;
  return hcode;
end $$;

create or replace function public.join_household(join_code text) returns text
language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  select id into hid from public.households where code = upper(trim(join_code));
  if hid is null then raise exception 'No household with that code'; end if;
  insert into public.members (user_id, household_id) values (auth.uid(), hid)
    on conflict (user_id) do update set household_id = excluded.household_id, joined_at = now();
  return upper(trim(join_code));
end $$;

-- Save the whole state document for the caller's household.
create or replace function public.save_state(doc jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.household_state set data = doc, updated_at = now() where household_id = public.my_household();
end $$;

grant execute on function public.ensure_household() to authenticated;
grant execute on function public.join_household(text) to authenticated;
grant execute on function public.save_state(jsonb) to authenticated;
grant execute on function public.my_household() to authenticated;
