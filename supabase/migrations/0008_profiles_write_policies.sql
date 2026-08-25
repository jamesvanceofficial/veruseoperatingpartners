-- Profiles has had no write policy since 0003 — every write so far has
-- gone through the service-role client. This adds real RLS write rules:
-- staff can insert/update any profile; a signed-in user can update their
-- own row, but a trigger blocks them from changing their own role or
-- org_id (privilege-escalation guard — RLS's WITH CHECK can't compare
-- against the pre-update row, so this needs a trigger, not a policy
-- predicate).
create or replace function public.fn_prevent_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if not public.fn_is_verus_staff() then
    if new.role is distinct from old.role or new.org_id is distinct from old.org_id then
      raise exception 'cannot change your own role or organization';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_prevent_self_role_change
  before update on public.profiles
  for each row execute function public.fn_prevent_self_role_change();

create policy profiles_staff_insert on public.profiles
  for insert
  to authenticated
  with check (public.fn_is_verus_staff());

create policy profiles_staff_update on public.profiles
  for update
  to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

-- Permissive policies OR together: a self-update is authorized here even
-- though it fails profiles_staff_update, and the trigger above still
-- blocks role/org_id changes regardless of which policy authorized the
-- statement.
create policy profiles_self_update on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
