create table public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  build_package_id uuid references public.build_packages(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'not_started',
  start_date date,
  target_end_date date,
  actual_end_date date,
  owner uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects
  add constraint projects_status_check
    check (status in ('not_started', 'in_progress', 'on_hold', 'complete', 'cancelled'));

create index idx_projects_org on public.projects(org_id);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.fn_set_updated_at();

alter table public.projects enable row level security;

create policy projects_isolation on public.projects
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy projects_staff_insert on public.projects
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy projects_staff_update on public.projects
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy projects_staff_delete on public.projects
  for delete to authenticated using (public.fn_is_verus_staff());
