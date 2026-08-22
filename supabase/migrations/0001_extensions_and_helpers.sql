create extension if not exists pgcrypto;

-- ===========================================================
-- Shared RLS helpers, referenced by every table's policy below.
-- Both are `language plpgsql` (not `sql`) deliberately: a `language sql`
-- function is validated against existing tables at CREATE FUNCTION time,
-- which fails if the table it references doesn't exist yet. `plpgsql`
-- bodies are opaque text resolved at first call, so these can safely
-- forward-reference `public.profiles` before migration 0003 creates it.
--
-- SECURITY DEFINER + fixed search_path so these can read public.profiles
-- without triggering that table's own RLS recursively, and so they can't
-- be hijacked by a search_path injection.
-- ===========================================================

create or replace function public.fn_is_verus_staff()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('verus_admin', 'verus_staff')
  );
end;
$$;

create or replace function public.fn_my_org_id()
returns uuid
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result uuid;
begin
  select org_id into result from public.profiles where id = auth.uid();
  return result;
end;
$$;

revoke all on function public.fn_is_verus_staff() from public;
revoke all on function public.fn_my_org_id() from public;
grant execute on function public.fn_is_verus_staff() to authenticated;
grant execute on function public.fn_my_org_id() to authenticated;

-- Generic updated_at trigger, reused by any table below that has one.
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
