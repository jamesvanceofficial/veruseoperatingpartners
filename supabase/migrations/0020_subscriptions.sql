create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  build_package_id uuid references public.build_packages(id) on delete set null,
  plan_name text not null,
  status text not null default 'active',
  seats int,
  start_date date not null,
  renewal_date date,
  cancelled_at timestamptz,
  billing_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions
  add constraint subscriptions_status_check
    check (status in ('active', 'paused', 'cancelled', 'past_due'));

create index idx_subscriptions_org on public.subscriptions(org_id);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.fn_set_updated_at();

alter table public.subscriptions enable row level security;

create policy subscriptions_isolation on public.subscriptions
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy subscriptions_staff_insert on public.subscriptions
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy subscriptions_staff_update on public.subscriptions
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy subscriptions_staff_delete on public.subscriptions
  for delete to authenticated using (public.fn_is_verus_staff());
