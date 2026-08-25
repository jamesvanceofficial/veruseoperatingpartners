create table public.client_sop_deliverables (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  source_sop_id uuid references public.sops(id) on delete set null,
  title text not null,
  content text,
  file_url text,
  delivered_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_sop_deliverables
  add constraint client_sop_deliverables_status_check
    check (status in ('draft', 'delivered', 'archived'));

create index idx_client_sop_deliverables_org on public.client_sop_deliverables(org_id);

create trigger trg_client_sop_deliverables_updated_at
  before update on public.client_sop_deliverables
  for each row execute function public.fn_set_updated_at();

alter table public.client_sop_deliverables enable row level security;

create policy client_sop_deliverables_isolation on public.client_sop_deliverables
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy client_sop_deliverables_staff_insert on public.client_sop_deliverables
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy client_sop_deliverables_staff_update on public.client_sop_deliverables
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy client_sop_deliverables_staff_delete on public.client_sop_deliverables
  for delete to authenticated using (public.fn_is_verus_staff());
