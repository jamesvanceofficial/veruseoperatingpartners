-- answer_options_snapshot extends the existing snapshot pattern (Stage 3)
-- to cover the new answer_options column — a completed assessment's
-- report must still show the exact wording of the choice someone picked
-- even if the live question bank's option text changes later.
--
-- The unique index makes an answer upsertable on (assessment_id,
-- question_id): re-answering a question during an active session updates
-- the same row instead of creating a duplicate. Partial (question_id is
-- not null) because a deleted question sets existing answers' question_id
-- to null via ON DELETE SET NULL, and those historical rows must never
-- collide with each other on uniqueness.
alter table public.assessment_answers
  add column answer_options_snapshot jsonb;

create unique index idx_assessment_answers_unique_question
  on public.assessment_answers(assessment_id, question_id)
  where question_id is not null;
