-- Stage 11 — Meetings and Accountability. Additive to the Stage-1 schema
-- (0027/0028/0029), which defined meetings/meeting_attendees/
-- meeting_action_items but never shipped a UI, and never linked meetings
-- to build packages.
--
-- meeting_attendees and meeting_action_items already matched this stage's
-- requirements exactly (contact_id/profile_id/display_name; description/
-- assignee/due_date/status/linked_task_id) — no changes needed to either.

alter table public.meetings
  add column build_package_id uuid references public.build_packages(id) on delete set null,
  add column follow_up_date date;

create index idx_meetings_build_package on public.meetings(build_package_id);

-- Replaces the original four-value placeholder set (discovery/check_in/
-- qbr/internal) with the nine real meeting types this stage specifies.
-- Table is empty in production (Meetings never shipped a UI before this
-- stage) so this is a straight replacement, not a data migration.
alter table public.meetings
  drop constraint meetings_type_check;

alter table public.meetings
  add constraint meetings_type_check
    check (meeting_type in (
      'discovery_call', 'assessment_review', 'build_kickoff',
      'weekly_client_meeting', 'internal_verus_review',
      'monthly_business_review', 'support_review', 'build_review',
      'sop_systems_review'
    ));
