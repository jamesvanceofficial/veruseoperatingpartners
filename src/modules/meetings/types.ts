import type { MeetingType, ActionItemStatus } from "./labels";

export type Meeting = {
  id: string;
  org_id: string | null;
  opportunity_id: string | null;
  build_package_id: string | null;
  project_id: string | null;
  title: string;
  meeting_type: MeetingType;
  scheduled_at: string | null;
  agenda: string | null;
  notes: string | null;
  decisions: string | null;
  follow_up_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingAttendee = {
  id: string;
  meeting_id: string;
  contact_id: string | null;
  profile_id: string | null;
  display_name: string | null;
};

/** What the form submits — never a raw DB row, since a row can only be resolved (name-wise) after insert. */
export type AttendeeInput = { kind: "contact" | "staff" | "guest"; value: string };

export type MeetingActionItem = {
  id: string;
  meeting_id: string;
  description: string;
  assignee: string | null;
  due_date: string | null;
  status: ActionItemStatus;
  linked_task_id: string | null;
};

export type MeetingListRow = {
  id: string;
  org_id: string | null;
  orgName: string | null;
  title: string;
  meeting_type: MeetingType;
  scheduled_at: string | null;
  attendeeCount: number;
  openActionItemCount: number;
};

export type MeetingDetail = {
  meeting: Meeting;
  orgName: string | null;
  /** e.g. "Opportunity: New Website Build" — whichever of opportunity/build_package/project is set, resolved to a display name. Null if none. */
  relatedLabel: string | null;
  attendees: { id: string; name: string; kind: "contact" | "staff" | "guest" }[];
  actionItems: (MeetingActionItem & { assigneeName: string | null })[];
  createdByName: string | null;
};
