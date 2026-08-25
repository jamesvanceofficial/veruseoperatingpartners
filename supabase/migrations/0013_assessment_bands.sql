create table public.assessment_bands (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  min_score numeric not null,
  max_score numeric not null,
  description text,
  sort_order int not null,
  created_at timestamptz not null default now()
);

alter table public.assessment_bands
  add constraint assessment_bands_range_check check (min_score <= max_score);

alter table public.assessment_bands enable row level security;

create policy assessment_bands_read on public.assessment_bands
  for select to authenticated using (true);

create policy assessment_bands_staff_insert on public.assessment_bands
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy assessment_bands_staff_update on public.assessment_bands
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy assessment_bands_staff_delete on public.assessment_bands
  for delete to authenticated using (public.fn_is_verus_staff());

insert into public.assessment_bands (label, min_score, max_score, sort_order) values
  ('Founder Dependent', 0, 39, 1),
  ('Emerging Operator', 40, 59, 2),
  ('Growth Company', 60, 79, 3),
  ('System-Driven Company', 80, 89, 4),
  ('Enterprise Ready', 90, 100, 5);
