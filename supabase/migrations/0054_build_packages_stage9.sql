-- Stage 9 — Build Packages. Additive to the Stage-1 schema (0018/0019),
-- which defined build_packages/build_package_scope_items but never shipped
-- a UI for them.
--
-- assessment_id: the source assessment a package was created FROM (one
-- click, nothing retyped — see src/modules/buildPackages/generatePlan.ts).
-- Nullable — same convention as opportunity_id — the app layer requires it
-- on the one creation path that exists today.
--
-- handover_date: what the 90-day subscription billing counts from (see
-- computeFirstBillingDate() in assessments/buildTiers.ts). The 0018
-- migration already has an actual_completion_date column that was never
-- used anywhere in the app — rather than silently repurpose it (renaming
-- in place is against the migrations rule, and reusing it under a
-- different name in code while the schema still says
-- "actual_completion_date" would be a real trap for a future reader), it
-- stays as an unused leftover column and this migration adds a clearly-
-- named one instead.
alter table public.build_packages
  add column assessment_id uuid references public.assessments(id) on delete set null,
  add column handover_date date;

create index idx_build_packages_assessment on public.build_packages(assessment_id);

-- Phases carried over from the assessment's generated Scope of Work
-- (src/modules/assessments/scopeOfWork.ts) at creation time — a snapshot,
-- not a live link, same snapshot philosophy as assessment_answers: if the
-- question bank or tier config changes later, an already-created build
-- package's phases stay exactly what was agreed at signing.
create table public.build_package_phases (
  id uuid primary key default gen_random_uuid(),
  build_package_id uuid not null references public.build_packages(id) on delete cascade,
  phase_number int not null,
  name text not null,
  week_start int not null,
  week_end int not null,
  kind text not null,
  category_name text,
  category_score numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.build_package_phases
  add constraint build_package_phases_kind_check
    check (kind in ('scope-lock', 'bottleneck', 'portal', 'handover', 'custom'));

create index idx_build_package_phases_package on public.build_package_phases(build_package_id);

create trigger trg_build_package_phases_updated_at
  before update on public.build_package_phases
  for each row execute function public.fn_set_updated_at();

alter table public.build_package_phases enable row level security;

create policy build_package_phases_isolation on public.build_package_phases
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.build_packages bp
      where bp.id = build_package_id and bp.org_id = public.fn_my_org_id()
    )
  );

create policy build_package_phases_staff_insert on public.build_package_phases
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy build_package_phases_staff_update on public.build_package_phases
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy build_package_phases_staff_delete on public.build_package_phases
  for delete to authenticated using (public.fn_is_verus_staff());

-- Scope items now nest under a phase (table is empty in production today —
-- Build Packages never shipped a UI before this stage — so this is added
-- NOT NULL directly rather than as a nullable follow-up backfill).
alter table public.build_package_scope_items
  add column phase_id uuid not null references public.build_package_phases(id) on delete cascade;

create index idx_build_package_scope_items_phase on public.build_package_scope_items(phase_id);
