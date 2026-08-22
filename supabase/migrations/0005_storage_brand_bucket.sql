-- Public bucket for the brand logo (Settings → brand logo upload).
insert into storage.buckets (id, name, public)
values ('brand', 'brand', true)
on conflict (id) do nothing;

-- storage.objects already has RLS enabled by default in every Supabase
-- project — only policies are added here, never `alter table ... enable
-- row level security` on a system table.
create policy brand_bucket_public_read on storage.objects
  for select
  to public
  using (bucket_id = 'brand');

create policy brand_bucket_staff_write on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'brand' and public.fn_is_verus_staff());

create policy brand_bucket_staff_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'brand' and public.fn_is_verus_staff())
  with check (bucket_id = 'brand' and public.fn_is_verus_staff());

create policy brand_bucket_staff_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'brand' and public.fn_is_verus_staff());
