-- Stage 7: every question needs its four written answer choices (worth
-- 0/1/2/3) stored somewhere — nothing in the Stage 3 schema held them.
-- JSONB array of {value, label}, exactly 4 entries, checked at the DB
-- level. is_quick_scan flags the 2-per-category subset the free Quick
-- Scan uses; the Full Assessment uses every active question.
alter table public.assessment_questions
  add column answer_options jsonb not null default '[]'::jsonb,
  add column is_quick_scan boolean not null default false;

alter table public.assessment_questions alter column answer_options drop default;

alter table public.assessment_questions
  add constraint assessment_questions_answer_options_check
    check (jsonb_array_length(answer_options) = 4);
