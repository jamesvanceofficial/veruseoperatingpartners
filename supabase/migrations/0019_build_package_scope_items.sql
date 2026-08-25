create table public.build_package_scope_items (
  id uuid primary key default gen_random_uuid(),
  build_package_id uuid not null references public.build_packages(id) on delete cascade,
  scope_category text not null,
  description text not null,
  status text not null default 'not_started',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.build_package_scope_items
  add constraint build_package_scope_items_category_check
    check (scope_category in ('website', 'software', 'sop_documents', 'automation', 'dashboards', 'support'));

alter table public.build_package_scope_items
  add constraint build_package_scope_items_status_check
    check (status in ('not_started', 'in_progress', 'complete'));

create index idx_build_package_scope_items_package on public.build_package_scope_items(build_package_id);

create trigger trg_build_package_scope_items_updated_at
  before update on public.build_package_scope_items
  for each row execute function public.fn_set_updated_at();

alter table public.build_package_scope_items enable row level security;

create policy build_package_scope_items_isolation on public.build_package_scope_items
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.build_packages bp
      where bp.id = build_package_id and bp.org_id = public.fn_my_org_id()
    )
  );

create policy build_package_scope_items_staff_insert on public.build_package_scope_items
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy build_package_scope_items_staff_update on public.build_package_scope_items
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy build_package_scope_items_staff_delete on public.build_package_scope_items
  for delete to authenticated using (public.fn_is_verus_staff());
