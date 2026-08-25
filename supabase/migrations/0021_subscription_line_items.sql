-- This table is where MRR actually lives: sum(monthly_price * quantity)
-- where end_date is null, grouped by the parent subscription's org_id, is
-- MRR per client with no guessing. subscriptions itself never stores a
-- price, so the header row and its priced components can never disagree.
create table public.subscription_line_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  item_type text not null,
  description text not null,
  monthly_price numeric not null,
  quantity int not null default 1,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscription_line_items
  add constraint subscription_line_items_type_check
    check (item_type in ('base_plan', 'addon', 'module', 'upgrade'));

alter table public.subscription_line_items
  add constraint subscription_line_items_dates_check
    check (end_date is null or end_date >= start_date);

create index idx_subscription_line_items_subscription on public.subscription_line_items(subscription_id);

create trigger trg_subscription_line_items_updated_at
  before update on public.subscription_line_items
  for each row execute function public.fn_set_updated_at();

alter table public.subscription_line_items enable row level security;

create policy subscription_line_items_isolation on public.subscription_line_items
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.org_id = public.fn_my_org_id()
    )
  );

create policy subscription_line_items_staff_insert on public.subscription_line_items
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy subscription_line_items_staff_update on public.subscription_line_items
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy subscription_line_items_staff_delete on public.subscription_line_items
  for delete to authenticated using (public.fn_is_verus_staff());
