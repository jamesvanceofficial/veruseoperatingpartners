-- Expands the stage-1 organizations stub into the full CRM entity: every
-- org VERUS does business with (prospects, clients, referral partners,
-- vendors, strategic opportunities). Additive only.
alter table public.organizations
  add column type text not null default 'prospect',
  add column status text not null default 'active',
  add column industry text,
  add column website text,
  add column phone text,
  add column primary_address text,
  add column employee_count_estimate int,
  add column annual_revenue_estimate numeric,
  add column source text,
  add column referred_by_org_id uuid references public.organizations(id) on delete set null,
  add column assigned_owner uuid references public.profiles(id) on delete set null,
  add column notes text,
  add column updated_at timestamptz not null default now();

alter table public.organizations
  add constraint organizations_type_check
    check (type in ('prospect', 'active_client', 'former_client', 'referral_partner', 'vendor', 'strategic_opportunity'));

alter table public.organizations
  add constraint organizations_status_check
    check (status in ('active', 'inactive'));

-- Defaults above only exist to satisfy the NOT NULL backfill on this
-- existing table; every future insert must choose explicitly.
alter table public.organizations alter column type drop default;
alter table public.organizations alter column status drop default;

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.fn_set_updated_at();

-- Read policy already exists from 0002 (staff see all, clients see own
-- org). Writes were entirely missing until now — staff-only, matches every
-- other CRM table in this schema.
create policy organizations_staff_insert on public.organizations
  for insert
  to authenticated
  with check (public.fn_is_verus_staff());

create policy organizations_staff_update on public.organizations
  for update
  to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy organizations_staff_delete on public.organizations
  for delete
  to authenticated
  using (public.fn_is_verus_staff());
