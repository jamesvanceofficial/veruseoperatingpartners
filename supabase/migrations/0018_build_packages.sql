create table public.build_packages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  tier text not null,
  status text not null default 'proposed',
  price numeric,
  deposit_amount numeric,
  deposit_paid_at timestamptz,
  balance_amount numeric,
  balance_paid_at timestamptz,
  start_date date,
  target_completion_date date,
  actual_completion_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.build_packages
  add constraint build_packages_tier_check
    check (tier in ('foundation', 'growth', 'enterprise', 'custom'));

alter table public.build_packages
  add constraint build_packages_status_check
    check (status in ('proposed', 'sold', 'in_progress', 'complete', 'cancelled'));

create index idx_build_packages_org on public.build_packages(org_id);

create trigger trg_build_packages_updated_at
  before update on public.build_packages
  for each row execute function public.fn_set_updated_at();

alter table public.build_packages enable row level security;

create policy build_packages_isolation on public.build_packages
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy build_packages_staff_insert on public.build_packages
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy build_packages_staff_update on public.build_packages
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy build_packages_staff_delete on public.build_packages
  for delete to authenticated using (public.fn_is_verus_staff());
