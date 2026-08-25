create table public.communication_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  type text not null,
  direction text,
  subject text,
  body text not null,
  occurred_at timestamptz not null default now(),
  logged_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.communication_log
  add constraint communication_log_type_check
    check (type in ('call', 'email', 'note'));

alter table public.communication_log
  add constraint communication_log_direction_check
    check (direction is null or direction in ('inbound', 'outbound'));

create index idx_communication_log_org on public.communication_log(org_id);

alter table public.communication_log enable row level security;

-- Staff-only, both read and write — deliberately not the default org
-- scoping every other table uses, per decision.
create policy communication_log_staff_read on public.communication_log
  for select to authenticated using (public.fn_is_verus_staff());

create policy communication_log_staff_insert on public.communication_log
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy communication_log_staff_update on public.communication_log
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy communication_log_staff_delete on public.communication_log
  for delete to authenticated using (public.fn_is_verus_staff());
