create table public.client_health_scores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  period date not null,
  score numeric not null,
  status text not null,
  factors jsonb,
  notes text,
  calculated_at timestamptz not null default now()
);

alter table public.client_health_scores
  add constraint client_health_scores_status_check
    check (status in ('green', 'yellow', 'red'));

create unique index idx_client_health_scores_org_period on public.client_health_scores(org_id, period);

alter table public.client_health_scores enable row level security;

-- Staff-only, both read and write — internal scoring tool, not shown to
-- clients (confirmed decision).
create policy client_health_scores_staff_read on public.client_health_scores
  for select to authenticated using (public.fn_is_verus_staff());

create policy client_health_scores_staff_insert on public.client_health_scores
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy client_health_scores_staff_update on public.client_health_scores
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy client_health_scores_staff_delete on public.client_health_scores
  for delete to authenticated using (public.fn_is_verus_staff());
