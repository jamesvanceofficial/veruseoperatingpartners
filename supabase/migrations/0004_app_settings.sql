-- Single global settings row (id is always 1). Stage 1 only needs the
-- brand logo; do not add columns beyond what's requested.
create table public.app_settings (
  id int primary key default 1,
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.fn_set_updated_at();

insert into public.app_settings (id, logo_url) values (1, null);

alter table public.app_settings enable row level security;

-- Deliberately public (anon + authenticated): the login page renders the
-- brand logo before anyone is signed in, and this row holds nothing
-- sensitive — just a public storage URL. Writes still go through a
-- server route that checks fn_is_verus_staff() first (see the "brand"
-- storage bucket policy in the next migration for the same pattern).
create policy app_settings_public_read on public.app_settings
  for select
  to anon, authenticated
  using (true);
