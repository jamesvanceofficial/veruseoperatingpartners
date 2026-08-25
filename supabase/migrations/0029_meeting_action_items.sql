create table public.meeting_action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  description text not null,
  assignee uuid references public.profiles(id) on delete set null,
  due_date date,
  status text not null default 'open',
  linked_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meeting_action_items
  add constraint meeting_action_items_status_check
    check (status in ('open', 'in_progress', 'complete', 'cancelled'));

create index idx_meeting_action_items_meeting on public.meeting_action_items(meeting_id);

create trigger trg_meeting_action_items_updated_at
  before update on public.meeting_action_items
  for each row execute function public.fn_set_updated_at();

alter table public.meeting_action_items enable row level security;

create policy meeting_action_items_isolation on public.meeting_action_items
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.meetings m
      where m.id = meeting_id and m.org_id = public.fn_my_org_id()
    )
  );

create policy meeting_action_items_staff_insert on public.meeting_action_items
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy meeting_action_items_staff_update on public.meeting_action_items
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy meeting_action_items_staff_delete on public.meeting_action_items
  for delete to authenticated using (public.fn_is_verus_staff());
