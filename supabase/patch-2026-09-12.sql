-- Re-runnable patch: functions with the extensions schema on the search path, auth guards, and anon revoked.

-- Creating and joining go through functions so the code lookup can't be used to enumerate households.
create or replace function public.ensure_household() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare hid uuid; hcode text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
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
language plpgsql security definer set search_path = public, extensions as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select id into hid from public.households where code = upper(trim(join_code));
  if hid is null then raise exception 'No household with that code'; end if;
  insert into public.members (user_id, household_id) values (auth.uid(), hid)
    on conflict (user_id) do update set household_id = excluded.household_id, joined_at = now();
  return upper(trim(join_code));
end $$;

-- Save the whole state document for the caller's household.
create or replace function public.save_state(doc jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  update public.household_state set data = doc, updated_at = now() where household_id = public.my_household();
end $$;

revoke execute on function public.ensure_household() from public, anon;
revoke execute on function public.join_household(text) from public, anon;
revoke execute on function public.save_state(jsonb) from public, anon;
grant execute on function public.ensure_household() to authenticated;
grant execute on function public.join_household(text) to authenticated;
grant execute on function public.save_state(jsonb) to authenticated;
grant execute on function public.my_household() to authenticated;
