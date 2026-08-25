create table public.vendor_agreements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  agreement_type text not null,
  commission_type text not null,
  commission_value numeric not null,
  terms text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendor_agreements
  add constraint vendor_agreements_type_check
    check (agreement_type in ('referral_partner', 'vendor', 'white_label'));

alter table public.vendor_agreements
  add constraint vendor_agreements_commission_type_check
    check (commission_type in ('flat', 'percentage'));

alter table public.vendor_agreements
  add constraint vendor_agreements_status_check
    check (status in ('active', 'inactive'));

create index idx_vendor_agreements_org on public.vendor_agreements(org_id);

create trigger trg_vendor_agreements_updated_at
  before update on public.vendor_agreements
  for each row execute function public.fn_set_updated_at();

alter table public.vendor_agreements enable row level security;

create policy vendor_agreements_isolation on public.vendor_agreements
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy vendor_agreements_staff_insert on public.vendor_agreements
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy vendor_agreements_staff_update on public.vendor_agreements
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy vendor_agreements_staff_delete on public.vendor_agreements
  for delete to authenticated using (public.fn_is_verus_staff());
