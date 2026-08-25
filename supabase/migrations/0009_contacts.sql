create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  title text,
  contact_role text,
  email text,
  phone text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts
  add constraint contacts_role_check
    check (contact_role is null or contact_role in ('owner', 'executive', 'manager', 'vendor_contact', 'referral_partner'));

create index idx_contacts_org on public.contacts(org_id);

create trigger trg_contacts_updated_at
  before update on public.contacts
  for each row execute function public.fn_set_updated_at();

alter table public.contacts enable row level security;

create policy contacts_isolation on public.contacts
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy contacts_staff_insert on public.contacts
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy contacts_staff_update on public.contacts
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy contacts_staff_delete on public.contacts
  for delete to authenticated using (public.fn_is_verus_staff());
