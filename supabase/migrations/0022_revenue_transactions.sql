-- Append-only ledger of every actual money event (assessment fees, build
-- deposits/balances, subscription charges, vendor commissions, refunds).
-- related_table/related_id are a deliberate polymorphic pointer (no FK —
-- Postgres can't enforce a foreign key against a varying table) back to
-- whichever row generated the transaction.
create table public.revenue_transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  type text not null,
  amount numeric not null,
  direction text not null,
  related_table text,
  related_id uuid,
  transaction_date date not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.revenue_transactions
  add constraint revenue_transactions_type_check
    check (type in ('assessment_fee', 'build_deposit', 'build_balance', 'subscription_charge', 'vendor_commission', 'refund'));

alter table public.revenue_transactions
  add constraint revenue_transactions_direction_check
    check (direction in ('in', 'out'));

alter table public.revenue_transactions
  add constraint revenue_transactions_status_check
    check (status in ('pending', 'paid', 'refunded'));

create index idx_revenue_transactions_org on public.revenue_transactions(org_id);

create trigger trg_revenue_transactions_updated_at
  before update on public.revenue_transactions
  for each row execute function public.fn_set_updated_at();

alter table public.revenue_transactions enable row level security;

create policy revenue_transactions_isolation on public.revenue_transactions
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy revenue_transactions_staff_insert on public.revenue_transactions
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy revenue_transactions_staff_update on public.revenue_transactions
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy revenue_transactions_staff_delete on public.revenue_transactions
  for delete to authenticated using (public.fn_is_verus_staff());
