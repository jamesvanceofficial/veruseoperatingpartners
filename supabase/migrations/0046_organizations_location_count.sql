-- Stage 8 (Build Recommendation Engine) needs location count as one of the
-- recommendation algorithm's inputs, alongside the existing
-- employee_count_estimate / annual_revenue_estimate fields.
alter table public.organizations add column location_count integer;
