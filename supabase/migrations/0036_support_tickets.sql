create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  subject text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'open',
  opened_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_notes text,
  updated_at timestamptz not null default now()
);

alter table public.support_tickets
  add constraint support_tickets_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'));

alter table public.support_tickets
  add constraint support_tickets_status_check
    check (status in ('open', 'in_progress', 'waiting_on_client', 'resolved', 'closed'));

create index idx_support_tickets_org on public.support_tickets(org_id);

create trigger trg_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.fn_set_updated_at();

alter table public.support_tickets enable row level security;

-- Read = default org scoping (clients will get their own tickets when the
-- portal ships); write = staff only for now.
create policy support_tickets_isolation on public.support_tickets
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy support_tickets_staff_insert on public.support_tickets
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy support_tickets_staff_update on public.support_tickets
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy support_tickets_staff_delete on public.support_tickets
  for delete to authenticated using (public.fn_is_verus_staff());
