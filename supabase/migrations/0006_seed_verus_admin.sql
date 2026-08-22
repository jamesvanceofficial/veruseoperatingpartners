-- Seeds James's verus_admin profile. The auth.users row itself was created
-- via the Supabase Auth Admin API (not raw SQL — inserting into auth.users
-- directly is unsupported/fragile), email jamesvanceofficial@gmail.com,
-- id fixed below. Re-running this is safe (upsert).
insert into public.profiles (id, full_name, email, role, org_id)
values (
  '8ddb6a8b-8f3a-424b-997f-d8e134e8466b',
  'James Vance',
  'jamesvanceofficial@gmail.com',
  'verus_admin',
  null
)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role;
