-- Stage 29: Support Ticket System.
-- support_tickets/support_ticket_replies already existed (Stage 3
-- foundation) but were never built on — extending, not replacing, per
-- the migrations rule.

-- ===========================================================
-- subscriptions: a structured support tier, needed to compute a
-- ticket's response-due SLA. plan_name is free text (a display label),
-- never guaranteed to match the SupportTier enum used everywhere else
-- in the app (base/growth/pro/enterprise/custom) — this is the first
-- place that needs a real, structured value to compute against.
-- ===========================================================
alter table subscriptions
  add column support_tier text;

alter table subscriptions
  add constraint subscriptions_support_tier_check
  check (support_tier is null or support_tier in ('base', 'growth', 'pro', 'enterprise', 'custom'));

-- ===========================================================
-- support_tickets: real statuses (the Stage 3 placeholder set had
-- 'in_progress' instead of 'new', and no 'new' at all), response-time
-- tracking columns. Table is empty in production, so redefining the
-- check constraint outright is safe — no existing row uses a value
-- being removed.
-- ===========================================================
alter table support_tickets
  drop constraint support_tickets_status_check;

alter table support_tickets
  add constraint support_tickets_status_check
  check (status in ('new', 'open', 'waiting_on_client', 'resolved', 'closed'));

alter table support_tickets
  alter column status set default 'new';

alter table support_tickets
  add column response_due_at timestamptz,
  add column first_responded_at timestamptz;

comment on column support_tickets.response_due_at is 'Computed once at creation from the org''s subscription support tier (see support/sla.ts) — a snapshot, never recomputed if the subscription''s tier changes later.';
comment on column support_tickets.first_responded_at is 'Stamped the first time a non-internal staff reply is added — once set, the ticket can no longer show as overdue regardless of response_due_at.';

-- A client can open a ticket for their own org. Staff can already
-- insert via support_tickets_staff_insert; this adds the client path
-- alongside it, per the Role model's fn_my_org_id() convention.
create policy support_tickets_client_insert on support_tickets
  for insert to authenticated
  with check (org_id = fn_my_org_id());

-- ===========================================================
-- support_ticket_replies: internal notes (staff-only, never visible to
-- a client) share this table with real replies rather than a separate
-- one, distinguished by is_internal.
-- ===========================================================
alter table support_ticket_replies
  add column is_internal boolean not null default false;

comment on column support_ticket_replies.is_internal is 'true = staff-only internal note, never returned to a client_owner/client_user regardless of org match.';

-- A client can reply to their own org's ticket (never as an internal
-- note — enforced in the WITH CHECK, not just the app layer). This is
-- what makes the pre-existing waiting_on_client status able to ever
-- resolve: without it, a client could never actually respond.
create policy support_ticket_replies_client_insert on support_ticket_replies
  for insert to authenticated
  with check (
    is_internal = false
    and exists (select 1 from support_tickets t where t.id = ticket_id and t.org_id = fn_my_org_id())
  );

-- Replace the read policy so a client never sees an internal note, even
-- one left on their own org's ticket.
drop policy support_ticket_replies_isolation on support_ticket_replies;

create policy support_ticket_replies_isolation on support_ticket_replies
  for select to authenticated
  using (
    fn_is_verus_staff()
    or (
      is_internal = false
      and exists (select 1 from support_tickets t where t.id = ticket_id and t.org_id = fn_my_org_id())
    )
  );
