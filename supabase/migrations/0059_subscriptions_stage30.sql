-- Stage 30: Software, Systems & Support Subscriptions.
-- subscriptions/subscription_line_items already existed (Stage 3
-- foundation) — extending, not replacing, per the migrations rule.

-- ===========================================================
-- subscriptions: the literal first-billing date (90 days after the
-- source build package's handover_date, via the existing
-- computeFirstBillingDate() in assessments/buildTiers.ts). billing_notes
-- already covers "notes" from the request — not renamed.
-- ===========================================================
alter table subscriptions
  add column first_billing_date date;

comment on column subscriptions.first_billing_date is 'Stage 30 — set once at subscription creation from computeFirstBillingDate(build_package.handover_date). Never recomputed afterward, same snapshot convention as everywhere else a date gets carried over from a source record.';

-- ===========================================================
-- subscription_line_items: MRR needs to split by category (Stage 30
-- dashboard requirement) — an explicit column, not inferred from
-- description text, since the locked add-on list mixes software items
-- (extra seats, portal, automation builds, dev hours) with real agency
-- services (marketing/SEO/social/bookkeeping/VA staffing).
-- ===========================================================
alter table subscription_line_items
  add column revenue_category text not null default 'software';

alter table subscription_line_items
  add constraint subscription_line_items_revenue_category_check
  check (revenue_category in ('software', 'service'));

comment on column subscription_line_items.revenue_category is 'software = base plan, seats, portal, automations, dev hours. service = marketing/SEO/social/bookkeeping management and VA staffing (assignment fee + hourly). Set explicitly by whatever adds the line item — the locked catalog in supportAddOns.ts already knows which each one is.';
