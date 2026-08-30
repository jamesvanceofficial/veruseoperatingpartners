-- Stage 10 — Projects and Tasks. Additive to the Stage-1 schema
-- (0025/0026), which defined both tables but never shipped a UI, and
-- never linked them to build packages/phases/scope items/categories.
--
-- due_date: the 0025 migration already has target_end_date/actual_end_date
-- columns that were never used anywhere in the app (Projects never shipped
-- a UI before this stage). Rather than silently repurpose target_end_date
-- under a new meaning — same reasoning as build_packages.handover_date in
-- Stage 9 — this adds a clearly-named due_date instead and leaves the two
-- old columns as unused leftovers.
alter table public.projects
  add column priority text not null default 'medium',
  add column build_package_phase_id uuid references public.build_package_phases(id) on delete set null,
  add column category_id uuid references public.assessment_categories(id) on delete set null,
  add column due_date date;

alter table public.projects
  add constraint projects_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'));

create index idx_projects_build_package on public.projects(build_package_id);
create index idx_projects_phase on public.projects(build_package_phase_id);
create index idx_projects_category on public.projects(category_id);

-- notes: requested field the original 0026 migration didn't have.
-- scope_item_id: the link that keeps a generated task's status and its
-- build-package scope item's status from ever disagreeing (Stage 10
-- requirement 6) — see updateTaskStatus()/updateScopeItemStatus() in
-- tasks/data.ts and buildPackages/data.ts.
alter table public.tasks
  add column notes text,
  add column scope_item_id uuid references public.build_package_scope_items(id) on delete set null;

create index idx_tasks_scope_item on public.tasks(scope_item_id);
