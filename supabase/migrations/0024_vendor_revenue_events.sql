create table public.vendor_revenue_events (
  id uuid primary key default gen_random_uuid(),
  vendor_agreement_id uuid not null references public.vendor_agreements(id) on delete cascade,
  source_org_id uuid not null references public.organizations(id) on delete cascade,
  amount numeric not null,
  event_date date not null,
  status text not null default 'pending',
  revenue_transaction_id uuid references public.revenue_transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendor_revenue_events
  add constraint vendor_revenue_events_status_check
    check (status in ('pending', 'paid'));

create index idx_vendor_revenue_events_agreement on public.vendor_revenue_events(vendor_agreement_id);
create index idx_vendor_revenue_events_source_org on public.vendor_revenue_events(source_org_id);

create trigger trg_vendor_revenue_events_updated_at
  before update on public.vendor_revenue_events
  for each row execute function public.fn_set_updated_at();

alter table public.vendor_revenue_events enable row level security;

-- Visible to staff, and to the vendor org whose agreement generated it —
-- deliberately NOT to source_org_id, which would leak a vendor's
-- commission rate to the client that triggered it.
create policy vendor_revenue_events_isolation on public.vendor_revenue_events
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.vendor_agreements va
      where va.id = vendor_agreement_id and va.org_id = public.fn_my_org_id()
    )
  );

create policy vendor_revenue_events_staff_insert on public.vendor_revenue_events
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy vendor_revenue_events_staff_update on public.vendor_revenue_events
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy vendor_revenue_events_staff_delete on public.vendor_revenue_events
  for delete to authenticated using (public.fn_is_verus_staff());
