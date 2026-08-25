create table public.support_ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_support_ticket_replies_ticket on public.support_ticket_replies(ticket_id);

alter table public.support_ticket_replies enable row level security;

create policy support_ticket_replies_isolation on public.support_ticket_replies
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.org_id = public.fn_my_org_id()
    )
  );

create policy support_ticket_replies_staff_insert on public.support_ticket_replies
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy support_ticket_replies_staff_update on public.support_ticket_replies
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy support_ticket_replies_staff_delete on public.support_ticket_replies
  for delete to authenticated using (public.fn_is_verus_staff());
