-- Some assessment questions genuinely don't apply to a given business
-- (e.g. inventory purchasing for a pure services company). Marking a
-- question not-applicable must NOT score as zero and must be stored
-- distinctly from "not answered yet" — is_not_applicable=true with
-- answer_value=null is that distinct state; no row at all is still
-- "unanswered". not_applicable_count on the category rollup drives the
-- report's low-confidence flag (see recomputeAndSaveScores).
alter table public.assessment_answers add column is_not_applicable boolean not null default false;
alter table public.assessment_category_scores add column not_applicable_count integer not null default 0;
