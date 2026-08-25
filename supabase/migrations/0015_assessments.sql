create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  conducted_by uuid references public.profiles(id) on delete set null,
  status text not null default 'draft',
  started_at timestamptz,
  completed_at timestamptz,
  enterprise_score numeric,
  band_id uuid references public.assessment_bands(id) on delete set null,
  recommended_build_tier text,
  price_paid numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessments
  add constraint assessments_status_check
    check (status in ('draft', 'in_progress', 'completed'));

create index idx_assessments_org on public.assessments(org_id);

create trigger trg_assessments_updated_at
  before update on public.assessments
  for each row execute function public.fn_set_updated_at();

alter table public.assessments enable row level security;

create policy assessments_isolation on public.assessments
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy assessments_staff_insert on public.assessments
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy assessments_staff_update on public.assessments
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy assessments_staff_delete on public.assessments
  for delete to authenticated using (public.fn_is_verus_staff());
