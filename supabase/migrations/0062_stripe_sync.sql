-- Read-only Stripe sync. A mirror of the connected Stripe account's
-- subscriptions, refreshed hourly and on demand by
-- src/modules/stripe/sync.ts — nothing in this app ever writes to Stripe.
-- The dashboard MRR tiles read from here instead of hand-entered
-- subscription_line_items.
--
-- RLS: staff-only read, no write policy at all. Every write goes through
-- the server-side sync / attach route using the admin client (after the
-- route's own staff check), same as app_settings. Staff-only read because
-- this table holds every Stripe customer's name and email — including
-- product-plan subscribers who are not COMPASS clients — so it must never
-- follow the default org-scoped client-read shape.

create table stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  customer_email text,
  customer_name text,
  -- Summary of every item, e.g. "Verus Trading Bot + Extra broker account ×2".
  product_name text not null,
  -- The first (primary) item's own price/quantity/interval; the full
  -- per-item breakdown lives in `items`.
  unit_amount numeric(12, 2),
  quantity integer,
  billing_interval text,
  items jsonb not null default '[]'::jsonb,
  -- Monthly-normalized sum of every item (unit_amount × quantity, scaled
  -- by interval) — what the MRR tiles add up.
  mrr numeric(12, 2) not null default 0,
  status text not null,
  -- True when every item is a product-style plan (Verus Trading Bot and
  -- its add-ons — see PRODUCT_PLAN_PRODUCT_IDS in src/modules/stripe/config.ts).
  -- Those are individual subscribers, never COMPASS organizations: they
  -- count as Software MRR and are never matched or flagged as unmatched.
  is_product_plan boolean not null default false,
  stripe_created_at timestamptz not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  next_invoice_date timestamptz,
  next_invoice_amount numeric(12, 2),
  -- The next scheduled change from the subscription's Stripe schedule
  -- (null when nothing is scheduled): when it takes effect, the MRR it
  -- moves to, and the items it moves to.
  scheduled_change_at timestamptz,
  scheduled_mrr numeric(12, 2),
  scheduled_items jsonb,
  org_id uuid references organizations (id) on delete set null,
  match_method text check (match_method in ('email', 'name', 'manual')),
  matched_at timestamptz,
  matched_by uuid references profiles (id) on delete set null,
  last_synced_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_subscriptions_match_consistent check ((org_id is null) = (match_method is null))
);

create index stripe_subscriptions_org_id_idx on stripe_subscriptions (org_id);

create trigger trg_stripe_subscriptions_updated_at before update on stripe_subscriptions
  for each row execute function fn_set_updated_at();

alter table stripe_subscriptions enable row level security;
create policy stripe_subscriptions_staff_read on stripe_subscriptions
  for select to authenticated using (public.fn_is_verus_staff());

create table stripe_sync_runs (
  id uuid primary key default gen_random_uuid(),
  trigger text not null check (trigger in ('schedule', 'manual')),
  triggered_by uuid references profiles (id) on delete set null,
  status text not null default 'running' check (status in ('running', 'success', 'error')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  subscriptions_synced integer,
  newly_matched integer,
  error text
);

create index stripe_sync_runs_started_at_idx on stripe_sync_runs (started_at desc);

alter table stripe_sync_runs enable row level security;
create policy stripe_sync_runs_staff_read on stripe_sync_runs
  for select to authenticated using (public.fn_is_verus_staff());
