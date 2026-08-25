-- Stage 6 (CRM Pipeline) needs opportunity fields Stage 3 didn't ship:
-- a human-readable name, the discovery-call fields, and the "what
-- happens next" fields the pipeline page surfaces as due/overdue next
-- actions. Table is empty (0 rows) so a NOT NULL column needs no default.
alter table public.opportunities
  add column name text not null,
  add column pain_points text,
  add column business_goals text,
  add column next_action text,
  add column next_action_date date,
  add column notes text;
