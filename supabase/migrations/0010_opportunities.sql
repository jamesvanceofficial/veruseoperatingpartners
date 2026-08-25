create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  stage text not null default 'lead',
  owner uuid references public.profiles(id) on delete set null,
  source text,
  expected_value numeric,
  probability int,
  lost_reason text,
  stage_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities
  add constraint opportunities_stage_check
    check (stage in (
      'lead', 'discovery_scheduled', 'discovery_completed', 'assessment_proposed',
      'assessment_sold', 'build_package_proposed', 'build_package_sold',
      'support_subscription_active', 'lost', 'nurture'
    ));

alter table public.opportunities
  add constraint opportunities_probability_check
    check (probability is null or (probability >= 0 and probability <= 100));

create index idx_opportunities_org on public.opportunities(org_id);

create trigger trg_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.fn_set_updated_at();

alter table public.opportunities enable row level security;

create policy opportunities_isolation on public.opportunities
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy opportunities_staff_insert on public.opportunities
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy opportunities_staff_update on public.opportunities
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy opportunities_staff_delete on public.opportunities
  for delete to authenticated using (public.fn_is_verus_staff());
