-- Stage 1 scope only: id, name, created_at. Do not add columns here —
-- the full organizations schema comes in a later build.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- verus_admin/verus_staff see every org. client_owner/client_user see only
-- the one org their profile is scoped to (fn_my_org_id() reads their own
-- profiles row) — they can never see another org's row.
create policy organizations_isolation on public.organizations
  for select
  to authenticated
  using (public.fn_is_verus_staff() or id = public.fn_my_org_id());
