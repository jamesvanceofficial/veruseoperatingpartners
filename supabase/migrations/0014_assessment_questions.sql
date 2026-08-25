-- Question bank structure only — no rows seeded here. The actual
-- questions are Stage 7 scope.
create table public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.assessment_categories(id) on delete restrict,
  question_text text not null,
  help_text text,
  answer_type text not null,
  weight numeric not null default 1,
  sort_order int not null default 0,
  version int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessment_questions
  add constraint assessment_questions_answer_type_check
    check (answer_type in ('scale', 'yes_no', 'multiple_choice'));

create index idx_assessment_questions_category on public.assessment_questions(category_id);

create trigger trg_assessment_questions_updated_at
  before update on public.assessment_questions
  for each row execute function public.fn_set_updated_at();

alter table public.assessment_questions enable row level security;

create policy assessment_questions_read on public.assessment_questions
  for select to authenticated using (true);

create policy assessment_questions_staff_insert on public.assessment_questions
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy assessment_questions_staff_update on public.assessment_questions
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy assessment_questions_staff_delete on public.assessment_questions
  for delete to authenticated using (public.fn_is_verus_staff());
