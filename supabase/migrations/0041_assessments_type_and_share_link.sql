-- Stage 7: two assessment types sharing one engine (Quick Scan vs Full),
-- and the share-link mechanism so a client can fill out a Full
-- Assessment themselves without a COMPASS login. The token is the only
-- credential — public routes resolve it to exactly one assessment row
-- and never accept a client-supplied id (see /api/public/assessment).
alter table public.assessments
  add column assessment_type text not null default 'full',
  add column share_token text,
  add column share_token_expires_at timestamptz,
  add column share_token_revoked_at timestamptz;

alter table public.assessments alter column assessment_type drop default;

alter table public.assessments
  add constraint assessments_type_check check (assessment_type in ('quick_scan', 'full'));

create unique index idx_assessments_share_token on public.assessments(share_token) where share_token is not null;
