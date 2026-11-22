-- Demo flag on organizations. A demo organization (e.g. Northline
-- Mechanical, the fictional company used for website screenshots) keeps
-- its real type — it stays an active_client so the screenshots look
-- right — but is skipped by the dashboard data-quality check that warns
-- when an active client has no linked Stripe subscription.
-- Additive only, per the migrations rule.

alter table organizations
  add column is_demo boolean not null default false;

comment on column organizations.is_demo is 'True for a fictional demo organization (marketing screenshots). Excluded from the dashboard data-quality check; never changes the organization''s type.';

update organizations set is_demo = true where name = 'Northline Mechanical';
