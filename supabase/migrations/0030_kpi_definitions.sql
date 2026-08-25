create table public.kpi_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  unit text,
  scope text not null,
  higher_is_better boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kpi_definitions
  add constraint kpi_definitions_scope_check
    check (scope in ('verus_internal', 'client'));

create trigger trg_kpi_definitions_updated_at
  before update on public.kpi_definitions
  for each row execute function public.fn_set_updated_at();

alter table public.kpi_definitions enable row level security;

-- Client-scope definitions are readable by everyone (a client needs to
-- know what a KPI means to read their own values); verus_internal
-- definitions are staff-only.
create policy kpi_definitions_read on public.kpi_definitions
  for select to authenticated
  using (public.fn_is_verus_staff() or scope = 'client');

create policy kpi_definitions_staff_insert on public.kpi_definitions
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy kpi_definitions_staff_update on public.kpi_definitions
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy kpi_definitions_staff_delete on public.kpi_definitions
  for delete to authenticated using (public.fn_is_verus_staff());
