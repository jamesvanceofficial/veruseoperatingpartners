create table public.meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text,
  created_at timestamptz not null default now()
);

create index idx_meeting_attendees_meeting on public.meeting_attendees(meeting_id);

alter table public.meeting_attendees enable row level security;

create policy meeting_attendees_isolation on public.meeting_attendees
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.meetings m
      where m.id = meeting_id and m.org_id = public.fn_my_org_id()
    )
  );

create policy meeting_attendees_staff_insert on public.meeting_attendees
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy meeting_attendees_staff_update on public.meeting_attendees
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy meeting_attendees_staff_delete on public.meeting_attendees
  for delete to authenticated using (public.fn_is_verus_staff());
