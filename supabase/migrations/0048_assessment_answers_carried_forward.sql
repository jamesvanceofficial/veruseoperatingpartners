-- Carry-forward from a completed Quick Scan into a new Full Assessment for
-- the same org. Non-null only for an answer copied in at assessment
-- creation and never since touched via the normal save path (saveAnswer
-- always writes this back to null) — so it doubles as both "show the
-- carried marker" and "this row is eligible for the clear-and-start-fresh
-- action" with no separate flag needed.
alter table public.assessment_answers add column carried_forward_at timestamptz;
