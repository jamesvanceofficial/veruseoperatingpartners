-- org_id is nullable: most tasks belong to a client org, but a task can
-- also be purely internal (not tied to any project or client). Nulls are
-- automatically invisible to client roles under the isolation policy below.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  assignee uuid references public.profiles(id) on delete set null,
  status text not null default 'open',
  priority text not null default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks
  add constraint tasks_status_check
    check (status in ('open', 'in_progress', 'blocked', 'complete', 'cancelled'));

alter table public.tasks
  add constraint tasks_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'));

create index idx_tasks_org on public.tasks(org_id);
create index idx_tasks_project on public.tasks(project_id);

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.fn_set_updated_at();

alter table public.tasks enable row level security;

create policy tasks_isolation on public.tasks
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

-- Staff-only writes, no exceptions — client write access (e.g. an
-- assignee marking their own task done) is deferred to Stage 17's client
-- portal, per decision.
create policy tasks_staff_insert on public.tasks
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy tasks_staff_update on public.tasks
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy tasks_staff_delete on public.tasks
  for delete to authenticated using (public.fn_is_verus_staff());
