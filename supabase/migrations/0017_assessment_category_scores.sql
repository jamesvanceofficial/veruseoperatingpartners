create table public.assessment_category_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  category_id uuid references public.assessment_categories(id) on delete set null,
  raw_score numeric not null,
  weighted_score numeric not null,
  bottleneck_rank int,
  created_at timestamptz not null default now()
);

create unique index idx_assessment_category_scores_unique on public.assessment_category_scores(assessment_id, category_id);

alter table public.assessment_category_scores enable row level security;

create policy assessment_category_scores_isolation on public.assessment_category_scores
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.org_id = public.fn_my_org_id()
    )
  );

create policy assessment_category_scores_staff_insert on public.assessment_category_scores
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy assessment_category_scores_staff_update on public.assessment_category_scores
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy assessment_category_scores_staff_delete on public.assessment_category_scores
  for delete to authenticated using (public.fn_is_verus_staff());
