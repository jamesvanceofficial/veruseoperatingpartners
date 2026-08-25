create table public.opportunity_stage_history (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index idx_opportunity_stage_history_opportunity on public.opportunity_stage_history(opportunity_id);

alter table public.opportunity_stage_history enable row level security;

-- No org_id column here — this is a pure event log, not org-scoped data
-- itself, so visibility follows the parent opportunity's org via a join.
create policy opportunity_stage_history_isolation on public.opportunity_stage_history
  for select to authenticated
  using (
    public.fn_is_verus_staff()
    or exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id and o.org_id = public.fn_my_org_id()
    )
  );

-- Insert-only append log: staff can insert, no update/delete policy exists
-- at all — the log is immutable.
create policy opportunity_stage_history_staff_insert on public.opportunity_stage_history
  for insert to authenticated with check (public.fn_is_verus_staff());
