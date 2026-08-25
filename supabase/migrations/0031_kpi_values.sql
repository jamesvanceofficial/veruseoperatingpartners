-- org_id null = a VERUS-internal KPI value; org_id set = a client KPI,
-- visible to that client too.
create table public.kpi_values (
  id uuid primary key default gen_random_uuid(),
  kpi_definition_id uuid not null references public.kpi_definitions(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  value numeric not null,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now()
);

alter table public.kpi_values
  add constraint kpi_values_period_check check (period_end >= period_start);

create index idx_kpi_values_org on public.kpi_values(org_id);
create index idx_kpi_values_definition on public.kpi_values(kpi_definition_id);

alter table public.kpi_values enable row level security;

create policy kpi_values_isolation on public.kpi_values
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy kpi_values_staff_insert on public.kpi_values
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy kpi_values_staff_update on public.kpi_values
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy kpi_values_staff_delete on public.kpi_values
  for delete to authenticated using (public.fn_is_verus_staff());
