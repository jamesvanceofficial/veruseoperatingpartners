-- 0042's partial unique index (`where question_id is not null`) cannot be
-- used as an ON CONFLICT target for the upsert in saveAnswer() — Postgres
-- requires the conflict target to exactly match an existing unique
-- index, predicate included, and Supabase's upsert only ever emits a
-- plain `ON CONFLICT (col, col)` with no predicate. Discovered via a live
-- end-to-end test against /api/public/scan, which failed on the very
-- first answer with "no unique or exclusion constraint matching the ON
-- CONFLICT specification."
--
-- The partial predicate was never actually needed: Postgres already
-- treats every NULL as distinct from every other NULL in a unique index,
-- partial or not, so multiple assessment_answers rows with
-- question_id = null (from a deleted question) were never going to
-- collide on uniqueness in the first place.
drop index public.idx_assessment_answers_unique_question;

create unique index idx_assessment_answers_unique_question
  on public.assessment_answers(assessment_id, question_id);
