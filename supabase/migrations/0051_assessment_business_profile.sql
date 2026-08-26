-- Financial profile, business presence, and workforce — captured once per
-- FULL assessment (never quick_scan), as a point-in-time snapshot so it
-- can be compared across reassessments later. One row per assessment,
-- every column nullable (every field is optional). Same RLS shape as
-- assessment_answers: no denormalized org_id — a join through the parent
-- assessment instead, since these are 1:1 children of one assessment, not
-- independently org-scoped rows.

create table public.assessment_financial_profiles (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  last_full_year_revenue numeric,
  current_year_revenue numeric,
  gross_profit_margin_pct numeric,
  net_profit_margin_pct numeric,
  net_profit_last_year numeric,
  monthly_overhead numeric,
  payroll_pct_of_revenue numeric,
  cash_on_hand numeric,
  accounts_receivable_outstanding numeric,
  largest_customer_pct_of_revenue numeric,
  owners_compensation numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_business_presence (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  physical_location text check (physical_location is null or physical_location in ('yes', 'no', 'home_based')),
  physical_address text,
  has_website boolean,
  website_url text,
  -- linkedin / facebook / instagram / tiktok / youtube / twitter / google_business / none
  social_channels text[] not null default '{}',
  reviews_status text check (reviews_status is null or reviews_status in ('none', 'some', 'active')),
  email_domain_status text check (email_domain_status is null or email_domain_status in ('own_domain', 'personal', 'mixed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_workforce (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  w2_employee_count integer,
  contractor_count integer,
  va_count integer,
  management_count integer,
  staffing_feeling text check (staffing_feeling is null or staffing_feeling in ('understaffed', 'about_right', 'overstaffed')),
  actively_hiring boolean,
  hiring_roles text,
  time_to_fill text check (time_to_fill is null or time_to_fill in ('under_2_weeks', '2_4_weeks', '1_3_months', 'longer', 'struggle')),
  turnover_pct numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessment_financial_profiles enable row level security;
alter table public.assessment_business_presence enable row level security;
alter table public.assessment_workforce enable row level security;

create policy "assessment_financial_profiles_isolation" on public.assessment_financial_profiles
  for select to authenticated
  using (fn_is_verus_staff() or exists (select 1 from public.assessments a where a.id = assessment_financial_profiles.assessment_id and a.org_id = fn_my_org_id()));
create policy "assessment_financial_profiles_staff_insert" on public.assessment_financial_profiles for insert to authenticated with check (fn_is_verus_staff());
create policy "assessment_financial_profiles_staff_update" on public.assessment_financial_profiles for update to authenticated using (fn_is_verus_staff()) with check (fn_is_verus_staff());
create policy "assessment_financial_profiles_staff_delete" on public.assessment_financial_profiles for delete to authenticated using (fn_is_verus_staff());

create policy "assessment_business_presence_isolation" on public.assessment_business_presence
  for select to authenticated
  using (fn_is_verus_staff() or exists (select 1 from public.assessments a where a.id = assessment_business_presence.assessment_id and a.org_id = fn_my_org_id()));
create policy "assessment_business_presence_staff_insert" on public.assessment_business_presence for insert to authenticated with check (fn_is_verus_staff());
create policy "assessment_business_presence_staff_update" on public.assessment_business_presence for update to authenticated using (fn_is_verus_staff()) with check (fn_is_verus_staff());
create policy "assessment_business_presence_staff_delete" on public.assessment_business_presence for delete to authenticated using (fn_is_verus_staff());

create policy "assessment_workforce_isolation" on public.assessment_workforce
  for select to authenticated
  using (fn_is_verus_staff() or exists (select 1 from public.assessments a where a.id = assessment_workforce.assessment_id and a.org_id = fn_my_org_id()));
create policy "assessment_workforce_staff_insert" on public.assessment_workforce for insert to authenticated with check (fn_is_verus_staff());
create policy "assessment_workforce_staff_update" on public.assessment_workforce for update to authenticated using (fn_is_verus_staff()) with check (fn_is_verus_staff());
create policy "assessment_workforce_staff_delete" on public.assessment_workforce for delete to authenticated using (fn_is_verus_staff());
