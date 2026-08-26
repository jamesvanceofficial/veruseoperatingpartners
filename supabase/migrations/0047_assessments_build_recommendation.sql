-- Stage 8: Build Recommendation Engine. recommended_build_tier already
-- existed (migration 0013) but was never populated or constrained; this
-- adds a check constraint to it and adds the rest of the recommendation +
-- override columns it needs alongside it.
alter table public.assessments
  add constraint assessments_recommended_build_tier_check
    check (recommended_build_tier is null or recommended_build_tier in ('foundation', 'growth', 'enterprise', 'custom'));

alter table public.assessments
  add column recommended_build_price numeric,
  add column build_recommendation_reasoning text,
  add column recommended_support_tier text
    check (recommended_support_tier is null or recommended_support_tier in ('base', 'growth', 'pro', 'enterprise', 'custom')),
  add column recommended_support_price numeric,
  add column support_recommendation_reasoning text,
  add column build_tier_override text
    check (build_tier_override is null or build_tier_override in ('foundation', 'growth', 'enterprise', 'custom')),
  add column build_tier_override_by uuid references public.profiles(id) on delete set null,
  add column build_tier_override_at timestamptz,
  add column support_tier_override text
    check (support_tier_override is null or support_tier_override in ('base', 'growth', 'pro', 'enterprise', 'custom')),
  add column support_tier_override_by uuid references public.profiles(id) on delete set null,
  add column support_tier_override_at timestamptz;
