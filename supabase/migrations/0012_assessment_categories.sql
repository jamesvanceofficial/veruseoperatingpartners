create table public.assessment_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null,
  weight numeric not null,
  created_at timestamptz not null default now()
);

alter table public.assessment_categories enable row level security;

-- Taxonomy, not org-scoped data — every authenticated user can read it.
create policy assessment_categories_read on public.assessment_categories
  for select to authenticated using (true);

create policy assessment_categories_staff_insert on public.assessment_categories
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy assessment_categories_staff_update on public.assessment_categories
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy assessment_categories_staff_delete on public.assessment_categories
  for delete to authenticated using (public.fn_is_verus_staff());

-- Locked VERUS category weights (sum to 100).
insert into public.assessment_categories (name, sort_order, weight) values
  ('Operations', 1, 20),
  ('Systems', 2, 15),
  ('People', 3, 15),
  ('Leadership', 4, 12),
  ('Sales', 5, 10),
  ('Finance', 6, 10),
  ('Technology', 7, 8),
  ('Marketing', 8, 5),
  ('Vision', 9, 3),
  ('Enterprise Readiness', 10, 2);
