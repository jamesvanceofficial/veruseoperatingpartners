-- Stage 31: Proposal Generator. A genuinely new table — proposals never
-- existed before this stage.
--
-- Staff-only read AND write, same convention as communication_log: a
-- prospect at proposal stage often has no login at all yet, so the
-- public share-link token (like the assessment's) is the real
-- client-facing distribution channel, not the authenticated app.
--
-- Content is snapshotted as editable text at generation time, never a
-- live link back to the assessment — requirement 3 is explicit that
-- edits must never write back to the source assessment, so nothing here
-- is computed at read time from the assessment; every displayed field is
-- a real column, edited directly.

create table proposals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,

  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  prepared_by uuid references profiles(id) on delete set null,
  proposal_date date not null default current_date,
  company_name text not null,

  -- Where things stand
  enterprise_score integer,
  band_label text,
  constraints_text text,

  -- What we recommend
  build_tier text,
  recommendation_text text,

  -- Scope of work
  scope_of_work_text text,

  -- What's included / excluded
  included_text text,
  excluded_text text,

  -- Timeline
  timeline_text text,

  -- Investment
  build_price numeric,
  payment_terms text not null default 'paid_in_full' check (payment_terms in ('paid_in_full', 'half_upfront')),
  deposit_amount numeric,
  balance_amount numeric,
  support_tier text,
  support_price_label text,
  first_year_value numeric,
  investment_notes text,

  -- Responsibilities
  verus_responsibilities_text text,
  client_responsibilities_text text,

  -- Next steps
  next_steps_text text,

  -- Acceptance
  signed_name text,
  signed_title text,
  sent_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  decline_reason text,

  -- Share link — same shape as assessments.share_token/_expires_at/_revoked_at
  share_token text unique,
  share_token_expires_at timestamptz,
  share_token_revoked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_proposals_org on proposals (org_id);
create index idx_proposals_assessment on proposals (assessment_id);
create index idx_proposals_share_token on proposals (share_token);

create trigger trg_proposals_updated_at before update on proposals
  for each row execute function fn_set_updated_at();

-- The automatic-RLS event trigger already turned RLS on for this table —
-- staff-only read and write, no client policy at all (see the doc
-- comment above for why).
create policy proposals_staff_select on proposals
  for select to authenticated
  using (fn_is_verus_staff());

create policy proposals_staff_insert on proposals
  for insert to authenticated
  with check (fn_is_verus_staff());

create policy proposals_staff_update on proposals
  for update to authenticated
  using (fn_is_verus_staff())
  with check (fn_is_verus_staff());

create policy proposals_staff_delete on proposals
  for delete to authenticated
  using (fn_is_verus_staff());
