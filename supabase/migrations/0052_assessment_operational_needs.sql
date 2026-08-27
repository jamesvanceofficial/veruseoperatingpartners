-- Stage 18: whether a business needs a client/partner portal, and which
-- specific repetitive tasks it wants automated, drive build scope and the
-- recommendation directly — they aren't tier-gated. One row per
-- assessment, every field optional, Full Assessment only. Same RLS shape
-- as the other three business-profile tables: no denormalized org_id, an
-- EXISTS join through the parent assessment, staff write-only.
create table public.assessment_operational_needs (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  portal_need text check (portal_need is null or portal_need in ('customers', 'partners', 'both', 'no')),
  portal_details text,
  automation_tasks text[] not null default '{}',
  automation_tasks_other text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessment_operational_needs enable row level security;

create policy "assessment_operational_needs_isolation" on public.assessment_operational_needs
  for select to authenticated
  using (fn_is_verus_staff() or exists (select 1 from public.assessments a where a.id = assessment_operational_needs.assessment_id and a.org_id = fn_my_org_id()));
create policy "assessment_operational_needs_staff_insert" on public.assessment_operational_needs for insert to authenticated with check (fn_is_verus_staff());
create policy "assessment_operational_needs_staff_update" on public.assessment_operational_needs for update to authenticated using (fn_is_verus_staff()) with check (fn_is_verus_staff());
create policy "assessment_operational_needs_staff_delete" on public.assessment_operational_needs for delete to authenticated using (fn_is_verus_staff());
