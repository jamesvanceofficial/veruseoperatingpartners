-- org_id nullable = internal-only document, staff-only visibility.
-- related_table/related_id are an optional polymorphic pointer, same
-- pattern and same caveat (no enforced FK) as revenue_transactions.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  category text,
  file_url text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  related_table text,
  related_id uuid,
  created_at timestamptz not null default now()
);

alter table public.documents
  add constraint documents_category_check
    check (category is null or category in ('contract', 'proposal', 'deliverable', 'report', 'other'));

create index idx_documents_org on public.documents(org_id);

alter table public.documents enable row level security;

create policy documents_isolation on public.documents
  for select to authenticated
  using (public.fn_is_verus_staff() or org_id = public.fn_my_org_id());

create policy documents_staff_insert on public.documents
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy documents_staff_update on public.documents
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy documents_staff_delete on public.documents
  for delete to authenticated using (public.fn_is_verus_staff());
