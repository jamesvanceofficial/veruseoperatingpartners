-- org_id is nullable to allow purely internal VERUS meetings
-- (meeting_type = 'internal') that aren't about any specific client.
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  meeting_type text not null,
  scheduled_at timestamptz,
  agenda text,
  notes text,
  decisions text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meetings
  add constraint meetings_type_check
    check (meeting_type in ('discovery', 'check_in', 'qbr', 'internal'));

create index idx_meetings_org on public.meetings(org_id);

create trigger trg_meetings_updated_at
  before update on public.meetings
  for each row execute function public.fn_set_updated_at();

alter table public.meetings enable row level security;

create policy meetings_isolation on public.meetings
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy meetings_staff_insert on public.meetings
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy meetings_staff_update on public.meetings
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy meetings_staff_delete on public.meetings
  for delete to authenticated using (public.fn_is_verus_staff());
