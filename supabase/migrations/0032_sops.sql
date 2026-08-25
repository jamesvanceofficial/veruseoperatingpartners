-- Internal master SOP library — never client-visible. See
-- client_sop_deliverables (0033) for the client-facing artifact.
create table public.sops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  content text,
  file_url text,
  version int not null default 1,
  owner uuid references public.profiles(id) on delete set null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sops
  add constraint sops_status_check check (status in ('draft', 'published', 'archived'));

create trigger trg_sops_updated_at
  before update on public.sops
  for each row execute function public.fn_set_updated_at();

alter table public.sops enable row level security;

create policy sops_staff_read on public.sops
  for select to authenticated using (public.fn_is_verus_staff());

create policy sops_staff_insert on public.sops
  for insert to authenticated with check (public.fn_is_verus_staff());

create policy sops_staff_update on public.sops
  for update to authenticated
  using (public.fn_is_verus_staff())
  with check (public.fn_is_verus_staff());

create policy sops_staff_delete on public.sops
  for delete to authenticated using (public.fn_is_verus_staff());
