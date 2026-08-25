-- Snapshot columns (question_text_snapshot / category_id_snapshot /
-- weight_snapshot) are the point: they freeze the question exactly as it
-- was answered, so a completed assessment still displays and scores
-- correctly even after the question bank is edited later. question_id is
-- kept for traceability but is nullable and ON DELETE SET NULL — losing
-- the live question must never lose the historical answer.
create table public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid references public.assessment_questions(id) on delete set null,
  answer_value text,
  notes text,
  question_text_snapshot text not null,
  category_id_snapshot uuid references public.assessment_categories(id) on delete set null,
  weight_snapshot numeric not null,
  created_at timestamptz not null default now()
);

create index idx_assessment_answers_assessment on public.assessment_answers(assessment_id);

alter table public.assessment_answers enable row level security;

create policy assessment_answers_isolation on public.assessment_answers
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.org_id = public.fn_my_org_id()
    )
  );

create policy assessment_answers_staff_insert on public.assessment_answers
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy assessment_answers_staff_update on public.assessment_answers
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy assessment_answers_staff_delete on public.assessment_answers
  for delete to authenticated using (public.fn_is_verus_staff());
