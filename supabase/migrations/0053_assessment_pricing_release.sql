-- Stage 22 — pricing release control. James presents assessment findings
-- to a client first and reveals dollar figures only when he chooses.
-- Additive only, per the migrations rule.

alter table assessments
  add column pricing_released boolean not null default false,
  add column pricing_released_at timestamptz,
  add column pricing_released_by uuid references profiles(id);
