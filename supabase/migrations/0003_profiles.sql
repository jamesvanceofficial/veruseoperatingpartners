create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null check (role in ('verus_admin', 'verus_staff', 'client_owner', 'client_user')),
  org_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now()
);

-- client_owner/client_user must always have an org; verus_admin/verus_staff
-- are not scoped to a single org (they see everything), so org_id is null
-- for them. Enforced here rather than left implicit.
alter table public.profiles add constraint profiles_client_requires_org
  check (role in ('verus_admin', 'verus_staff') or org_id is not null);

create index idx_profiles_org on public.profiles(org_id);

alter table public.profiles enable row level security;

-- Every authenticated user can always read their own profile row (needed
-- to resolve their own role/org on login, before any org-scoped data
-- loads). Staff can read every profile. No one else can read another
-- user's profile in this stage — cross-org visibility is not requested.
create policy profiles_isolation on public.profiles
  for select
  to authenticated
  using (public.fn_is_verus_staff() or id = auth.uid());
