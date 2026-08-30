export const MEETING_TYPES = [
  "discovery_call",
  "assessment_review",
  "build_kickoff",
  "weekly_client_meeting",
  "internal_verus_review",
  "monthly_business_review",
  "support_review",
  "build_review",
  "sop_systems_review",
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  discovery_call: "Discovery Call",
  assessment_review: "Assessment Review",
  build_kickoff: "Build Kickoff",
  weekly_client_meeting: "Weekly Client Meeting",
  internal_verus_review: "Internal VERUS Review",
  monthly_business_review: "Monthly Business Review",
  support_review: "Support Review",
  build_review: "Build Review",
  sop_systems_review: "SOP and Systems Review",
};

/** Internal-facing types read differently from client-facing ones — a quick visual cue on the list. */
export const MEETING_TYPE_TONE: Record<MeetingType, "neutral" | "gold" | "green"> = {
  discovery_call: "gold",
  assessment_review: "gold",
  build_kickoff: "gold",
  weekly_client_meeting: "green",
  internal_verus_review: "neutral",
  monthly_business_review: "green",
  support_review: "green",
  build_review: "green",
  sop_systems_review: "green",
};

export const ATTENDEE_KINDS = ["contact", "staff", "guest"] as const;
export type AttendeeKind = (typeof ATTENDEE_KINDS)[number];

export const ACTION_ITEM_STATUSES = ["open", "in_progress", "complete", "cancelled"] as const;
export type ActionItemStatus = (typeof ACTION_ITEM_STATUSES)[number];

export const ACTION_ITEM_STATUS_LABELS: Record<ActionItemStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  complete: "Complete",
  cancelled: "Cancelled",
};

export const ACTION_ITEM_STATUS_TONE: Record<ActionItemStatus, "neutral" | "gold" | "green" | "red"> = {
  open: "neutral",
  in_progress: "gold",
  complete: "green",
  cancelled: "red",
};

export type RelatedRecordType = "opportunity" | "build_package" | "project";
export const RELATED_RECORD_TYPES: RelatedRecordType[] = ["opportunity", "build_package", "project"];
export const RELATED_RECORD_TYPE_LABELS: Record<RelatedRecordType, string> = {
  opportunity: "Opportunity",
  build_package: "Build Package",
  project: "Project",
};
